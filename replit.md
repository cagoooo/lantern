# Shimen Elementary School 2026 Lantern Festival Riddle Game

## Overview
Interactive web-based riddle guessing game (猜燈謎) for Shimen Elementary School's 2026 Lantern Festival event. Features all 10 riddles from the school's official riddle sheet with a festive Chinese New Year theme.

## Architecture
- **Frontend**: React + Vite + TailwindCSS with Noto Sans TC font for Chinese text
- **Backend**: Express.js API serving riddle data and answer validation
- **Storage**: Client-side localStorage for game progress; no database needed
- **No authentication**: Public game for school students

## Key Features
- 10 riddles with server-side answer validation (answers not exposed to client)
- Score tracking with points (10 for first try, 7 for second, 5 for subsequent)
- Animated floating lanterns, confetti on correct answers
- Responsive design for mobile/tablet/desktop
- Hints system for each riddle
- Completion modal with score summary
- Game state persisted in localStorage

## Project Structure
- `client/src/pages/Home.tsx` - Main game page
- `client/src/components/RiddleCard.tsx` - Individual riddle card with answer input
- `client/src/components/ScoreBoard.tsx` - Progress and score display
- `client/src/components/FloatingLanterns.tsx` - Animated background lanterns
- `client/src/components/ConfettiEffect.tsx` - Celebration confetti animation
- `client/src/components/CompletionModal.tsx` - Game completion dialog
- `server/routes.ts` - API endpoints for riddle data and answer checking
- `shared/schema.ts` - TypeScript types

## API Endpoints
- `GET /api/riddles` - Returns riddles without answers
- `POST /api/riddles/:id/check` - Validates answer, returns { correct: boolean, answer?: string }

## Style
- Chinese New Year festive theme with red (#E60012), gold (#FFD700), warm cream background
- Noto Sans TC font for Chinese text
- SVG lanterns, decorative elements, animations
