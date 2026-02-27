# PromptCraft
### Turn messy ideas into precision AI prompts
[README.md](https://github.com/user-attachments/files/25612561/README.md)

> You don't need to know how to write prompts. Just say what you mean — PromptCraft translates it into something any AI will understand perfectly.

---

## The Problem

Most people don't get great results from AI because of *how* they ask, not because the AI is bad. If English isn't your first language, if you think in multiple languages at once, or if you just don't know "prompt engineering" — you're leaving most of the AI's power on the table.

PromptCraft fixes that.

---

## What It Does

Paste in your rough, unpolished thought. PromptCraft rewrites it into a structured, optimized prompt — and gets smarter about *you* every time you use it.

**Input:**
> *"i need write email to boss about i am late project because team no cooperate and i want ask more time but not look bad"*

**Output:**
> *"You are a professional business writer. Draft a diplomatic email to my manager requesting a project deadline extension. The delay was caused by team coordination challenges — frame this constructively without placing blame. Tone: professional and solution-focused. Include: acknowledgment of the delay, brief explanation, a proposed new timeline, and your commitment to delivery. Keep it under 150 words."*

---

## Features

| Feature | Description |
|---|---|
| 🧠 **Learns your patterns** | Tracks your task types, output styles, and context preferences across sessions |
| 📚 **Prompt history** | Saves your last 50 prompts — browse, reload, or remix any of them |
| ⭐ **Smart defaults** | After 3 sessions, auto-selects your most-used task type and style |
| 💡 **Keyword suggestions** | Surfaces your recurring context words as one-click chips |
| 📊 **Intelligence meter** | Shows how well the app has learned your style (grows with each session) |
| 🌐 **Multi-language friendly** | Handles non-native English patterns without losing your intent |
| ↕ **Before/After view** | Compare your raw input vs the optimized prompt side by side |

---

## Files

```
promptcraft/
├── prompt-builder.jsx                  # v1 — core prompt builder, no memory
└── prompt-builder_Optimized learning.jsx  # v2 — full memory + pattern learning
```

Use **v2** (`prompt-builder_Optimized learning.jsx`) for the full experience.

---

## How to Run Locally

**Requirements:** Node.js, a free [Anthropic API key](https://console.anthropic.com)

```bash
# 1. Create a React app
npx create-react-app promptcraft
cd promptcraft

# 2. Drop in the component
cp "prompt-builder_Optimized learning.jsx" src/App.jsx

# 3. Start the dev server
npm start
```

The app opens at `http://localhost:3000`

---

## API Key

This app calls the [Anthropic API](https://www.anthropic.com) directly. You'll need your own API key from [console.anthropic.com](https://console.anthropic.com).

> ⚠️ Never commit your API key to a public repo. Use environment variables in production.

---

## How the Learning Works

PromptCraft uses `window.storage` (persistent key-value storage) to build a personal profile across sessions:

- **Task frequency** → learns which task types you use most
- **Style preference** → tracks your preferred output format
- **Context keywords** → extracts recurring terms from your context notes
- **Session count** → personalization activates at session 3, fully tuned by session 20

After 3 sessions, the AI system prompt is dynamically updated with your profile — so it knows your defaults before you type anything.

---

## Built With

- [React](https://react.dev) — UI framework
- [Anthropic Claude API](https://www.anthropic.com) — prompt optimization engine
- `window.storage` — persistent cross-session memory
- Pure CSS-in-JS — no external UI libraries

---

## License

CC0-1.0 — public domain, use it however you want.

---

*Built with Claude · [Anthropic](https://www.anthropic.com)*
