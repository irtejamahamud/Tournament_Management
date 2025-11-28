import { Match, MatchStatus, MatchType, Team, TeamStats } from '../types';

export const initializeSchedule = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;

  // Round 1 (One vs One)
  // Logic for 3 teams Double Round Robin
  // Total Matches = 3 * 2 = 6 group matches.

  const pairings = [
    { home: 0, away: 1 }, // A vs B
    { home: 1, away: 2 }, // B vs C
    { home: 2, away: 0 }, // C vs A
    // Return legs
    { home: 1, away: 0 }, // B vs A
    { home: 2, away: 1 }, // C vs B
    { home: 0, away: 2 }, // A vs C
  ];

  pairings.forEach((pair, index) => {
    matches.push({
      id: `match_${matchId++}`,
      homeTeamId: teams[pair.home].id,
      awayTeamId: teams[pair.away].id,
      homeScore: null,
      awayScore: null,
      status: MatchStatus.SCHEDULED,
      type: MatchType.GROUP,
      round: index < 3 ? 1 : 2
    });
  });

  return matches;
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
      const homeStats = statsMap.get(match.homeTeamId)!;
      const awayStats = statsMap.get(match.awayTeamId)!;

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
  // Sort criteria: Points -> Goal Difference -> Goals For
  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
};
