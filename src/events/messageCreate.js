const { Events } = require("discord.js");
const { checkAccessMiddleware } = require("../middleware/accessControl");

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Check access control for prefix commands
    const isAllowed = await checkAccessMiddleware(message, message.client);
    if (!isAllowed) return;
    
    // !stopraid command removed - raid is now single batch per button click
  },
};
