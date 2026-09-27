# Mann Ki Baat — Full Project Documentation

> **Type:** Full-Stack Video Meeting Platform + Browser-Side AI Sign Language Recognition  
> **Stack:** React · Vite · Material UI · WebRTC · Socket.IO · Node.js · Express · MongoDB · MediaPipe · TensorFlow.js  
> **Last Updated:** 2026-09-24

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Original Base Repository — What Existed](#2-original-base-repository--what-existed)
3. [All Planned Objectives](#3-all-planned-objectives)
4. [What Has Been Implemented — Detailed Log](#4-what-has-been-implemented--detailed-log)
5. [File & Folder Structure](#5-file--folder-structure)
6. [AI Pipeline — Technical Deep Dive](#6-ai-pipeline--technical-deep-dive)
7. [Pending / Future Objectives](#7-pending--future-objectives)
8. [Deployment Plan](#8-deployment-plan)

---

## 1. Project Overview

**Mann Ki Baat** is a full-stack, real-time video meeting application designed to facilitate accessible communication. The core innovation is a **100% browser-side AI pipeline** that detects hand gestures using MediaPipe's Hand Landmarker and classifies them using a custom-trained TensorFlow.js neural network — converting sign language into text and broadcasting it to all meeting participants in real time via Socket.IO, with zero additional server cost.

The project is structured around two goals:
- **A production-quality video meeting platform** (comparable to Google Meet) with authentication, WebRTC, chat, and screen sharing.
- **An accessibility-first AI feature** that enables muted or non-verbal participants to communicate through recognized hand gestures.

---

## 2. Original Base Repository — What Existed

The project was inherited with the following baseline functionality already working:

### Backend (`/BACKEND`)
| Feature | Status |
|---|---|
| Node.js + Express server on port 8000 | ✅ Working |
| Socket.IO server for real-time signaling | ✅ Working |
| WebRTC signaling (offer/answer/ICE candidates) | ✅ Working |
| User join/leave room management | ✅ Working |
| In-meeting text chat via Socket.IO `chat-message` event | ✅ Working |
| MongoDB + Mongoose connection | ✅ Working |
| User model (schema defined) | ✅ Working |
| Auth routes (signup, login) with bcrypt password hashing | ✅ Working |
| `withAuth` JWT middleware | ✅ Working |

### Frontend (`/FRONTEND`)
| Feature | Status |
|---|---|
| React + Vite project setup | ✅ Working |
| React Router DOM for page navigation | ✅ Working |
| Material UI component library integrated | ✅ Working |
| Landing/Home page with branding | ✅ Working |
| Authentication page (Login/Signup) | ✅ Working |
| Video meeting room page (`videoMeet.jsx`) | ✅ Working |
| Local camera + microphone access via `getUserMedia` | ✅ Working |
| WebRTC peer-to-peer video calling (multi-user) | ✅ Working |
| Audio mute/unmute toggle | ✅ Working |
| Video on/off toggle | ✅ Working |
| Screen sharing via `getDisplayMedia` | ✅ Working |
| In-meeting chat panel with send/receive messages | ✅ Working |
| Protected routes using `withAuth.jsx` HOC | ✅ Working |

---

## 3. All Planned Objectives

### Phase 1 — UI/UX Polishing ✅ COMPLETE
- Apply a unified global dark theme across all pages using MUI `ThemeProvider`.
- Fix the `logo3.png` image overflow bug on the Join a Meet page.
- Make the navbar branding ("Mann Ki Baat") a clickable button routing to the home page.
- Add name overlays (bottom-left) on each video tile in the meeting room.
- Add a "Camera Off" avatar icon overlay when a participant's video is disabled.
- Replace the hardcoded chat notification number with a smart unread dot badge that only appears when a new message arrives while the chat panel is closed.

### Phase 2 — AI Sign Language Recognition Pipeline ✅ IN PROGRESS
- Install `@mediapipe/tasks-vision` and `@tensorflow/tfjs` in the frontend.
- Build an isolated `ML_PIPELINE/` folder containing all training utilities, completely separate from the production React app.
- Create a browser-based **Data Collector** (`data_collector.html`) to record normalized hand landmarks from a webcam.
- Create a **Landmark Preprocessing utility** (`landmarkPreprocess.js`) that normalizes 21 MediaPipe 3D landmarks relative to the wrist and flattens them into a 63-element feature vector.
- Train a custom **Dense Neural Network** on 8 self-recorded ASL gesture classes using TensorFlow.js.
- Export the trained model (`model.json` + `model.weights.bin`) to `FRONTEND/public/model/` for static serving.
- Create an isolated AI class `signRecognizer.js` with full MediaPipe + TF.js inference and **temporal smoothing** (debouncing via 5-frame consensus + 3-second cooldown).
- Integrate the AI module into `videoMeet.jsx` with a toggle button (Hand icon) in the meeting control bar.
- Show a pop-in animated overlay on the local video tile when a gesture is detected.
- Broadcast the detected gesture to all meeting participants via Socket.IO as a chat message: `[AI Sign]: HELLO`.

### Phase 3 — Deployment ⬜ PENDING
- Configure the Express backend to serve the Vite production `dist/` build as static files.
- Create a single-service deployment on **Render** (one Web Service for both frontend and backend).
- Configure all environment variables (`MONGO_URL`, `JWT_SECRET`) on Render's dashboard.
- Ensure `.env` is in `.gitignore` and never pushed to the repository.

### Phase 4 — Documentation & Version Control ✅ COMPLETE
- Update `README.md` with full feature list, tech stack, and embedded screenshots.
- Create `changelog.txt` for timestamped development logs.
- Create `PROJECT_DOCS.md` (this file) for a comprehensive technical reference.
- Push all UI changes to the `UI-polishing` branch and merge.

---

## 4. What Has Been Implemented — Detailed Log

### 4.1 Global Dark Theme
- **File:** `FRONTEND/src/App.jsx`
- **What:** Wrapped the entire React Router in a MUI `ThemeProvider` with `createTheme({ palette: { mode: 'dark' } })`.
- **Why:** Previously each page had its own local `ThemeProvider`, causing inconsistent theming. Centralizing it means any new page automatically inherits the dark theme.
- **Impact:** Removed redundant local `ThemeProvider` from `authentication.jsx`.

### 4.2 Logo Overflow Fix
- **File:** `FRONTEND/src/pages/home.jsx`, `landing.jsx`
- **What:** Added `maxWidth: '100%'` and `height: 'auto'` inline styles to the `<img>` tag for `logo3.png`.
- **Why:** The image had no size constraints, causing it to overflow its parent container and capture the entire viewport on the Join a Meet page.

### 4.3 Clickable Navbar Branding
- **File:** `FRONTEND/src/pages/home.jsx`
- **What:** Wrapped the "Mann Ki Baat" text and logo `<img>` in an `onClick` handler using React Router's `useNavigate` hook, routing to `/home`.
- **Why:** Standard UX convention — clicking the app brand/logo should always return the user to the homepage.

### 4.4 Name Overlays on Video Tiles
- **File:** `FRONTEND/src/pages/videoMeet.jsx`, `FRONTEND/src/styles/videoComponent.module.css`
- **What:** Added a `<div className={styles.nameOverlay}>` inside each `.videoWrapper` div. For the local video it shows `{username} (You)`, for remote videos it resolves the socket ID to a username using the `remoteUsers` state dictionary.
- **CSS:** Absolute positioning at the bottom-left of the tile with a semi-transparent black background.

### 4.5 Camera-Off Overlay
- **File:** `FRONTEND/src/pages/videoMeet.jsx`, `FRONTEND/src/styles/videoComponent.module.css`
- **What:** Conditionally renders a centered MUI `VideocamOffRoundedIcon` overlay on any tile where video is disabled. Tracks remote camera states via the `remoteCameraStates` dictionary updated through Socket.IO `update-camera-state` events.

### 4.6 Smart Unread Dot Badge
- **File:** `FRONTEND/src/pages/videoMeet.jsx`
- **What:** Replaced a hardcoded message counter with a `hasUnread` boolean state. The dot only appears when `addMessage` fires AND `showModalRef.current` is `false` (chat is closed). It clears when the chat panel is opened.
- **Key Detail:** Used a `useRef` (`showModalRef`) to track modal open/close state inside the Socket.IO listener closure accurately, since `useState` values are stale inside closures.

### 4.7 Data Collector Tool
- **File:** `ML_PIPELINE/data_collector.html`
- **What:** A standalone HTML page (served via `npx serve`) that:
  1. Imports MediaPipe `HandLandmarker` via ES Module CDN.
  2. Accesses the webcam with `getUserMedia`.
  3. Runs `detectForVideo` on each animation frame.
  4. On "Start Recording" click, captures normalized 63-element landmark vectors.
  5. On "Download Dataset" click, saves all frames as `gesture_dataset.json`.
  6. On "Train & Download Model" (purple button), loads TF.js via CDN, trains the model entirely in-browser, and downloads `model.json` + `model.weights.bin`.
- **8 Supported Gestures:** `hello`, `yes`, `no`, `thank_you`, `help`, `stop`, `okay`, `sorry`.
- **UX Fix Applied:** Changed "Hold to Record" to a toggle Start/Stop button so both hands are free for performing gestures.

### 4.8 Landmark Preprocessing Utility
- **File:** `FRONTEND/src/utils/landmarkPreprocess.js`
- **What:** Exports `preprocessLandmarks(landmarks)` which:
  1. Takes 21 MediaPipe `{x, y, z}` landmark objects.
  2. Translates all coordinates so wrist (landmark 0) is at the origin `(0, 0, 0)`.
  3. Finds the maximum absolute coordinate value and divides all values by it (scale normalization).
  4. Flattens into a `Float32Array`-compatible 63-element array.
- **Why:** This makes the model **position-invariant** (hand can be anywhere in frame) and **scale-invariant** (hand can be near or far from camera).

### 4.9 Model Training
- **File:** `ML_PIPELINE/train_model.js`
- **Dataset:** `ML_PIPELINE/gesture_dataset.json` (self-recorded, ~400–800 frames across 8 classes)
- **Architecture:**
  ```
  Input (63)  →  Dense(128, ReLU)  →  Dropout(0.2)  →  Dense(64, ReLU)  →  Dense(8, Softmax)
  ```
- **Optimizer:** Adam | **Loss:** Categorical Crossentropy | **Epochs:** 50
- **Final Accuracy:** 100% (1.0000) on training set
- **Output:** `FRONTEND/public/model/model.json` + `FRONTEND/public/model/model.weights.bin`
- **Note:** Used `@tensorflow/tfjs` (pure JS) instead of `@tensorflow/tfjs-node` to bypass C++ `node-gyp` compilation errors caused by a space in the project directory path (`WEB DEV`).

### 4.10 SignRecognizer AI Module
- **File:** `FRONTEND/src/utils/signRecognizer.js`
- **What:** An ES6 class with the following lifecycle:
  - `initialize()`: Async. Loads TF.js model from `/model/model.json` and initializes MediaPipe `HandLandmarker` in VIDEO mode.
  - `start(videoElement)`: Begins the `requestAnimationFrame` prediction loop using the passed `<video>` ref.
  - `predictLoop(videoElement)`: On each frame — detects hand, preprocesses landmarks, runs TF.js inference, applies temporal smoothing, and fires the `onGestureDetected` callback.
  - `stop()`: Cancels the loop and resets all state.
- **Temporal Smoothing:**
  - Maintains a rolling history of the last 5 frame predictions.
  - Only fires a gesture callback if all 5 frames agree AND confidence > 85%.
  - Resets history if no hand is detected or confidence is too low.
  - Prevents re-firing the same gesture until the hand changes (deduplication via `this.currentGesture`).

### 4.11 videoMeet.jsx AI Integration
- **File:** `FRONTEND/src/pages/videoMeet.jsx`
- **Additions:**
  - Imported `PanToolIcon` (MUI) and `SignRecognizer`.
  - Added state: `aiEnabled` (boolean), `detectedGesture` (string), `recognizerRef` (useRef).
  - Added `handleAiToggle()` async function: lazily initializes the recognizer on first use, toggles start/stop on subsequent calls.
  - Added Hand Icon `<IconButton>` in the control bar — turns green when AI is active.
  - Added `{detectedGesture && <div className={styles.aiOverlay}>...</div>}` overlay on the local video tile.
  - Gesture auto-clears after 3 seconds via `setTimeout`.
  - Detected gesture emitted to Socket.IO as `[AI Sign]: GESTURE` for all participants.

### 4.12 AI Overlay CSS
- **File:** `FRONTEND/src/styles/videoComponent.module.css`
- **What:** Added `.aiOverlay` class with:
  - Absolute positioning centered on the video tile.
  - Semi-transparent green background (`rgba(76, 175, 80, 0.85)`).
  - Bold white uppercase text at 28px.
  - `popIn` keyframe animation (scale 0.5→1 with cubic-bezier easing).
  - `pointer-events: none` so it doesn't block clicks.

---

## 5. File & Folder Structure

```
Meeting/
├── BACKEND/
│   ├── src/
│   │   ├── controllers/        # Auth logic
│   │   ├── models/             # Mongoose User schema
│   │   ├── routes/             # Express auth routes
│   │   └── SocketManager.js    # All Socket.IO + WebRTC signaling
│   └── app.js                  # Express + Socket.IO server entry
│
├── FRONTEND/
│   ├── public/
│   │   └── model/              # ← Trained TF.js model lives here
│   │       ├── model.json
│   │       └── model.weights.bin
│   └── src/
│       ├── pages/
│       │   ├── videoMeet.jsx   # ← Main meeting room (AI integrated here)
│       │   ├── authentication.jsx
│       │   ├── home.jsx
│       │   └── landing.jsx
│       ├── utils/
│       │   ├── signRecognizer.js       # ← AI inference class
│       │   ├── landmarkPreprocess.js   # ← Landmark normalization
│       │   └── withAuth.jsx            # ← Route protection HOC
│       └── styles/
│           └── videoComponent.module.css  # ← All meeting room CSS
│
├── ML_PIPELINE/                # ← Isolated training environment
│   ├── data_collector.html     # Data recording tool
│   ├── train_model.js          # Offline training script
│   ├── gesture_dataset.json    # Recorded training data
│   └── package.json
│
├── PROJECT_DOCS.md             # ← This file
├── changelog.txt               # Timestamped dev log
└── README.md                   # Public-facing project description
```

---

## 6. AI Pipeline — Technical Deep Dive

```
Live Camera Feed (localVideoRef)
        ↓
MediaPipe HandLandmarker.detectForVideo()
        ↓
21 3D Landmarks {x, y, z} per frame
        ↓
landmarkPreprocess.js
  - Origin shift to wrist (landmark 0)
  - Max-value scaling (scale invariance)
  - Flatten to Float32[63]
        ↓
TensorFlow.js model.predict(tensor2d([features]))
  - Input: [1, 63]
  - Hidden: Dense(128, ReLU) → Dropout(0.2) → Dense(64, ReLU)
  - Output: Dense(8, Softmax) — probabilities for 8 classes
        ↓
Temporal Smoothing (5-frame rolling history)
  - Confidence threshold: 85%
  - Requires 5 consecutive identical predictions
  - Deduplication: only fires once per new gesture
        ↓
onGestureDetected(gesture) callback
  ├── setDetectedGesture(gesture)  →  UI overlay with pop-in animation
  └── socket.emit("chat-message")  →  Broadcast "[AI Sign]: HELLO" to room
```

**Gesture Classes Supported:**
| Label | ASL Description |
|---|---|
| `hello` | Open palm facing camera |
| `yes` | Closed fist nodding motion |
| `no` | Index + middle finger tapping thumb |
| `thank_you` | Flat hand from chin forward |
| `help` | Fist on open palm |
| `stop` | Rigid flat palm facing forward |
| `okay` | Index + thumb circle, other fingers up |
| `sorry` | Closed fist circling on chest |

---

## 7. Pending / Future Objectives

| # | Feature | Priority | Notes |
|---|---|---|---|
| 1 | Deploy to Render as single web service | High | Express serves Vite `dist/` |
| 2 | Expand gesture vocabulary (12–20 words) | Medium | Record more data |
| 3 | Add Sign Language Mode toggle (hide camera, show sign overlay full-screen) | Medium | UX feature for muted users |
| 4 | Live transcription for all speech (WebSpeech API) | Low | Non-AI, easy to add |
| 5 | End-to-end encryption for chat | Low | Stretch goal |
| 6 | AI meeting summary post-call | Low | OpenAI API integration |
| 7 | Text-to-Speech for received AI Signs | Low | Web Speech Synthesis API |
| 8 | Record more diverse gesture data for improved real-world accuracy | High | More angles + lighting conditions |

---

## 8. Deployment Plan

**Target Platform:** Render (single Web Service)

**Strategy:** Build Vite frontend (`npm run build`) → Express serves `FRONTEND/dist/` as static files → Single service handles both API and frontend.

**Environment Variables to set on Render:**
| Variable | Value |
|---|---|
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `PORT` | 8000 (or let Render assign) |

**Files that must NEVER be pushed to GitHub:**
- `.env` (backend secrets)
- `FRONTEND/public/model/` (optional — large binary files)
- `ML_PIPELINE/node_modules/`
- `ML_PIPELINE/gesture_dataset.json` (personal biometric data)
