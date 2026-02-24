# Shimen Elementary School 2026 Lantern Festival Riddle Game

## Overview
Interactive web-based riddle guessing game (猜燈謎) for Shimen Elementary School's 2026 Lantern Festival event. Features all 10 riddles from the school's official riddle sheet with a festive Chinese New Year theme. Stage-by-stage challenge format with student login, leaderboard, teacher dashboard, and class battle mode.

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Noto Sans TC font for Chinese text
- **Backend**: Express.js API serving riddle data, answer validation, and admin CRUD
- **Database**: Firebase Firestore for cloud game state persistence + localStorage fallback
- **Auth**: Firebase Anonymous Auth (required by Firestore security rules)
- **Security**: All Firebase config stored in environment variables (VITE_FIREBASE_*)
- **PWA**: Service worker for offline support, manifest for installable app

## Key Features
- 10 riddles with server-side answer validation (answers not exposed to client)
- Stage-by-stage challenge mode: one riddle per screen with navigation
- Answer explanations shown after solving each riddle
- Student login (class + seat number + nickname) stored in Firestore
- School-wide leaderboard with individual and class rankings
- Class battle mode page for team competition
- Prize redemption QR code for students who complete all riddles
- Teacher dashboard with statistics (per-riddle accuracy, class participation)
- Question bank management (teacher CRUD for riddles, password-protected)
- Score tracking with points (10 for first try, 7 for second, 5 for subsequent)
- Animated floating lanterns, confetti on correct answers, fireworks on completion
- Progress map with visual lantern path showing solved stages
- Responsive design for mobile/tablet/desktop
- Dynamic progressive hints (3 levels, auto-show after 2 failed attempts)
- Sound effects system (Web Audio API): correct/wrong/completion sounds with toggle
- Timer challenge mode with best time tracking
- Shake-to-pick random riddle (mobile device motion, with iOS permission handling)
- Share score card (canvas-generated image, download or native share)
- Event info panel with countdown to March 3, 2026 event date
- PWA offline support with service worker caching

## Project Structure
- `client/src/pages/Home.tsx` - Main game page with all feature integrations
- `client/src/pages/TeacherDashboard.tsx` - Teacher statistics and analytics page
- `client/src/pages/QuestionBank.tsx` - Riddle CRUD management page
- `client/src/pages/ClassBattle.tsx` - Class team competition page
- `client/src/components/RiddleCard.tsx` - Individual riddle card with progressive hints and explanations
- `client/src/components/ScoreBoard.tsx` - Progress and score display
- `client/src/components/FloatingLanterns.tsx` - Animated background lanterns
- `client/src/components/ConfettiEffect.tsx` - Celebration confetti animation
- `client/src/components/FireworksEffect.tsx` - Fireworks canvas animation on completion
- `client/src/components/ProgressMap.tsx` - Visual lantern path progress map
- `client/src/components/CompletionModal.tsx` - Game completion dialog with share
- `client/src/components/StudentLogin.tsx` - Class/seat/nickname login form
- `client/src/components/Leaderboard.tsx` - Individual and class ranking modal
- `client/src/components/PrizeCode.tsx` - Prize redemption QR code generator
- `client/src/components/TimerMode.tsx` - Timer challenge mode with best time
- `client/src/components/ShareCard.tsx` - Canvas-based share card generator
- `client/src/components/EventControl.tsx` - Event countdown and QR code poster
- `client/src/lib/sounds.ts` - Web Audio API sound effects
- `client/src/lib/firebase.ts` - Firebase initialization with env vars, anonymous auth
- `client/src/lib/gameStore.ts` - Firestore CRUD: game state, student profiles, scores, leaderboard, class stats, teacher stats
- `client/src/hooks/use-shake.ts` - Device motion shake detection hook
- `server/routes.ts` - API endpoints for riddle data, answer checking, admin CRUD
- `shared/schema.ts` - TypeScript types
- `client/public/sw.js` - Service worker for offline caching
- `client/public/manifest.json` - PWA manifest

## Firebase Setup
- Firestore collections: `gameStates` (per-user game progress), `scores` (leaderboard with class/seat data), `studentProfiles` (class/seat/nickname)
- Security rules: `request.auth != null` (anonymous auth required)
- All config in Replit Secrets: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID

## API Endpoints
- `GET /api/riddles` - Returns riddles without answers or explanations
- `POST /api/riddles/:id/check` - Validates answer, returns { correct, answer?, explanation? }
- `GET /api/admin/riddles/:id` - Get full riddle with answers (teacher auth required)
- `POST /api/admin/riddles` - Create new riddle (teacher auth required)
- `PUT /api/admin/riddles/:id` - Update riddle (teacher auth required)
- `DELETE /api/admin/riddles/:id` - Delete riddle (teacher auth required)

## Teacher Access
- Teacher code: "shimen2026" (verified via x-teacher-code header)
- Routes: `/teacher` (dashboard), `/questions` (question bank)

## Routes
- `/` - Main game page (requires student login)
- `/teacher` - Teacher dashboard (password-protected)
- `/questions` - Question bank management (password-protected)
- `/battle` - Class battle mode

## Style
- Chinese New Year festive theme with red (#E60012), gold (#FFD700), warm cream background
- Noto Sans TC font for Chinese text
- SVG lanterns, decorative elements, animations
