import React from 'react';
import { Match, MatchStatus, MatchType, Team } from '../types';
import { Swords, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';

interface Props {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onUpdateScore: (matchId: string, homeScore: string, awayScore: string) => void;
  isFinal?: boolean;
}

const MatchCard: React.FC<Props> = ({ match, homeTeam, awayTeam, onUpdateScore, isFinal = false }) => {
  const isCompleted = match.status === MatchStatus.COMPLETED;

  const renderIcon = (iconName: string, className: string = 'w-8 h-8') => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Icons.Circle className={className} />;
    return <IconComponent className={className} />;
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'home' | 'away') => {
    const val = e.target.value;
    // Allow empty string or numbers only
    if (val === '' || /^\d+$/.test(val)) {
        if (side === 'home') {
            onUpdateScore(match.id, val, match.awayScore?.toString() ?? '');
        } else {
            onUpdateScore(match.id, match.homeScore?.toString() ?? '', val);
        }
    }
  };

  // Determine border color based on status
  let borderColor = "border-slate-800";
  if (isFinal) borderColor = "border-amber-500/50 shadow-amber-900/20";
  if (isCompleted && !isFinal) borderColor = "border-emerald-900/50";

  return (
    <div className={`relative bg-slate-900 rounded-lg p-4 border ${borderColor} shadow-lg transition-all duration-300 hover:border-slate-700`}>
      
      {/* Header Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border 
          ${isFinal 
            ? 'bg-amber-500 text-amber-950 border-amber-400' 
            : isCompleted 
              ? 'bg-emerald-900 text-emerald-400 border-emerald-800' 
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
          {isFinal ? 'Championship Final' : match.status}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2 gap-2">
        
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className={`filter drop-shadow-md transform transition-transform hover:scale-110 ${homeTeam.color}`}>
            {renderIcon(homeTeam.logo)}
          </div>
          <div className={`font-semibold text-center text-sm md:text-base leading-tight ${homeTeam.color}`}>
            {homeTeam.name}
          </div>
          {isCompleted && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore && (
             <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">Winner</span>
          )}
        </div>

        {/* Score Inputs / Display */}
        <div className="flex flex-col items-center gap-1 mx-2">
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              inputMode="numeric"
              value={match.homeScore ?? ''}
              onChange={(e) => handleScoreChange(e, 'home')}
              placeholder="-"
              className={`w-10 h-10 md:w-12 md:h-12 text-center text-xl font-bold rounded-lg focus:outline-none focus:ring-2 transition-all
                ${isFinal ? 'bg-amber-900/20 focus:ring-amber-500 text-amber-100' : 'bg-slate-800 focus:ring-indigo-500 text-white'}
                ${isCompleted ? 'border border-slate-700' : 'border border-slate-700 shadow-inner'}
              `}
            />
            <span className="text-slate-500 font-bold">:</span>
            <input 
              type="text" 
              inputMode="numeric"
              value={match.awayScore ?? ''}
              onChange={(e) => handleScoreChange(e, 'away')}
              placeholder="-"
               className={`w-10 h-10 md:w-12 md:h-12 text-center text-xl font-bold rounded-lg focus:outline-none focus:ring-2 transition-all
                ${isFinal ? 'bg-amber-900/20 focus:ring-amber-500 text-amber-100' : 'bg-slate-800 focus:ring-indigo-500 text-white'}
                ${isCompleted ? 'border border-slate-700' : 'border border-slate-700 shadow-inner'}
              `}
            />
          </div>
          {match.status === MatchStatus.SCHEDULED && (
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Swords className="w-3 h-3" /> VS
              </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className={`filter drop-shadow-md transform transition-transform hover:scale-110 ${awayTeam.color}`}>
            {renderIcon(awayTeam.logo)}
          </div>
          <div className={`font-semibold text-center text-sm md:text-base leading-tight ${awayTeam.color}`}>
            {awayTeam.name}
          </div>
          {isCompleted && match.awayScore !== null && match.homeScore !== null && match.awayScore > match.homeScore && (
             <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded">Winner</span>
          )}
        </div>

      </div>
      
      {/* Final Special UI: Winner Announcement inside card if completed */}
      {isFinal && isCompleted && match.homeScore !== null && match.awayScore !== null && (
          <div className="mt-4 pt-3 border-t border-amber-500/20 text-center animate-pulse">
              <span className="text-amber-400 font-bold text-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {match.homeScore > match.awayScore ? homeTeam.name : match.awayScore > match.homeScore ? awayTeam.name : "Draw (Penalties Required)"} Wins!
              </span>
          </div>
      )}
    </div>
  );
};

export default MatchCard;