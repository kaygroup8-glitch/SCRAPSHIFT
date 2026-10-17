# SCRAPSHIFT

**Build with what you have. Learn from what happens.**

SCRAPSHIFT is a utilitarian web application that helps people transform discarded household scrap and workshop remnants into practical, functional inventions. Its defining core mechanism is continual learning: it records user-reported construction failures, structural fatigue, and joinery issues, then actively queries those stored lessons to generate reinforced, smarter blueprints for subsequent builds.

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_API-8E75C2?style=for-the-badge&logo=google&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

---

## Table of Contents

1. [What SCRAPSHIFT Does](#1-what-scrapshift-does)
2. [Core Features](#2-core-features)
3. [How the Learning Mechanism Works](#3-how-the-learning-mechanism-works)
4. [Architecture Overview](#4-architecture-overview)
5. [Technologies Actually Implemented](#5-technologies-actually-implemented)
6. [Prerequisites](#6-prerequisites)
7. [Installation and Setup](#7-installation-and-setup)
8. [Environment Variable Configuration](#8-environment-variable-configuration)
9. [Development Command](#9-development-command)
10. [Production Build Command](#10-production-build-command)
11. [Privacy and Local Storage](#11-privacy-and-local-storage)
12. [Current Limitations](#12-current-limitations)

---

## 1. What SCRAPSHIFT Does

Households and workspaces accumulate sturdy corrugated packaging boxes, thick glass food jars, wire hangers, and scrap wood offcuts. People typically lack the geometric blueprints, realistic joining methods, or workshop equipment to make use of them.

SCRAPSHIFT takes whatever materials and basic tools a user has on hand, along with their intended goal and budget constraints. It generates three distinct, practical invention concepts. Users follow numbered construction instructions, track their assembly progress, and report physical results back into the system.

---

## 2. Core Features

- **Material Intake & Pile Cataloging**: Guided entry for scrap materials with quantity, condition, and optional local reference photographs.
- **Goal & Constraint Grounding**: Custom and standard challenges (organizing a small space, growing herbs, storing hardware, improving study setups, solving household friction).
- **Three Grounded Blueprints**: Generates distinct invention blueprints distinguishing materials already on hand from necessary household extras.
- **Interactive Workbench Step Tracker**: Numbered step-by-step instructions with live check-off indicators and progress bars.
- **Outcome Feedback & Structured Lesson Logging**: Records whether prototypes worked, partially worked, failed, were too difficult, or lacked materials.
- **Adaptive Redesign Engine**: Adjusts existing blueprints to new constraints (e.g. missing tools or tighter budgets) while linking versions (v1, v2) for version comparison.
- **Searchable Learning Journal**: Search, filter, edit, and review recorded structural lessons.
- **7-Step Continual Learning Demo**: Live interactive demonstration proving real lesson storage, retrieval, and structural adaptation without requiring an API key.
- **Privacy & Data Ownership**: Full JSON backup export and double-confirmed local data wiping.

---

## 3. How the Learning Mechanism Works

The continual learning loop follows five deterministic steps:

1. **Failure Observation**: A user builds a prototype (e.g. a cardboard phone stand) and reports that it bent at the horizontal fold line under the phone's weight.
2. **Structured Lesson Persistence**: The failure is converted into a structured `LearningLesson` containing material tags, failure modes, and an engineering adjustment ("Orient internal fluting vertically and brace with triangular gusset wedges").
3. **Keyword & Material Intersection Query**: When generating future concepts, `LessonMatcher` scores past records against the current inventory and intended use.
4. **Active Design Adaptation**: The engine incorporates the retrieved adjustment directly into the recommendation ("Tri-Truss Interlocking Phone and Tool Station").
5. **Transparent Attribution**: The generated blueprint explicitly displays a "Changed because of what you learned" section attributing what changed to previous maker experiences.

---

## 4. Architecture Overview

```
├── /index.html                 # Entry HTML with typography and metadata
├── /metadata.json              # Platform capabilities and app metadata
├── /server.ts                  # Express full-stack server with /api/generate
├── /vite.config.ts             # Vite dev server with connect middleware plugin
└── /src
    ├── /types.ts               # Strict domain types for materials, blueprints, lessons
    ├── /services
    │   ├── storage.ts          # Persistent localStorage service with JSON export
    │   ├── lessonMatcher.ts    # Lesson retrieval & directive scoring engine
    │   └── inventionEngine.ts  # Dual-mode synthesis (Gemini API + deterministic fallback)
    └── /components
        ├── Navbar.tsx          # 3-zone top bar contract with mobile drawer
        ├── Footer.tsx          # Utility footer with data ownership links
        ├── LandingPage.tsx     # Editorial homepage with 5 core sections
        ├── CreateWizard.tsx    # 4-stage material and constraint onboarding
        ├── StudioPage.tsx      # 3 concept cards with lesson change callouts
        ├── ProjectsPage.tsx    # Project library with status filters and progress
        ├── ProjectDetailPage.tsx # Interactive blueprint with redesign & feedback modals
        ├── LearningJournalPage.tsx # Searchable, editable continual lesson memory
        ├── PrivacyPage.tsx     # Local-first privacy disclosures & data controls
        └── DemoWorkflowModal.tsx # 7-step continual learning loop walkthrough
```

---

## 5. Technologies Actually Implemented

- **React 19**: Modern functional components, hooks, and clean stateful routing.
- **TypeScript 5 (ES2022)**: Strict type safety without any `any` leaks.
- **Tailwind CSS v4**: Theme tokens with `@theme` block, Oddly-inspired color palette, and utilitarian paper textures.
- **Lucide React**: Clean standard icons for affordances.
- **Google GenAI SDK (`@google/genai`)**: Server-side proxy implementation for Gemini models.
- **Express 4 & Tsx**: Backend server and Vite middleware integration.

---

## 6. Prerequisites

- Node.js version 18.0.0 or higher.
- npm version 9.0.0 or higher.
- (Optional) A Google Gemini API key if server-side AI generation is desired.

---

## 7. Installation and Setup

1. Clone or unpack the application repository:
   ```bash
   git clone <repo-url>
   cd scrapshift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 8. Environment Variable Configuration

Create a local `.env` file in the project root:

```env
# Optional: Enables server-side Gemini blueprint synthesis
GEMINI_API_KEY="your-gemini-api-key"

# Port configuration (defaults to 3000)
PORT=3000
```

If `GEMINI_API_KEY` is not provided, SCRAPSHIFT runs seamlessly in deterministic mode with full lesson retrieval and structural adaptation.

---

## 9. Development Command

Start the local development server:

```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 10. Production Build Command

Compile the client bundle and verify type safety:

```bash
npm run build
```

Run full-stack server:

```bash
npm start
```

---

## 11. Privacy and Local Storage

SCRAPSHIFT does not require an account or cloud database. All projects, active step checklists, and learning records persist client-side in browser `localStorage`.

- Uploaded pile photographs remain in local memory and are never transmitted across the network.
- No personal identifiers, cookies, or tracking beacons are stored.
- Users can export their complete database to a `.json` backup file or wipe all local storage with double confirmation at `/privacy`.

---

## 12. Current Limitations

- **Advisory Blueprints**: Generated blueprints are mechanical concepts and require careful hands-on testing on your workbench.
- **Material Inconsistencies**: Scrap paperboard, glass, and timber vary in moisture level and fiber degradation.
- **Browser-Bound Persistence**: Clearing your web browser site data will reset locally stored projects unless exported beforehand.
- **Computer Vision**: Pile image uploads are retained for user visual reference only; automatic material recognition is not implemented.
