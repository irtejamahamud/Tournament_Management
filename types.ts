export interface Team {
  id: string;
  name: string;
  color: string;
  logo: string; // Emoji or simple text
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
}
