# ⚗️ LabTracker — Personal Experiment Lab

> Day 16 of [#30AppIn30Days](https://twitter.com/search?q=%2330AppIn30Days) 🚀

A lightweight **Progressive Web App** for running self-improvement experiments on yourself — like a personal scientist. Track habits, break patterns, build streaks. Everything stored **100% locally** on your device. No backend, no account, no cloud.

---

## ✨ Features

### 🧪 Create Experiments
- Title, description, duration (days), start date
- Categories: Health, Productivity, Mind, Social, Finance, Custom
- Difficulty levels: Easy / Medium / Hard (with XP)
- Quick presets: "No Sugar", "Wake up at 6 AM", etc.

### 📊 Dashboard
- Active experiments with animated progress bars
- Day X of Y counter
- Quick ✅ Win / ❌ Fail buttons — no need to open the detail view
- Pending check-ins banner for today

### 📅 Daily Check-in
- Log each day as Success or Failed
- Add an optional note per day
- Duplicate entries for the same day are prevented

### 📈 Experiment Detail
- Calendar grid showing every day's status at a glance
- Bar chart of daily performance (last 14 days)
- Streak counter 🔥 + longest streak
- Notes history tab
- Smart local insights: weekday vs weekend performance, early failure patterns

### 🏁 Completion Summary
- Total success/fail days, success %
- Share result as a downloadable image card (html2canvas)
- Restart experiment with one tap

### 🧠 Smart Insights (no AI — pure logic)
- "You perform better on weekdays"
- "Most failures happen after Day 3"
- "X-day streak — keep it going!"
- Cross-experiment: success rate by category, best day of week

### 🏆 Streak Badges
- 🔥 3-Day Streak · ⚡ 1-Week · 💎 2-Week · 🏆 21-Day · 👑 30-Day Legend

### 📦 Data Management
- Export all data as JSON
- Import from JSON backup
- Clear all data option

---

## 📱 PWA — Install on Mobile

### Android (Chrome)
1. Open the app in Chrome
2. Tap the **⋮ menu → Add to Home Screen**
3. App opens in standalone mode — no browser UI

### iOS (Safari)
1. Open in Safari
2. Tap **Share → Add to Home Screen**
3. Full screen, standalone experience

**Features when installed:** Works offline · No browser chrome · Home screen icon · Splash screen

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Storage | IndexedDB (`idb`) |
| Charts | Recharts |
| Share image | html2canvas |
| Icons | Lucide React |
| PWA | Service Worker + Web App Manifest |
| Deploy | GitHub Pages via GitHub Actions |

---

## 🚀 Run Locally

```bash
git clone https://github.com/YOUR_USERNAME/lab-tracker.git
cd lab-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

```bash
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

---

## 📁 Project Structure

```
lab-tracker/
├── src/
│   ├── App.jsx                       # Root + SPA routing
│   ├── main.jsx                      # Entry, SW registration
│   ├── index.css                     # Global styles + animations
│   ├── components/
│   │   ├── BottomNav.jsx             # Mobile bottom navigation
│   │   ├── ExperimentCard.jsx        # Card with progress + quick-log
│   │   └── CreateExperimentModal.jsx # Bottom sheet form
│   ├── pages/
│   │   ├── Dashboard.jsx             # Home: stats + active experiments
│   │   ├── ExperimentsPage.jsx       # All experiments + search/filter
│   │   ├── ExperimentDetail.jsx      # Detail, check-in, timeline, chart
│   │   ├── InsightsPage.jsx          # Cross-experiment analytics
│   │   └── SettingsPage.jsx          # Export, import, install, clear
│   ├── hooks/
│   │   └── useExperiments.jsx        # Global state via React Context
│   └── utils/
│       ├── storage.js                # IndexedDB wrapper
│       └── experiments.js            # Logic: progress, streaks, insights
├── public/
│   ├── sw.js                         # Service Worker
│   └── manifest.json                 # PWA manifest
├── .github/
│   └── workflows/
│       └── deploy.yml                # Auto-deploy to GitHub Pages
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 💾 Data Structure

```json
{
  "id": "exp_1743465600000_abc123",
  "title": "No Sugar",
  "duration": 30,
  "startDate": "2026-04-01",
  "category": "health",
  "difficulty": "hard",
  "status": "active",
  "logs": [
    { "date": "2026-04-01", "status": "success", "note": "Had fruit instead" }
  ]
}
```

---

## 🔐 Privacy

Zero backend · Zero auth · Zero tracking · All data in your browser's IndexedDB · Export anytime as JSON

---

## 🗓 30 Apps in 30 Days

This is **Day 16** of my #30AppIn30Days challenge — one app shipped every single day.

Follow along: [@likhith1542](https://twitter.com/likhith1542)

---

## 📄 License

MIT

---

<p align="center">Built with ⚡ in 1 day · <strong>#30AppIn30Days Day 16</strong></p>