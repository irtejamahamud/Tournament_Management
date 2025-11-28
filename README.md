<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dynamic Carom Tournament Management System

A fully functional tournament management system for carom games with dynamic team creation, multiple tournament types, and comprehensive match tracking.

## Features

### 🎮 Dynamic Tournament Creation
- **Custom Tournament Names**: Create tournaments with personalized names
- **Flexible Team Management**: Add 2-32 teams with custom names, colors, and icons
- **Icon Selection**: Choose from 50+ Lucide React icons for each team
- **Multiple Tournament Types**: 
  - **League**: Round-robin format where every team plays against every other team
  - **Knockout**: Single-elimination bracket tournament

### 🏆 League Tournament
- Double, triple, or quadruple round-robin options
- Live standings table with W/D/L, points, and point differential
- Real-time score updates
- Match history with detailed game stories
- Automatic point calculation (3 pts for win, 1 for draw)

### ⚔️ Knockout Tournament
- Single-elimination bracket visualization
- Automatic bracket progression
- Support for 2, 4, 8, 16, or 32 teams
- Final winner announcement
- Visual bracket display with rounds

### 📊 Features
- **Persistent Storage**: Tournaments saved to localStorage
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Instant standings and bracket updates
- **Match History**: Complete record of all completed games
- **Custom Team Branding**: Unique icons and colors for each team

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:3001`

## How to Use

### Creating a Tournament

1. **Step 1: Tournament Name**
   - Enter a name for your tournament
   - Click "Next: Add Teams"

2. **Step 2: Add Teams**
   - Set the number of teams (2-32)
   - For each team:
     - Click the icon to select from Lucide React icons
     - Enter team name
     - Choose team color
   - Add or remove teams as needed
   - Click "Next: Tournament Type"

3. **Step 3: Tournament Type**
   - **League**: Choose how many times teams play each other (1-4 times)
   - **Knockout**: Must have an even number of teams
   - Click "Create Tournament"

### Playing Games

#### League Tournament
- Enter scores in the match cards
- Scores auto-save and update standings
- View match history below the schedule
- Top of standings shows leading teams

#### Knockout Tournament
- Enter scores in the bracket matches
- Winners automatically progress to next round
- Final winner displayed with trophy animation

### Starting Over
- Click the Home icon in the top-right to create a new tournament
- Confirms before resetting

## Technology Stack

- **React** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **localStorage** for persistence

## Project Structure

```
Tournament--caram/
├── components/
│   ├── IconSelector.tsx       # Icon selection modal
│   ├── KnockoutBracket.tsx    # Knockout bracket display
│   ├── MatchCard.tsx           # Individual match card
│   ├── StandingsTable.tsx      # League standings table
│   └── TournamentSetup.tsx     # 3-step tournament creation
├── utils/
│   └── calculations.ts         # Tournament logic & calculations
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main application component
└── index.tsx                   # Application entry point
```

## License

MIT
