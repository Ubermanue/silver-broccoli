const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { handleMessage } = require('./handles/handleMessage');
const { handlePostback } = require('./handles/handlePostback');

const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'pagebot';
const PAGE_ACCESS_TOKEN = fs.readFileSync('token.txt', 'utf8').trim();
const COMMANDS_PATH = path.join(__dirname, 'commands');

// Webhook verification
app.get('/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
});

// Webhook event handling
app.post('/webhook', (req, res) => {
  const { body } = req;

  if (body.object === 'page') {
    body.entry?.forEach(entry => {
      entry.messaging?.forEach(event => {
        if (event.message) {
          handleMessage(event, PAGE_ACCESS_TOKEN);
        } else if (event.postback) {
          handlePostback(event, PAGE_ACCESS_TOKEN);
        }
      });
    });

    return res.status(200).send('EVENT_RECEIVED');
  }

  res.sendStatus(404);
});

// Load all command files from the "commands" directory and add a hyphen to the name
const loadCommands = () => fs.readdirSync(COMMANDS_PATH)
  .filter(file => file.endsWith('.js'))
  .map(file => {
    const command = require(path.join(COMMANDS_PATH, file));
    return command.name && command.description ? { name: `-${command.name}`, description: command.description } : null;
  })
  .filter(Boolean);

// Load Messenger Menu Commands dynamically from command files
const loadMenuCommands = async () => {
  const commands = loadCommands();

  try {
    await axios.post(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`, {
      commands: [{ locale: "default", commands }],
    }, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Menu commands loaded successfully.");
  } catch (error) {
    console.error("Error loading menu commands:", error);
  }
};

// Function to reload menu commands
const reloadMenuCommands = async () => {
  try {
    await axios.delete(`https://graph.facebook.com/v21.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}&fields=commands`, {
      headers: { "Content-Type": "application/json" }
    });

    console.log("Menu commands deleted successfully.");

    await loadMenuCommands();
  } catch (error) {
    console.error("Error reloading menu commands:", error);
  }
};

// Watch for changes in the commands directory
fs.watch(COMMANDS_PATH, (eventType, filename) => {
  if ((eventType === 'change' || eventType === 'rename') && filename.endsWith('.js')) {
    reloadMenuCommands();
  }
});

// Server initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Load Messenger Menu Commands asynchronously after the server starts
  await loadMenuCommands();
});