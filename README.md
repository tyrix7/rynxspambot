# Rynex™ — Discord Bot

> A powerful Discord slash command bot with chaos-themed utilities, troll effects, and server tools.

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
