<h1 align="center">
  <img src="https://raw.githubusercontent.com/yashwant-raghav/mindcare/main/src/assets/logo.png" alt="MindCare Logo" width="80" height="80" onerror="this.src='https://img.shields.io/badge/MindCare-Serene%20Mental%20Wellbeing-blue?style=for-the-badge&logo=heart'" /><br>
  MindCare - Premium AI-Powered Mental Healthcare Web Application
</h1>

<p align="center">
  <b>A state-of-the-art cognitive wellbeing platform combining clinical empathy, local tracking privacy, and Google Gemini AI insight.</b>
</p>

***

<div align="center">

[![GitHub last commit](https://img.shields.io/github/last-commit/yashwant-raghav/mindcare?label=Last%20Commit&color=3b82f6&logo=git&logoColor=white&style=flat-square)](https://github.com/yashwant-raghav/mindcare)
[![GitHub code size](https://img.shields.io/github/languages/code-size/yashwant-raghav/mindcare?label=Code%20Size&color=10b981&logo=typescript&logoColor=white&style=flat-square)](https://github.com/yashwant-raghav/mindcare)
[![GitHub repo size](https://img.shields.io/github/repo-size/yashwant-raghav/mindcare?label=Repo%20Size&color=ef4444&logo=github&logoColor=white&style=flat-square)](https://github.com/yashwant-raghav/mindcare)
[![GitHub stars](https://img.shields.io/github/stars/yashwant-raghav/mindcare?label=Stars&color=f59e0b&logo=github&style=flat-square)](https://github.com/yashwant-raghav/mindcare)
[![GitHub issues](https://img.shields.io/github/issues/yashwant-raghav/mindcare?label=Issues&color=8b5cf6&logo=github&style=flat-square)](https://github.com/yashwant-raghav/mindcare/issues)

</div>

***

## 👨‍💻 Created By
**[Yashwant Singh Raghav](https://github.com/yashwant-raghav)**  
Feel free to connect on GitHub, star the repository, or open issues to contribute to the future of AI-assisted mental wellness!

---

## 📊 Project Overview

Welcome to **MindCare**, a comprehensive web application engineered to support, track, and elevate your psychological wellbeing. By leveraging state-of-the-art Cognitive Behavioral Therapy (CBT) models, user-centric analytics, and serene aesthetics, MindCare provides an accessible, non-diagnostic space to externalize distress, build healthy habits, and practice daily mindfulness.

Unlike traditional health trackers, MindCare focuses on clinical empathy and personal agency. It tracks emotional patterns, provides AI-driven cognitive breakdowns, offers guided somatic release timers, and serves ambient meditation soundtracks—all wrapped in a beautifully polished user interface designed to inspire calmness.

---

## ✨ Core Features

### 🏡 1. Serene Dashboard
A welcoming central interface displaying active daily streaks, accumulated mindfulness minutes, and daily mental hygiene tips. Features a quick-log vibe tracker for swift, daily mood checks.

### 📈 2. Mood Journey
An advanced mood logging suite that prompts users to check in with detailed context (sleep quality, work stress, relationship status, physical wellness). It calculates an **Emotional Stability Index (0-100%)** and leverages AI to provide single-sentence grounding advice tailored to your emotional triggers.

### ✍️ 3. My Journal
A secure, interactive writing canvas supporting private daily logs. Upon saving, entries can be evaluated using automated CBT-style analysis to discover underlying psychological themes, assess emotional tone, and suggest specific cognitive coping exercises.

### 🎵 4. Sonic Sanctuary (Music Therapy)
An atmospheric soundscape player that features multi-track ambient loops (Rainstorm, Forest Whispers, Binaural Waves) alongside an interactive, animated box-breathing helper designed to slow down heartbeat and regulate stress.

### 🧘 5. Mindful Motion (Somatic Workouts)
A collection of physical release recommendations, stretching plans, and yoga poses mapped out with step-by-step guidance and live count-down timers to help users discharge physical stress.

### 💬 6. AI CBT Companion ("Serene Clarity")
An empathetic, conversational therapist assistant powered by the **Google Gemini API**. It provides a gentle sounding board for emotional validation, identifies cognitive distortions, and builds customized coping plans on demand.

### 🔒 7. Privacy First Local Storage
To ensure complete peace of mind, all personal journals, mood history, streak statistics, and profiles are cached locally on your device. The app supports full profile customizations, local credential resets, and complete data purges.

---

## 🚀 Tech Stack

### Frontend & Core
*   ![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
*   ![TypeScript](https://img.shields.io/badge/TypeScript%205.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
*   ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
*   ![Vite](https://img.shields.io/badge/Vite%206-646CFF?style=for-the-badge&logo=vite&logoColor=white)
*   ![Motion](https://img.shields.io/badge/Motion%2012-0055FF?style=for-the-badge&logo=framer&logoColor=white) *(Framer Motion)*

### Backend & AI Service
*   ![Express](https://img.shields.io/badge/Express%204-000000?style=for-the-badge&logo=express&logoColor=white)
*   ![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini%20API-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white) *(using `@google/genai`)*
*   ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
*   ![TSX](https://img.shields.io/badge/tsx-3178C6?style=for-the-badge&logo=ts-node&logoColor=white) *(TypeScript Execute)*

---

## 📂 Project Structure

```
mindcare/
├── src/
│   ├── components/
│   │   ├── AIAssessment.tsx      # Google Gemini CBT Chatbot & Stress Assessment
│   │   ├── Auth.tsx              # Secure Local User Signup & Authentication
│   │   ├── Dashboard.tsx         # Serene Dashboard (Overview, Streak Tracker)
│   │   ├── LandingPage.tsx       # Welcoming Portal (Introduction to MindCare)
│   │   ├── MindfulMotion.tsx     # Somatic stretching & Yoga timers
│   │   ├── MoodJourney.tsx       # Mood History logging & groundings
│   │   ├── MyJournal.tsx         # Diary space with CBT Analysis
│   │   ├── Profile.tsx           # Progress resetting & user metadata options
│   │   ├── Sidebar.tsx           # Sidebar navigation panel
│   │   └── SonicSanctuary.tsx    # Ambient sound therapy & boxed breathing
│   ├── App.tsx                   # Central router & state container
│   ├── index.css                 # Global styles & Tailwind CSS setup
│   ├── main.tsx                  # React DOM anchor
│   └── types.ts                  # Shared TypeScript interfaces
├── server.ts                     # Express production backend & Gemini Proxy
├── vite.config.ts                # Vite build options & development tools
├── tsconfig.json                 # TypeScript build configurations
└── package.json                  # Application dependencies and execution scripts
```

---

## ⚙️ Local Setup and Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended) on your machine.

### 2. Clone the Repository
```bash
git clone https://github.com/yashwant-raghav/mindcare.git
cd mindcare
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a file named `.env` or `.env.local` in the project root directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** If `GEMINI_API_KEY` is not supplied, the application will automatically activate its smart rules-based **local fallback mode** allowing you to test all journal analysis, mood rating insights, and chatbots without an active API key!

### 5. Launch the Development Server
Run the local Vite and Express dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the application.

### 6. Build for Production
To bundle compile and run in a optimized production environment:
```bash
# Compile client assets and bundle server code
npm run build

# Start the Node production server
npm run start
```

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yashwant-raghav">Yashwant Singh Raghav</a>
</p>
