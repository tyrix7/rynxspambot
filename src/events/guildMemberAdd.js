const { Events } = require("discord.js");
const { clearUserCache } = require("../middleware/accessControl");

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    console.log(`[Event] Member joined guild: ${member.user.tag} (${member.id})`);
    
    // Clear access control cache for this user immediately
    clearUserCache(member.id);
    
    // Preemptively force-fetch the member to populate the Discord client's cache
    try {
      await member.guild.members.fetch({ user: member.id, force: true });
      console.log(`[Event] Preemptively fetched joined member: ${member.id}`);
    } catch (err) {
      console.error(`[Event] Failed to preemptively fetch joined member:`, err);
    }
  },
};
