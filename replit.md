# Shimen Elementary School 2026 Lantern Festival Riddle Game

## Overview
Interactive web-based riddle guessing game (猜燈謎) for Shimen Elementary School's 2026 Lantern Festival event. Features all 10 riddles from the school's official riddle sheet with a festive Chinese New Year theme.

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Noto Sans TC font for Chinese text
- **Backend**: Express.js API serving riddle data and answer validation
- **Database**: Firebase Firestore for cloud game state persistence + localStorage fallback
- **Auth**: Firebase Anonymous Auth (required by Firestore security rules)
- **Security**: All Firebase config stored in environment variables (VITE_FIREBASE_*)

## Key Features
- 10 riddles with server-side answer validation (answers not exposed to client)
- Score tracking with points (10 for first try, 7 for second, 5 for subsequent)
- Animated floating lanterns, confetti on correct answers
- Responsive design for mobile/tablet/desktop
- Dynamic progressive hints (3 levels, auto-show after 2 failed attempts)
- Completion modal with score summary and share option
- Game state persisted in localStorage
- Sound effects system (Web Audio API): correct/wrong/completion sounds with toggle
- Timer challenge mode with best time tracking
- Shake-to-pick random riddle (mobile device motion, with iOS permission handling)
- Share score card (canvas-generated image, download or native share)
- Event info panel with countdown to March 3, 2026 event date
- QR Code generation and downloadable poster for the activity

## Project Structure
- `client/src/pages/Home.tsx` - Main game page with all feature integrations
- `client/src/components/RiddleCard.tsx` - Individual riddle card with progressive hints
- `client/src/components/ScoreBoard.tsx` - Progress and score display
- `client/src/components/FloatingLanterns.tsx` - Animated background lanterns
- `client/src/components/ConfettiEffect.tsx` - Celebration confetti animation
- `client/src/components/CompletionModal.tsx` - Game completion dialog with share
- `client/src/components/TimerMode.tsx` - Timer challenge mode with best time
- `client/src/components/ShareCard.tsx` - Canvas-based share card generator
- `client/src/components/EventControl.tsx` - Event countdown and QR code poster
- `client/src/lib/sounds.ts` - Web Audio API sound effects
- `client/src/lib/firebase.ts` - Firebase initialization with env vars, anonymous auth
- `client/src/lib/gameStore.ts` - Firestore game state CRUD + leaderboard
- `client/src/hooks/use-shake.ts` - Device motion shake detection hook
- `server/routes.ts` - API endpoints for riddle data and answer checking
- `shared/schema.ts` - TypeScript types

## Firebase Setup
- Firestore collections: `gameStates` (per-user game progress), `scores` (leaderboard)
- Security rules: `request.auth != null` (anonymous auth required)
- All config in Replit Secrets: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

## API Endpoints
- `GET /api/riddles` - Returns riddles without answers
- `POST /api/riddles/:id/check` - Validates answer, returns { correct: boolean, answer?: string }

## Style
- Chinese New Year festive theme with red (#E60012), gold (#FFD700), warm cream background
- Noto Sans TC font for Chinese text
- SVG lanterns, decorative elements, animations
