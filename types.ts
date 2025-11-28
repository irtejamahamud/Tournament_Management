export interface Team {
  id: string;
  name: string;
  color: string;
  logo: string; // Icon name from lucide-react
}

export interface TeamStats extends Team {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
}

export enum MatchType {
  GROUP = 'GROUP',
  FINAL = 'FINAL',
  KNOCKOUT = 'KNOCKOUT',
}

export enum TournamentType {
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT',
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  type: MatchType;
  round?: number;
  knockoutRound?: string; // 'final', 'semi', 'quarter', etc.
  nextMatchId?: string; // For knockout progression
  position?: 'top' | 'bottom'; // Position in knockout bracket
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  teams: Team[];
  matches: Match[];
  matchesPerOpponent?: number; // For league tournaments
  createdAt: number;
}
