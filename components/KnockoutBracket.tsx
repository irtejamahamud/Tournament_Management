import React from 'react';
import { Match, Team, MatchStatus } from '../types';
import { Trophy, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Props {
  matches: Match[];
  teams: Team[];
  onUpdateScore: (matchId: string, homeScore: string, awayScore: string) => void;
}

const KnockoutBracket: React.FC<Props> = ({ matches, teams, onUpdateScore }) => {
  const getTeam = (id: string) => teams.find(t => t.id === id);

  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Icons.Circle className={className} />;
    return <IconComponent className={className} />;
  };

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const round = match.knockoutRound || 'unknown';
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const roundOrder = ['round-1', 'quarter', 'semi', 'final'];
  const roundLabels: Record<string, string> = {
    'round-1': 'Round of 16',
    'quarter': 'Quarter Finals',
    'semi': 'Semi Finals',
    'final': 'Final'
  };

  const handleScoreChange = (match: Match, side: 'home' | 'away', value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      const homeScore = side === 'home' ? value : (match.homeScore?.toString() ?? '');
      const awayScore = side === 'away' ? value : (match.awayScore?.toString() ?? '');
      onUpdateScore(match.id, homeScore, awayScore);
    }
  };

  const renderMatch = (match: Match) => {
    const homeTeam = getTeam(match.homeTeamId);
    const awayTeam = getTeam(match.awayTeamId);
    
    if (!homeTeam || !awayTeam) {
      return (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <div className="text-center text-slate-500 text-sm">TBD</div>
        </div>
      );
    }

    const isCompleted = match.status === MatchStatus.COMPLETED;
    const homeWon = isCompleted && match.homeScore! > match.awayScore!;
    const awayWon = isCompleted && match.awayScore! > match.homeScore!;

    return (
      <div className={`bg-slate-900 rounded-lg border-2 transition-all ${
        isCompleted ? 'border-emerald-900/50' : 'border-slate-800'
      }`}>
        {/* Home Team */}
        <div className={`flex items-center gap-3 p-3 ${
          homeWon ? 'bg-emerald-900/20' : ''
        }`}>
          <div className={`${homeTeam.color}`}>
            {renderIcon(homeTeam.logo, 'w-5 h-5')}
          </div>
          <span className={`flex-1 text-sm font-medium ${
            homeWon ? 'text-white' : 'text-slate-300'
          }`}>
            {homeTeam.name}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={match.homeScore ?? ''}
            onChange={(e) => handleScoreChange(match, 'home', e.target.value)}
            placeholder="-"
            className="w-10 h-10 text-center text-sm font-bold rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="h-px bg-slate-800" />

        {/* Away Team */}
        <div className={`flex items-center gap-3 p-3 ${
          awayWon ? 'bg-emerald-900/20' : ''
        }`}>
          <div className={`${awayTeam.color}`}>
            {renderIcon(awayTeam.logo, 'w-5 h-5')}
          </div>
          <span className={`flex-1 text-sm font-medium ${
            awayWon ? 'text-white' : 'text-slate-300'
          }`}>
            {awayTeam.name}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={match.awayScore ?? ''}
            onChange={(e) => handleScoreChange(match, 'away', e.target.value)}
            placeholder="-"
            className="w-10 h-10 text-center text-sm font-bold rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-max">
        <div className="flex gap-8 items-start">
          {roundOrder.map((roundKey, roundIndex) => {
            const roundMatches = rounds[roundKey];
            if (!roundMatches || roundMatches.length === 0) return null;

            return (
              <div key={roundKey} className="flex items-center gap-6">
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      {roundLabels[roundKey] || roundKey}
                    </h3>
                    {roundKey === 'final' && (
                      <Trophy className="w-6 h-6 text-amber-400 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="space-y-8">
                    {roundMatches.map(match => (
                      <div key={match.id} className="w-64">
                        {renderMatch(match)}
                      </div>
                    ))}
                  </div>
                </div>
                {roundIndex < roundOrder.length - 1 && rounds[roundOrder[roundIndex + 1]]?.length > 0 && (
                  <div className="flex items-center">
                    <ArrowRight className="w-8 h-8 text-slate-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KnockoutBracket;
