require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandFiles = fs
  .readdirSync(path.join(__dirname, "../commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  // Push the entire command data (using .data) into the commands array
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(""); // Use environment variable for the token

(async () => {
  try {
    console.log("Started refreshing application (/) commands globally.");

    // Register the commands globally
    await rest.put(Routes.applicationCommands("1306500766231564348"), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands globally.");
  } catch (error) {
    console.error(error);
  }
})();
