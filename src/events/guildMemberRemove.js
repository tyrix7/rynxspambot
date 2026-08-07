const { Events } = require("discord.js");
const { clearUserCache } = require("../middleware/accessControl");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    console.log(`[Event] Member left guild: ${member.user.tag} (${member.id})`);
    
    // Clear access control cache for this user immediately
    clearUserCache(member.id);
  },
};
