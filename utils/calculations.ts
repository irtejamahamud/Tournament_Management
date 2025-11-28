import { Match, MatchStatus, MatchType, Team, TeamStats, TournamentType } from '../types';

// Generate league schedule with dynamic teams
export const initializeLeagueSchedule = (teams: Team[], matchesPerOpponent: number = 2): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;

  // Generate all possible pairings
  const pairings: Array<{ home: number; away: number }> = [];
  
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      // Add matches based on matchesPerOpponent
      for (let round = 0; round < matchesPerOpponent; round++) {
        if (round % 2 === 0) {
          pairings.push({ home: i, away: j });
        } else {
          pairings.push({ home: j, away: i });
        }
      }
    }
  }

  pairings.forEach((pair, index) => {
    matches.push({
      id: `match_${matchId++}`,
      homeTeamId: teams[pair.home].id,
      awayTeamId: teams[pair.away].id,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.SCHEDULED,
      type: MatchType.GROUP,
      round: Math.floor(index / (teams.length / 2)) + 1
    });
  });

  return matches;
};

// Generate knockout bracket
export const initializeKnockoutSchedule = (teams: Team[]): Match[] => {
  if (teams.length % 2 !== 0) {
    throw new Error('Knockout tournaments require an even number of teams');
  }

  const matches: Match[] = [];
  let matchId = 1;
  const numTeams = teams.length;

  // Determine knockout rounds
  const getRoundName = (teamsInRound: number): string => {
    if (teamsInRound === 2) return 'final';
    if (teamsInRound === 4) return 'semi';
    if (teamsInRound === 8) return 'quarter';
    return `round-${Math.log2(teamsInRound)}`;
  };

  // First round matches
  const firstRoundMatches = numTeams / 2;
  for (let i = 0; i < firstRoundMatches; i++) {
    matches.push({
      id: `match_${matchId++}`,
      homeTeamId: teams[i * 2].id,
      awayTeamId: teams[i * 2 + 1].id,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.SCHEDULED,
      type: MatchType.KNOCKOUT,
      knockoutRound: getRoundName(numTeams),
      position: i % 2 === 0 ? 'top' : 'bottom'
    });
  }

  // Create placeholder matches for subsequent rounds
  let currentRoundSize = numTeams / 2;
  let previousRoundMatchCount = firstRoundMatches;
  
  while (currentRoundSize > 1) {
    const nextRoundSize = currentRoundSize / 2;
    const nextRoundName = getRoundName(currentRoundSize);
    
    for (let i = 0; i < nextRoundSize; i++) {
      const match: Match = {
        id: `match_${matchId++}`,
        homeTeamId: 'TBD',
        awayTeamId: 'TBD',
        homeScore: null,
        awayScore: null,
        status: MatchStatus.SCHEDULED,
        type: MatchType.KNOCKOUT,
        knockoutRound: nextRoundName,
        position: i % 2 === 0 ? 'top' : 'bottom'
      };
      matches.push(match);
    }
    
    currentRoundSize = nextRoundSize;
  }

  return matches;
};

// Legacy function for backward compatibility
export const initializeSchedule = (teams: Team[]): Match[] => {
  return initializeLeagueSchedule(teams, 2);
};

export const calculateStandings = (teams: Team[], matches: Match[]): TeamStats[] => {
  // Initialize stats map
  const statsMap = new Map<string, TeamStats>();
  
  teams.forEach(team => {
    statsMap.set(team.id, {
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    });
  });

  // Process completed group matches
  matches.forEach(match => {
    if (match.status === MatchStatus.COMPLETED && match.type === MatchType.GROUP && match.homeScore !== null && match.awayScore !== null) {
      const homeStats = statsMap.get(match.homeTeamId);
      const awayStats = statsMap.get(match.awayTeamId);
      
      if (!homeStats || !awayStats) return;

      // Update Played
      homeStats.played += 1;
      awayStats.played += 1;

      // Update Goals
      homeStats.goalsFor += match.homeScore;
      homeStats.goalsAgainst += match.awayScore;
      homeStats.goalDifference = homeStats.goalsFor - homeStats.goalsAgainst;

      awayStats.goalsFor += match.awayScore;
      awayStats.goalsAgainst += match.homeScore;
      awayStats.goalDifference = awayStats.goalsFor - awayStats.goalsAgainst;

      // Update Points & W/D/L
      if (match.homeScore > match.awayScore) {
        homeStats.won += 1;
        homeStats.points += 3;
        awayStats.lost += 1;
      } else if (match.homeScore < match.awayScore) {
        awayStats.won += 1;
        awayStats.points += 3;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        homeStats.points += 1;
        awayStats.drawn += 1;
        awayStats.points += 1;
      }
    }
  });

  // Convert to array and sort
  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
};

// Progress knockout bracket based on completed matches
export const progressKnockoutBracket = (matches: Match[], teams: Team[]): Match[] => {
  const updatedMatches = [...matches];
  
  // Sort matches by round (first round first)
  const sortedMatches = [...matches].sort((a, b) => {
    const rounds = ['round-4', 'round-3', 'round-2', 'round-1', 'quarter', 'semi', 'final'];
    const aIndex = rounds.indexOf(a.knockoutRound || '');
    const bIndex = rounds.indexOf(b.knockoutRound || '');
    return aIndex - bIndex;
  });

  sortedMatches.forEach((match, index) => {
    if (match.status === MatchStatus.COMPLETED && match.homeScore !== null && match.awayScore !== null) {
      // Determine winner
      const winnerId = match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
      
      // Find next match
      const currentRoundMatches = matches.filter(m => m.knockoutRound === match.knockoutRound);
      const currentMatchIndex = currentRoundMatches.findIndex(m => m.id === match.id);
      const nextMatchIndex = Math.floor(currentMatchIndex / 2);
      
      // Find the next round
      const rounds = ['round-4', 'round-3', 'round-2', 'round-1', 'quarter', 'semi', 'final'];
      const currentRoundIndex = rounds.indexOf(match.knockoutRound || '');
      if (currentRoundIndex < rounds.length - 1) {
        const nextRound = rounds[currentRoundIndex + 1];
        const nextRoundMatches = updatedMatches.filter(m => m.knockoutRound === nextRound);
        
        if (nextRoundMatches[nextMatchIndex]) {
          const nextMatch = nextRoundMatches[nextMatchIndex];
          const matchIndexInUpdated = updatedMatches.findIndex(m => m.id === nextMatch.id);
          
          if (currentMatchIndex % 2 === 0) {
            updatedMatches[matchIndexInUpdated] = {
              ...nextMatch,
              homeTeamId: winnerId
            };
          } else {
            updatedMatches[matchIndexInUpdated] = {
              ...nextMatch,
              awayTeamId: winnerId
            };
          }
        }
      }
    }
  });

  return updatedMatches;
};

