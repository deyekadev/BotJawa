require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Events, Collection } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Setup Collection untuk menyimpan command
client.commands = new Collection();

// ----- Auto Load Commands -----
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Command loaded: ${file}`);
  } else {
    console.log(`⚠️ Command invalid: ${file}`);
  }
}

// ----- Auto Load Events -----
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);

  if (event.name && event.execute) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`✅ Event loaded: ${file}`);
  } else {
    console.log(`⚠️ File event invalid: ${file}`);
  }
}

// ----- Login -----
client.login(process.env.TOKEN);