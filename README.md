# Rynex Spam N Raid Bot

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=24&duration=2600&pause=700&center=true&vCenter=true&width=760&lines=Rynex+Bot;Slash+commands%2C+mock+messages%2C+troll+effects;Use+carefully.+Discord+rules+matter." alt="Rynex animated title" />
</p>

<p align="center">
  <a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white"></a>
  <a href="https://discord.js.org/"><img alt="discord.js" src="https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-MIT-111111?style=for-the-badge"></a>
  <a href="https://discord.gg/S2QBAxfmkR"><img alt="Discord" src="https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white"></a>
</p>

Rynex is a Discord slash-command bot built with `discord.js`. It has utility commands, embed tools, fake message rendering, DM/channel test commands, and visual troll-style effects.

This project has a chaotic vibe, but use your brain: some commands can annoy people, trigger moderation systems, or break Discord server rules if misused.

## Important Warning

This bot can be against Discord rules if you use it for spam, harassment, raids, unwanted DMs, or anything done without permission.

Use it only in servers you own, test servers, or places where everyone involved has clearly agreed. If your account, bot, server, or application gets limited, banned, reported, rate-limited, nuked, cooked, or otherwise messed up, that is on the person running it.

This repository is provided as-is. The repo owner is not responsible for damage, bans, reports, moderation action, Discord ToS issues, or any misuse. Samajh ja bhai: tool hai, zimmedari teri.

---

## ✨ Features

| Command | Description |
|---|---|
| `/spam` | Spam messages in a channel with custom settings |
| `/embed` | Send fully customized embedded messages |
| `/hello` | Test command to verify the bot is alive |
| `/ghost_ping` | Ghost ping a user (ping then instantly delete) |
| `/blame` | Blame a user with a custom reason |
| `/raid` | Channel raid utility |
| `/dm_raid` | DM raid utility |
| `/troll_fx` | Ultra-realistic visual troll effects (Fake Hack, Virus Scan, Countdown, Glitch, Crash, ASCII Art) |
| `/fuck` | you know it very well |Send invisible messages to create a fake clean chat effect.
| `/cleardm` | Send invisible messages to create a fake clean chat effect. |

---

## 🛠️ Prerequisites

- **Node.js** v18.x or higher
- **npm** package manager
- A Discord Bot Token with the following intents enabled:
  - `GUILDS`
  - `GUILD_MEMBERS`
  - `GUILD_MESSAGES`
  - `MESSAGE_CONTENT`

---

## 🚀 Installation

**1. Clone the repo:**
```bash
git clone https://github.com/Tejas-369-darkoo/rynxspambot.git
cd rynxspambot
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up your environment:**
```bash
cp .env.example .env
```

Then fill in `.env`:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
MAIN_GUILD_ID=your_guild_id_here
```

---

## ⚙️ Usage

**Deploy slash commands to Discord:**
```bash
npm run deploy-commands
```

**Start the bot:**
```bash
npm start
```

**Dev mode (auto-restart on file changes):**
```bash
npm run dev
```

---

## 🎭 `/troll_fx` Effects

| Effect | What it does |
|---|---|
| **Fake Hack (Terminal)** | Multi-frame animated terminal showing fake exploit injection, credential dump, and reverse shell — uses target's real username & ID |
| **Virus Scan (Fake)** | Fake Windows Defender scan finding a fake trojan/ransomware |
| **Countdown (Deletion)** | Countdown timer followed by a "force wipe complete" report |
| **Glitch Text (Zalgo)** | Corrupts text with Zalgo unicode characters at adjustable intensity |
| **Crash Text (Lag)** | BSOD + kernel panic + boot loop crash sequence |
| **ASCII Art** | Renders skull, troll face, or warning sign in a code block |

> All effects are **purely visual**. Nothing is actually executed on any device.

---

## 📁 Project Structure

```
src/
├── commands/          # Slash command handlers
│   ├── spam.js
│   ├── embed.js
│   ├── hello.js
│   ├── ghost_ping.js
│   ├── blame.js
│   ├── raid.js
│   ├── dm_raid.js
|   ├── cleardm.js
|   ├── fuck.js
│   └── troll_fx.js
├── events/            # Discord event handlers
│   ├── guildMemberAdd.js
|   ├── guildMemberRemove.js
|   ├── interactionCreate.js
|   ├── messageCreate.js
│   └── ready.js
├── middleware/        # Access control & guild restriction
│   ├── accessControl.js
│   └── guildRestriction.js
├── deploy-commands.js # Slash command registration script
└── index.js           # Bot entry point
```

---

## 🔒 Access Control

- Only members of the configured `MAIN_GUILD_ID` server can use commands.
- Member checks use **live Discord API fetches** (`force: true`) — no stale cache.
- New joins are detected via `guildMemberAdd` event for instant access.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👤 Author

Built by [Tejas](https://github.com/Tejas-369-darkoo) for **Rynex™**
