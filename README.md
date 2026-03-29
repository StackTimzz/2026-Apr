# Virgil — Privacy Policy Analyzer

No corporations spared.

## Setup

1. Install dependencies:
```
npm install
```

2. Run locally:
```
npm run dev
```

## Deployment (Vercel)

1. Push this repo to GitHub
2. Connect repo to Vercel
3. Add environment variable in Vercel dashboard:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (sk-ant-...)
4. Deploy

## Project Structure

```
virgil/
├── api/
│   └── analyze.js      # Backend proxy — keeps API key secret
├── src/
│   ├── App.jsx         # Main Virgil application
│   └── main.jsx        # React entry point
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```
