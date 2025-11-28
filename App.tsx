import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS } from './constants';
import { initializeSchedule, calculateStandings } from './utils/calculations';
import { Match, MatchStatus, MatchType } from './types';
import StandingsTable from './components/StandingsTable';
import MatchCard from './components/MatchCard';
import { Trophy, RefreshCw, Dna, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [init, setInit] = useState(false);

  // Initialize schedule on mount
  useEffect(() => {
    // Check localStorage first
    const savedMatches = localStorage.getItem('carom_tournament_matches');
    if (savedMatches) {
        setMatches(JSON.parse(savedMatches));
    } else {
        setMatches(initializeSchedule(TEAMS));
    }
    setInit(true);
  }, []);

  // Save to localStorage whenever matches change
  useEffect(() => {
      if(init) {
        localStorage.setItem('carom_tournament_matches', JSON.stringify(matches));
      }
  }, [matches, init]);

  // Derived State: Standings
  const standings = useMemo(() => calculateStandings(TEAMS, matches), [matches]);

  // Handle Score Updates
  const updateScore = (matchId: string, homeScoreStr: string, awayScoreStr: string) => {
    setMatches(prevMatches => {
      return prevMatches.map(m => {
        if (m.id !== matchId) return m;

        const homeScore = homeScoreStr === '' ? null : parseInt(homeScoreStr);
        const awayScore = awayScoreStr === '' ? null : parseInt(awayScoreStr);
        
        let status = MatchStatus.SCHEDULED;
        if (homeScore !== null && awayScore !== null) {
          status = MatchStatus.COMPLETED;
        }

        return { ...m, homeScore, awayScore, status };
      });
    });
  };

  // Logic to Generate or Update Final
  useEffect(() => {
    if (!init) return;

    const groupMatches = matches.filter(m => m.type === MatchType.GROUP);
    const allGroupCompleted = groupMatches.every(m => m.status === MatchStatus.COMPLETED);
    
    // Check if final exists
    const existingFinalIndex = matches.findIndex(m => m.type === MatchType.FINAL);
    const finalExists = existingFinalIndex !== -1;

    if (allGroupCompleted) {
      // Get top 2 teams
      const topTwo = standings.slice(0, 2);
      const homeId = topTwo[0].id;
      const awayId = topTwo[1].id;
      
      if (!finalExists) {
        // Create new final
        const finalMatch: Match = {
          id: `match_final`,
          homeTeamId: homeId,
          awayTeamId: awayId,
          homeScore: null,
          awayScore: null,
          status: MatchStatus.SCHEDULED,
          type: MatchType.FINAL
        };
        setMatches(prev => [...prev, finalMatch]);
      } else {
        // Check if we need to update the existing final (if standings changed top 2)
        const currentFinal = matches[existingFinalIndex];
        if (currentFinal.homeTeamId !== homeId || currentFinal.awayTeamId !== awayId) {
             setMatches(prev => {
                 const updated = [...prev];
                 updated[existingFinalIndex] = {
                     ...updated[existingFinalIndex],
                     homeTeamId: homeId,
                     awayTeamId: awayId,
                     // Reset scores if teams change
                     homeScore: null,
                     awayScore: null,
                     status: MatchStatus.SCHEDULED
                 };
                 return updated;
             });
        }
      }
    } else if (finalExists) {
        // Edge case: If user clears a score in group stage, remove the final
        setMatches(prev => prev.filter(m => m.type !== MatchType.FINAL));
    }
  }, [matches, standings, init]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire carom tournament?")) {
        setMatches(initializeSchedule(TEAMS));
    }
  };

  const getTeam = (id: string) => TEAMS.find(t => t.id === id)!;

  const finalMatch = matches.find(m => m.type === MatchType.FINAL);
  const groupMatches = matches.filter(m => m.type === MatchType.GROUP);

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
        
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Carom <span className="text-indigo-400 font-light">Tournament</span></h1>
            </div>
            <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
                title="Reset Tournament"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Section: Standings & Final Promo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Standings Table */}
            <div className="lg:col-span-2 space-y-6">
                 <StandingsTable stats={standings} />
                 
                 {/* Match List Grid */}
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                        Game Schedule
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupMatches.map(match => (
                            <MatchCard 
                                key={match.id}
                                match={match}
                                homeTeam={getTeam(match.homeTeamId)}
                                awayTeam={getTeam(match.awayTeamId)}
                                onUpdateScore={updateScore}
                            />
                        ))}
                    </div>
                 </div>

                 {/* Match History Section */}
                 <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                        Game History
                    </h3>
                    {(() => {
                        const completedMatches = [...matches]
                            .filter(m => m.status === MatchStatus.COMPLETED)
                            .reverse(); // Show most recent first
                        
                        if (completedMatches.length === 0) {
                            return (
                                <div className="bg-slate-900/50 rounded-xl p-8 border border-slate-800/50 text-center">
                                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <Trophy className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <h4 className="text-slate-400 font-medium mb-2">No Games Played Yet</h4>
                                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                                        Enter scores for the games above to start building your carom tournament history.
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                                {completedMatches.map((match, idx) => {
                                    const homeTeam = getTeam(match.homeTeamId);
                                    const awayTeam = getTeam(match.awayTeamId);
                                    const homeWon = match.homeScore! > match.awayScore!;
                                    const awayWon = match.awayScore! > match.homeScore!;
                                    const isDraw = match.homeScore === match.awayScore;
                                    
                                    return (
                                        <div 
                                            key={match.id}
                                            className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-all group"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Match Number */}
                                                <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-bold text-slate-400">#{completedMatches.length - idx}</span>
                                                </div>

                                                {/* Home Team */}
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="text-2xl">{homeTeam.logo}</span>
                                                    <div className="flex flex-col">
                                                        <span className={`font-semibold ${homeTeam.color} ${homeWon ? 'text-base' : 'text-sm opacity-70'}`}>
                                                            {homeTeam.name}
                                                        </span>
                                                        {homeWon && <span className="text-[10px] text-emerald-400">Winner</span>}
                                                    </div>
                                                </div>

                                                {/* Score Display */}
                                                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg">
                                                    <span className={`text-2xl font-bold ${homeWon ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {match.homeScore}
                                                    </span>
                                                    <span className="text-slate-600 font-bold">-</span>
                                                    <span className={`text-2xl font-bold ${awayWon ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {match.awayScore}
                                                    </span>
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex items-center gap-3 flex-1 justify-end">
                                                    <div className="flex flex-col items-end">
                                                        <span className={`font-semibold ${awayTeam.color} ${awayWon ? 'text-base' : 'text-sm opacity-70'}`}>
                                                            {awayTeam.name}
                                                        </span>
                                                        {awayWon && <span className="text-[10px] text-emerald-400">Winner</span>}
                                                    </div>
                                                    <span className="text-2xl">{awayTeam.logo}</span>
                                                </div>

                                                {/* Match Type Badge */}
                                                <div className="flex-shrink-0">
                                                    {match.type === MatchType.FINAL ? (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                            FINAL
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                                            GROUP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Story/Result Text */}
                                            <div className="mt-3 pt-3 border-t border-slate-800">
                                                <p className="text-sm text-slate-400 text-center">
                                                    {isDraw ? (
                                                        <>
                                                            <span className="text-slate-300">Game ended in a draw</span> with both players scoring {match.homeScore} point{match.homeScore !== 1 ? 's' : ''}.
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className={homeWon ? homeTeam.color : awayTeam.color}>
                                                                {homeWon ? homeTeam.name : awayTeam.name}
                                                            </span>
                                                            {' '}defeated{' '}
                                                            <span className={homeWon ? awayTeam.color : homeTeam.color}>
                                                                {homeWon ? awayTeam.name : homeTeam.name}
                                                            </span>
                                                            {' '}by{' '}
                                                            <span className="text-white font-semibold">
                                                                {Math.abs(match.homeScore! - match.awayScore!)} point{Math.abs(match.homeScore! - match.awayScore!) !== 1 ? 's' : ''}
                                                            </span>
                                                            {match.type === MatchType.FINAL && (
                                                                <span className="text-amber-400 font-bold"> to win the championship! 🏆</span>
                                                            )}
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                 </div>
            </div>

            {/* Right: Finals Area (Sticky on Desktop) */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
                        
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Trophy className={`w-8 h-8 ${finalMatch ? 'text-amber-400' : 'text-slate-600'}`} />
                            <div>
                                <h2 className="text-xl font-bold text-white">The Final</h2>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Championship Match</p>
                            </div>
                        </div>

                        {finalMatch ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <p className="text-sm text-slate-300 mb-4">
                                    The group stage has concluded. The top two players face off for the carom championship!
                                </p>
                                <MatchCard 
                                    match={finalMatch}
                                    homeTeam={getTeam(finalMatch.homeTeamId)}
                                    awayTeam={getTeam(finalMatch.awayTeamId)}
                                    onUpdateScore={updateScore}
                                    isFinal={true}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
                                <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <Lock className="w-5 h-5 text-slate-500" />
                                </div>
                                <h4 className="text-slate-300 font-medium">Final Locked</h4>
                                <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">
                                    Complete all 6 group stage games to unlock the final match.
                                </p>
                                <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-full transition-all duration-500" 
                                        style={{ width: `${(groupMatches.filter(m => m.status === MatchStatus.COMPLETED).length / 6) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {groupMatches.filter(m => m.status === MatchStatus.COMPLETED).length} / 6 Games Played
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Rules Summary */}
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Tournament Format</h4>
                        <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                            <li>Double Round-Robin format.</li>
                            <li>Win: 3 pts, Draw: 1 pt, Loss: 0 pts.</li>
                            <li>Tie-breakers: Points &gt; Score Diff &gt; Total Score.</li>
                            <li>Top 2 players advance to the Final.</li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>

      </main>
    </div>
  );
};

export default App;