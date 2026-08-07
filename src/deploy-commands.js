require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.TOKEN);

let clientId = process.env.CLIENT_ID;
if (!clientId && process.env.TOKEN) {
  try {
    clientId = Buffer.from(process.env.TOKEN.split('.')[0], 'base64').toString('utf-8');
  } catch (err) {
    console.error("[!] Failed to decode CLIENT_ID from TOKEN:", err.message);
  }
}

(async () => {
  try {
    if (!clientId) {
      throw new Error("CLIENT_ID is missing and could not be parsed from TOKEN.");
    }

    console.log(
      `[?] Initializing... Uploading ${commands.length} annoying slash commands for application ${clientId}...`
    );

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(
      `[+] Loaded ${data.length} slash commands successfully. Ready to spam.`
    );
  } catch (error) {
    console.error(error);
  }
})();
