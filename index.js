require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

// Read the command files
const commandFiles = fs
  .readdirSync(path.join(__dirname, "src/commands"))
  .filter((file) => file.endsWith(".js"));

// Loading commands
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);

  if (!command.data) {
    console.error(`Command in ${file} does not have 'data' property.`);
    continue; // Skip commands that are missing 'data'
  }

  client.commands.set(command.data.name, command);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction); // Execute the command
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing that command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.OAUTH_TOKEN);
