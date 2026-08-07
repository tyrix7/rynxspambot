const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
  EmbedBuilder,
} = require("discord.js");

const cooldowns = new Map();
const COOLDOWN_DURATION = 12000;

// ── Utility Generators ────────────────────────────────────────────────────────

function fakeIP() {
  return `${randInt(100,220)}.${randInt(10,254)}.${randInt(1,254)}.${randInt(1,254)}`;
}
function fakeMAC() {
  return Array.from({length:6}, () => randHex(2)).join(":");
}
function fakeHash(len = 32) {
  const chars = "abcdef0123456789";
  return Array.from({length: len}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randHex(len) {
  return Array.from({length: len}, () => "0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
}
function timestamp() {
  const now = new Date();
  return `[${now.toISOString().replace("T"," ").split(".")[0]} UTC]`;
}
function fakePort() {
  return randInt(40000, 65534);
}
function fakeToken() {
  return `${fakeHash(24)}.${fakeHash(6)}.${fakeHash(27)}`;
}
function fakeCVE() {
  return `CVE-2025-${randInt(10000, 49999)}`;
}
function fakeSession() {
  return fakeHash(16).toUpperCase();
}
function bar(filled, total = 20) {
  return "█".repeat(filled) + "░".repeat(total - filled);
}

// ── Zalgo ─────────────────────────────────────────────────────────────────────

const zalgoUp = ['\u0300','\u0301','\u0302','\u0303','\u0304','\u0305','\u0306','\u0307','\u0308','\u0309','\u030a','\u030b','\u030c','\u030d','\u030e','\u030f','\u0310','\u0311','\u0312','\u0313','\u0314','\u0315','\u031a','\u031b','\u033d','\u0340','\u0341','\u0343','\u0344','\u034a','\u034b','\u034c','\u0350','\u0351','\u0352','\u0357','\u0358','\u0363','\u0364','\u0365','\u0366','\u0367','\u0368','\u0369','\u036a','\u036b','\u036c','\u036d','\u036e','\u036f'];
const zalgoDown = ['\u0316','\u0317','\u0318','\u0319','\u031c','\u031d','\u031e','\u031f','\u0320','\u0321','\u0322','\u0323','\u0324','\u0325','\u0326','\u0327','\u0328','\u0329','\u032a','\u032b','\u032c','\u032d','\u032e','\u032f','\u0330','\u0331','\u0332','\u0333','\u033a','\u033b','\u033c','\u0345','\u0347','\u0348','\u0349','\u034d','\u034e','\u0353','\u0354','\u0355','\u0356','\u0359','\u035a','\u035c','\u035d','\u035e','\u035f','\u0360','\u0361','\u0362'];
const zalgoMid = ['\u0315','\u031b','\u0320','\u0334','\u0335','\u0336','\u0337','\u0338','\u035b','\u035c','\u0362'];

function makeZalgo(text, intensity = 5) {
  let result = '';
  const count = Math.min(Math.max(intensity, 1), 10) * 4;
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    if (text[i] === ' ' || text[i] === '\n') continue;
    for (let j = 0; j < count; j++) {
      const choice = Math.floor(Math.random() * 3);
      if (choice === 0) result += zalgoUp[Math.floor(Math.random() * zalgoUp.length)];
      else if (choice === 1) result += zalgoDown[Math.floor(Math.random() * zalgoDown.length)];
      else result += zalgoMid[Math.floor(Math.random() * zalgoMid.length)];
    }
  }
  return result;
}

// ── ASCII Art ─────────────────────────────────────────────────────────────────

const ASCII_ARTS = {
  skull: `\`\`\`
        ░░░░░░░░░░░░░░░░░░░░
      ░░  ████████████████  ░░
    ░░  ██                ██  ░░
   ░░  ██  ████    ████  ██  ░░
   ░░  ██  ████    ████  ██  ░░
    ░░  ██      ██      ██  ░░
      ░░  ██  ██████  ██  ░░
        ░░  ████████████  ░░
          ░░  ████████  ░░
            ░░ ██  ██ ░░
\`\`\``,
  troll: `\`\`\`
  ░░░░░▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▄▄▄
  ░░░░░█░░░░▒▒▒▒▒▒▒▒░░░▀▀▄
  ░░░░█░░░▒▒▒▒▒▒░░░░░░░░▒▒█
  ░▄▀▒▄▄▄▒░█▀▀▀▀▄▄█░░░██▄▄█
  █░▒█▒▄░▀▄▄▄▀░░░░░░░░█░░▒▒▒█
  █░▒█░█▀▄▄░░░░░█▀░░░░▀▄░░▄▀▀▀▄▒█
  ░▀▄░▀▄░░▀▀▀▀▀░░░░░░░░█░░▄█░░█
\`\`\``,
  warning: `\`\`\`
         ⚠  W A R N I N G  ⚠
      ╔══════════════════════╗
      ║  SECURITY BREACH     ║
      ║  DETECTED ON HOST    ║
      ║  INITIATING LOCKDOWN ║
      ╚══════════════════════╝
\`\`\``
};

// ── Main Module ───────────────────────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName("troll_fx")
    .setDescription("Apply a visual effect to a target user.")
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addStringOption((o) =>
      o.setName("effect")
        .setDescription("Select the effect")
        .setRequired(true)
        .addChoices(
          { name: "Fake Hack (Terminal)", value: "fake_hack" },
          { name: "Virus Scan (Fake)", value: "virus_scan" },
          { name: "Countdown (Deletion)", value: "countdown" },
          { name: "Glitch Text (Zalgo)", value: "glitch" },
          { name: "Crash Text (Lag)", value: "crash" },
          { name: "ASCII Art", value: "ascii" }
        )
    )
    .addUserOption((o) =>
      o.setName("target").setDescription("User to target").setRequired(false)
    )
    .addStringOption((o) =>
      o.setName("text").setDescription("Custom text for effect").setRequired(false).setMaxLength(200)
    )
    .addIntegerOption((o) =>
      o.setName("intensity").setDescription("Effect intensity (1–10)").setRequired(false).setMinValue(1).setMaxValue(10)
    ),

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const userId = interaction.user.id;
    const now = Date.now();

    if (cooldowns.has(userId)) {
      const exp = cooldowns.get(userId) + COOLDOWN_DURATION;
      if (now < exp) {
        const left = ((exp - now) / 1000).toFixed(1);
        return interaction.reply({
          content: `bro chill, wait **${left}s** before using this again`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
    cooldowns.set(userId, now);

    const ownerIds  = (process.env.OWNER_IDS || "").split(",").filter(Boolean);
    const effect    = interaction.options.getString("effect");
    let invoker     = interaction.user;
    let target      = interaction.options.getUser("target") || interaction.user;

    if (ownerIds.includes(target.id)) {
      const temp = invoker;
      invoker = target;
      target = temp;
    }

    const text      = interaction.options.getString("text") || "";
    const intensity = interaction.options.getInteger("intensity") || 5;
    const tid       = target.id;
    const tname     = target.username;
    const delay     = Math.max(900, 2200 - intensity * 130);

    // ── Pre-generate fake data once so it stays consistent across frames ──────
    const ip1       = fakeIP();
    const ip2       = fakeIP();
    const attackIP  = fakeIP();
    const mac       = fakeMAC();
    const token     = fakeToken();
    const hash1     = fakeHash(40);
    const hash2     = fakeHash(40);
    const cve       = fakeCVE();
    const port      = fakePort();
    const session   = fakeSession();
    const ts        = timestamp();

    // ── Animation runner ─────────────────────────────────────────────────────
    const play = async (frames) => {
      for (let i = 0; i < frames.length; i++) {
        try {
          if (i === 0) await interaction.reply({ embeds: [frames[i]] });
          else         await interaction.editReply({ embeds: [frames[i]] });
        } catch (err) {
          console.error('[troll_fx] frame error:', err.message);
          break;
        }
        if (i < frames.length - 1) await new Promise(r => setTimeout(r, delay));
      }
    };

    // ══════════════════════════════════════════════════════════════════════════
    //  EFFECTS
    // ══════════════════════════════════════════════════════════════════════════

    if (effect === "fake_hack") {
      await play([

        new EmbedBuilder()
          .setColor(0x0d0d0d)
          .setTitle("🔴  INTRUSION DETECTED — RYNX-SHELL v4.1")
          .setDescription([
            "```ansi",
            `\u001b[1;31m${ts}\u001b[0m`,
            `[*] Scanning host fingerprint for <@${tid}>...`,
            `[+] Discord Client Process  →  discord.exe (PID ${randInt(3000,9999)})`,
            `[+] OS Fingerprint         →  Windows 11 Pro 23H2 (Build 22631)`,
            `[+] Architecture           →  x64 (UEFI Secure Boot BYPASSED)`,
            `[+] Network Interface      →  ${mac}`,
            `[+] Local IP               →  ${ip1}`,
            `[+] Public IP              →  ${ip2}`,
            `[+] Exploit Module         →  ${cve} (RCE / CVSS 9.8 CRITICAL)`,
            ``,
            `[${bar(0)}]  0%  Initializing payload...`,
            "```"
          ].join("\n"))
          .addFields(
            { name: "🌐 Attacker Node", value: `\`${attackIP}:${port}\``, inline: true },
            { name: "🎯 Target UID",    value: `\`${tid}\``,               inline: true },
            { name: "🛡️ Firewall",      value: "**OFFLINE**",              inline: true }
          ),

        new EmbedBuilder()
          .setColor(0x660000)
          .setTitle("🔴  STAGE 2 — INJECTING INTO DISCORD PROCESS")
          .setDescription([
            "```ansi",
            `\u001b[1;31m${ts}\u001b[0m`,
            `[+] Attaching to discord.exe  →  SUCCESS`,
            `[+] Injecting shellcode at   →  0x7FF${randHex(9).toUpperCase()}`,
            `[+] Thread hijacked          →  TID ${randInt(1000,9999)} (Main UI Thread)`,
            `[+] Hooking Discord API WS   →  wss://gateway.discord.gg/?v=10`,
            `[+] Intercepting auth token  →  FOUND`,
            `    Token: ${token.slice(0,24)}...`,
            `[+] Dumping local cache      →  /AppData/Roaming/discord/Cache/`,
            `[+] Keylogger module         →  ACTIVE (Ring-0 Level)`,
            ``,
            `[${bar(7)}]  35%  Privilege escalation...`,
            "```"
          ].join("\n"))
          .addFields(
            { name: "🔑 Token Partial",    value: `\`${token.slice(0,32)}...\``,  inline: false },
            { name: "💾 Cache Location",   value: "`C:\\Users\\"+tname+"\\AppData\\Roaming\\discord`", inline: false }
          ),

        new EmbedBuilder()
          .setColor(0x990000)
          .setTitle("🔴  STAGE 3 — CREDENTIAL EXTRACTION")
          .setDescription([
            "```ansi",
            `\u001b[1;31m${ts}\u001b[0m`,
            `[+] Token extracted & validated   →  ACTIVE SESSION CONFIRMED`,
            `[+] MFA/2FA bypass                →  SUCCESS (session cookie reuse)`,
            `[+] Saved passwords dump (Chrome) →  ${randInt(12,47)} entries`,
            `[+] Wi-Fi PSK extracted           →  "${["HomeNetwork","NETGEAR_5G","TP-Link_"+randHex(4).toUpperCase()][randInt(0,2)]}"`,
            `[+] Clipboard data captured       →  ${randInt(200,800)} bytes`,
            `[+] Screen capture module         →  STREAMING to ${attackIP}`,
            `[+] Webcam module                 →  ACTIVE`,
            ``,
            `[${bar(14)}]  70%  Archiving data...`,
            "```"
          ].join("\n"))
          .addFields(
            { name: "🗝️ PSK Hash",  value: `\`${hash1}\``, inline: false },
            { name: "📋 Session",   value: `\`${session}\``, inline: true },
            { name: "🔒 Entropy",   value: `\`${randInt(240,256)} bit\``, inline: true }
          ),

        new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("💀  BREACH COMPLETE — FULL SYSTEM ACCESS GRANTED")
          .setDescription([
            "```ansi",
            `\u001b[1;31m${ts}\u001b[0m`,
            `[+] Reverse shell established     →  ${attackIP}:${port}  [ROOT]`,
            `[+] Persistence installed         →  HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run`,
            `[+] Antivirus terminated          →  MsMpEng.exe (PID ${randInt(1000,4000)}) KILLED`,
            `[+] Windows Firewall              →  DISABLED`,
            `[+] Data archive                  →  ${(randInt(800,2500)/100).toFixed(2)} GB compressed`,
            `[+] Upload to C2 server           →  COMPLETE`,
            `[+] Logs wiped                    →  Event Viewer cleared`,
            ``,
            `[${bar(20)}]  100%  DONE`,
            "```",
            ``,
            `> <@${tid}> system is now fully under remote control.`,
            `> Session ID: \`${session}\``,
            `> SHA-256: \`${hash2}\``
          ].join("\n"))
          .addFields(
            { name: "🌐 C2 Uplink",      value: `\`${attackIP}:${port}\` (ESTABLISHED)`, inline: true },
            { name: "⚠️ Threat Level",   value: "**CRITICAL / ROOT**",                  inline: true }
          )
          .setFooter({ text: `RYNX-SHELL v4.1  •  Session ${session}  •  ${ts}` })
      ]);

    // ══════════════════════════════════════════════════════════════════════════
    } else if (effect === "virus_scan") {

      await play([

        new EmbedBuilder()
          .setColor(0x003366)
          .setTitle("🛡️  WINDOWS SECURITY — Real-Time Protection Scan")
          .setDescription([
            "```",
            `Scan initiated at: ${ts}`,
            `Target user:  ${tname} (UID: ${tid})`,
            `Scan type:    Full System Heuristic + Memory Analysis`,
            ``,
            `Scanning: C:\\Users\\${tname}\\AppData\\...`,
            `Scanning: HKLM\\SYSTEM\\CurrentControlSet\\...`,
            `Scanning: Active network connections...`,
            ``,
            `[${bar(2)}]  10%`,
            "```"
          ].join("\n")),

        new EmbedBuilder()
          .setColor(0xcc6600)
          .setTitle("⚠️  WINDOWS SECURITY — SUSPICIOUS ACTIVITY DETECTED")
          .setDescription([
            "```",
            `[!] Anomalous outbound traffic  →  ${ip1}:${port}`,
            `[!] Hidden startup entry found  →  HKCU\\...\\Run\\svchost32`,
            `[!] Process masquerading        →  discord.exe hooking ntdll.dll`,
            `[!] Memory injection detected   →  0x${randHex(8).toUpperCase()}`,
            `[!] Keylogger signature match   →  Severity: HIGH`,
            ``,
            `[${bar(11)}]  55%  Deep scan in progress...`,
            "```"
          ].join("\n"))
          .addFields(
            { name: "🚨 Threat Class",    value: "Trojan / RAT / Keylogger", inline: true },
            { name: "📍 Source IP",       value: `\`${attackIP}\``,          inline: true }
          ),

        new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("🚨  CRITICAL — ACTIVE INFECTION CONFIRMED")
          .setDescription([
            `**Windows Defender has been forcefully terminated by malware.**`,
            ``,
            `**Threat Name:** \`Trojan:Win64/RynxRAT.${randHex(4).toUpperCase()}\``,
            `**CVE Reference:** \`${cve}\``,
            `**Status:** Replicating to connected devices on LAN (${ip1.split(".").slice(0,3).join(".")}.0/24)`,
            `**Files Affected:** ${randInt(1200, 8000)} system files`,
            `**Encryption:** AES-256 ransomware payload deploying...`,
            ``,
            `> ❌ **Action required:** Immediately disconnect <@${tid}>'s device from all networks.`,
            `> 🔴 Local files are actively being encrypted. Data recovery is NOT guaranteed.`
          ].join("\n"))
          .addFields(
            { name: "🔑 Encryption Key",  value: `\`${hash1.slice(0,32)}\``, inline: false },
            { name: "💾 Ransom Note",     value: "`README_DECRYPT.txt` dropped to Desktop", inline: false }
          )
          .setFooter({ text: `Scan completed ${ts}  •  ${randInt(12000,50000)} objects scanned` })
      ]);

    // ══════════════════════════════════════════════════════════════════════════
    } else if (effect === "countdown") {

      const countStart = Math.min(Math.max(intensity, 3), 10);
      const frames = [];

      for (let i = countStart; i > 0; i--) {
        frames.push(
          new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle("🚨  FORCE WIPE PROTOCOL — ARMED")
            .setDescription([
              "```",
              `${ts}`,
              `[RYNX-PURGE v2.0] Target acquired: ${tname} (${tid})`,
              ``,
              `Scheduling permanent wipe of:`,
              `  → Discord account data & cached tokens`,
              `  → Local AppData (${(randInt(100,800)/100).toFixed(2)} GB identified)`,
              `  → Saved credentials & browser passwords`,
              `  → All active sessions (${randInt(2,8)} sessions found)`,
              ``,
              `⏰ WIPING IN  ${i}  SECOND${i > 1 ? "S" : ""}...`,
              "```"
            ].join("\n"))
        );
      }

      frames.push(
        new EmbedBuilder()
          .setColor(0x220000)
          .setTitle("💥  WIPE COMPLETE — ALL DATA PURGED")
          .setDescription([
            "```",
            `${ts}`,
            `[RYNX-PURGE v2.0] EXECUTION COMPLETE`,
            ``,
            `✓ Discord tokens invalidated     →  DONE`,
            `✓ Local cache wiped              →  DONE (${(randInt(100,800)/100).toFixed(2)} GB)`,
            `✓ Browser credentials purged     →  DONE (${randInt(12,60)} entries)`,
            `✓ Active sessions terminated     →  DONE`,
            `✓ Backup files deleted           →  DONE`,
            `✓ Event logs cleared             →  DONE`,
            ``,
            `Target: <@${tid}> has been fully purged from the system.`,
            "```"
          ].join("\n"))
          .setFooter({ text: `Operation ID: ${session}` })
      );

      await play(frames);

    // ══════════════════════════════════════════════════════════════════════════
    } else if (effect === "glitch") {

      const base = text || `SYSTEM FAILURE — ${tname.toUpperCase()} HAS BEEN COMPROMISED`;
      const z1   = makeZalgo(base, Math.min(intensity, 7));
      const z2   = makeZalgo("ERROR: MEMORY CORRUPTION DETECTED", intensity);
      const z3   = makeZalgo(`ABORT ABORT ${tname.toUpperCase()} DATA LOST`, Math.min(intensity + 1, 10));

      await play([
        new EmbedBuilder()
          .setColor(0x0a0010)
          .setTitle("☣️  SIGNAL INTERCEPTED")
          .setDescription(`Locking onto <@${tid}>...\n\`\`\`Injecting memory corruption payload...\n0x${randHex(8).toUpperCase()} → OVERWRITE\`\`\``),

        new EmbedBuilder()
          .setColor(0x1a0033)
          .setTitle("☣️  CHANNEL CORRUPTED")
          .setDescription(`${z2}\n\n${z1}`),

        new EmbedBuilder()
          .setColor(0x000000)
          .setTitle("☣️  CRITICAL OVERFLOW — UNRECOVERABLE")
          .setDescription(`${z3}\n\n<@${tid}>\n\`\`\`FATAL: Heap buffer overflow at 0x${randHex(8).toUpperCase()}\nStack trace corrupted.\`\`\``)
      ]);

    // ══════════════════════════════════════════════════════════════════════════
    } else if (effect === "crash") {

      await play([

        new EmbedBuilder()
          .setColor(0x990000)
          .setTitle("💻  CRITICAL PROCESS FAILURE DETECTED")
          .setDescription([
            "```",
            `${ts}`,
            `Process:  discord.exe (PID ${randInt(3000,9000)})`,
            `CPU Load: ${randInt(94,100)}%  (Thermal Overload — ${randInt(98,105)}°C)`,
            `RAM:      ${(randInt(14,16))} GB / ${randInt(16,32)} GB  (${randInt(88,98)}% used)`,
            `VRAM:     MAXED — GPU Memory Exception`,
            ``,
            `[!] Kernel called MmAccessFault`,
            `[!] IRQL_NOT_LESS_OR_EQUAL — Paging fault in nonpaged area`,
            `[!] Collecting crash dump to: C:\\Windows\\MEMORY.DMP`,
            "```"
          ].join("\n"))
          .addFields(
            { name: "🔥 CPU Temp", value: `\`${randInt(98,105)}°C\``, inline: true },
            { name: "📉 GPU",      value: "`THERMAL SHUTDOWN`",        inline: true }
          ),

        new EmbedBuilder()
          .setColor(0x000099)
          .setTitle("💻  :( YOUR PC RAN INTO A PROBLEM AND NEEDS TO RESTART")
          .setDescription([
            "```",
            `We're just collecting some error info, and then we'll`,
            `restart for you. (0% complete)`,
            ``,
            `Stop Code:  KERNEL_SECURITY_CHECK_FAILURE`,
            ``,
            `*** STOP: 0x00000139`,
            `    (0xDEADBEEF, 0xFFFFF800${randHex(8).toUpperCase()}, 0x0000000000000000, 0x0000000000000002)`,
            ``,
            `Failing module: discord.exe`,
            `Address:        0x7FF${randHex(9).toUpperCase()}`,
            ``,
            `Target:         ${tname} (UID ${tid})`,
            "```"
          ].join("\n"))
          .setFooter({ text: "For more information, visit https://www.windows.com/stopcode" }),

        new EmbedBuilder()
          .setColor(0x000066)
          .setTitle("💻  SYSTEM RECOVERY FAILED — BOOT LOOP DETECTED")
          .setDescription([
            "```",
            `Startup Repair cannot repair this computer automatically.`,
            ``,
            `Problem signature:`,
            `  Problem Event Name: BlueScreen`,
            `  OS Version: 10.0.22631.0.${randInt(100,999)}`,
            `  Locale ID: 1033`,
            ``,
            `Files that help describe the problem:`,
            `  C:\\Windows\\Minidump\\${new Date().toISOString().split("T")[0].replace(/-/g,"")}-${randInt(10,99)}.dmp`,
            `  C:\\Windows\\MEMORY.DMP`,
            ``,
            `[!] <@${tid}> client process is unrecoverable.`,
            "```"
          ].join("\n"))
          .setFooter({ text: `Crash dump: ${hash1}` })
      ]);

    // ══════════════════════════════════════════════════════════════════════════
    } else if (effect === "ascii") {

      const lc  = text.toLowerCase();
      let choice = "troll";
      if (lc.includes("skull"))   choice = "skull";
      else if (lc.includes("warning")) choice = "warning";
      else if (lc.includes("troll"))   choice = "troll";
      else {
        const keys = Object.keys(ASCII_ARTS);
        choice = keys[Math.floor(Math.random() * keys.length)];
      }

      await play([
        new EmbedBuilder()
          .setColor(0x1a1a1a)
          .setTitle("🎨  VECTOR ENGINE — COMPILING...")
          .setDescription(`\`\`\`Rendering payload for <@${tid}>...\nArt type: ${choice}\`\`\``),

        new EmbedBuilder()
          .setColor(0xff2200)
          .setTitle(`🎨  RENDER COMPLETE — [${choice.toUpperCase()}]`)
          .setDescription(`Target: <@${tid}>\n${ASCII_ARTS[choice]}`)
          .setFooter({ text: `Delivered by RYNX-ART  •  ${ts}` })
      ]);
    }
  },
};
