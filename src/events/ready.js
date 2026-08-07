const { Events, PresenceUpdateStatus, ActivityType } = require("discord.js");
const { startCacheRefresh } = require("../middleware/guildRestriction");
const { preCacheMainGuild } = require("../middleware/accessControl");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[+] Logged in as ${client.user.tag}. Time to cause some absolute chaos.`);

    // Pre-cache members of the main guild to make access checks instant
    preCacheMainGuild(client);

    // Start guild member cache refresh
    startCacheRefresh(client);

    // STATUS: online | idle | dnd | invisible
    // TYPE  : Playing | Watching | Listening | Competing
    client.user.setPresence({
      status: PresenceUpdateStatus.DoNotDisturb,   // ← status yahan badlo
      activities: [{
        name: "〆 Rʏɴx ᴏᴡɴᴢ ʏᴏᴜʀ sᴏᴜʟ",          // ← text yahan badlo
        type: ActivityType.Playing,                // ← type yahan badlo
      }]
    });
  },
};
