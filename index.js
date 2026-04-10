require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Events } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

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

// ----- Ready Log -----
client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);
});
console.log("Mencoba login..."); // Tambahkan ini
// ----- Login -----
client.login(process.env.TOKEN);