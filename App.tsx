import React, { useState, useEffect, useMemo } from 'react';
import { initializeLeagueSchedule, initializeKnockoutSchedule, calculateStandings, progressKnockoutBracket } from './utils/calculations';
import { Match, MatchStatus, MatchType, Tournament, TournamentType, Team } from './types';
import StandingsTable from './components/StandingsTable';
import MatchCard from './components/MatchCard';
import KnockoutBracket from './components/KnockoutBracket';
import TournamentSetup from './components/TournamentSetup';
import Modal from './components/Modal';
import { Trophy, RefreshCw, Dna, Home, List } from 'lucide-react';
import * as Icons from 'lucide-react';

const App: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [init, setInit] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }>({ isOpen: false });

  // Initialize from localStorage
  useEffect(() => {
    const savedTournament = localStorage.getItem('carom_tournament');
    if (savedTournament) {
      const parsed = JSON.parse(savedTournament);
      setTournament(parsed);
      setMatches(parsed.matches || []);
    }
    setInit(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (init && tournament) {
      const updated = { ...tournament, matches };
      localStorage.setItem('carom_tournament', JSON.stringify(updated));
    }
  }, [matches, tournament, init]);

  const openModal = (opts: {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }) => {
    setModalState({ isOpen: true, ...opts });
  };

  const closeModal = () => setModalState({ isOpen: false });

  // Derived State: Standings (only for league)
  const standings = useMemo(() => {
    if (!tournament || tournament.type !== TournamentType.LEAGUE) return [];
    return calculateStandings(tournament.teams, matches);
  }, [tournament, matches]);

  // Handle Score Updates
  const updateScore = (matchId: string, homeScoreStr: string, awayScoreStr: string) => {
    setMatches(prevMatches => {
      let updated = prevMatches.map(m => {
        if (m.id !== matchId) return m;

        const homeScore = homeScoreStr === '' ? null : parseInt(homeScoreStr);
        const awayScore = awayScoreStr === '' ? null : parseInt(awayScoreStr);
        
        let status = MatchStatus.SCHEDULED;
        if (homeScore !== null && awayScore !== null) {
          status = MatchStatus.COMPLETED;
        }

        return { ...m, homeScore, awayScore, status };
      });

      // For knockout, progress the bracket
      if (tournament?.type === TournamentType.KNOCKOUT) {
        updated = progressKnockoutBracket(updated, tournament.teams);
      }

      return updated;
    });
  };

  // Create Tournament
  const handleCreateTournament = (
    name: string,
    teams: Team[],
    type: TournamentType,
    matchesPerOpponent?: number
  ) => {
    const newMatches = type === TournamentType.LEAGUE
      ? initializeLeagueSchedule(teams, matchesPerOpponent)
      : initializeKnockoutSchedule(teams);

    const newTournament: Tournament = {
      id: `tournament_${Date.now()}`,
      name,
      type,
      teams,
      matches: newMatches,
      matchesPerOpponent,
      createdAt: Date.now()
    };

    setTournament(newTournament);
    setMatches(newMatches);
  };

  // Reset Tournament
  const handleReset = () => {
    openModal({
      title: 'Reset Tournament',
      message: 'Are you sure you want to reset and create a new tournament?',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        setTournament(null);
        setMatches([]);
        localStorage.removeItem('carom_tournament');
        closeModal();
      }
    });
  };

  const getTeam = (id: string) => tournament?.teams.find(t => t.id === id);

  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Icons.Circle className={className} />;
    return <IconComponent className={className} />;
  };

  // Show setup if no tournament
  if (!tournament) {
    return (
      <>
        <TournamentSetup onCreateTournament={handleCreateTournament} onRequestConfirm={(opts: any) => openModal(opts)} />
        <Modal
          isOpen={modalState.isOpen}
          title={modalState.title}
          confirmLabel={modalState.confirmLabel}
          cancelLabel={modalState.cancelLabel}
          showCancel={modalState.showCancel}
          onConfirm={() => { modalState.onConfirm?.(); }}
          onCancel={() => closeModal()}
        >
          {modalState.message}
        </Modal>
      </>
    );
  }

  // Render League Tournament
  if (tournament.type === TournamentType.LEAGUE) {
    const groupMatches = matches.filter(m => m.type === MatchType.GROUP);
    const completedMatches = [...matches]
      .filter(m => m.status === MatchStatus.COMPLETED)
      .reverse();

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
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{tournament.name}</h1>
                  <p className="text-xs text-slate-400">League Tournament</p>
                </div>
              </div>
              <button 
                onClick={handleReset}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
                title="New Tournament"
              >
                <Home className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Standings */}
          <StandingsTable stats={standings} />

          {/* Match Schedule */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
              Game Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupMatches.map(match => {
                const homeTeam = getTeam(match.homeTeamId);
                const awayTeam = getTeam(match.awayTeamId);
                if (!homeTeam || !awayTeam) return null;
                
                return (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    onUpdateScore={updateScore}
                  />
                );
              })}
            </div>
          </div>

          {/* Match History */}
          {completedMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                Game History
              </h3>
              <div className="space-y-3">
                {completedMatches.map((match, idx) => {
                  const homeTeam = getTeam(match.homeTeamId);
                  const awayTeam = getTeam(match.awayTeamId);
                  if (!homeTeam || !awayTeam) return null;

                  const homeWon = match.homeScore! > match.awayScore!;
                  const awayWon = match.awayScore! > match.homeScore!;
                  const isDraw = match.homeScore === match.awayScore;
                  
                  return (
                    <div 
                      key={match.id}
                      className="bg-slate-900 rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-400">#{completedMatches.length - idx}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-1">
                          <span className={homeTeam.color}>{renderIcon(homeTeam.logo, 'w-6 h-6')}</span>
                          <span className={`font-semibold ${homeTeam.color} ${homeWon ? 'text-base' : 'text-sm opacity-70'}`}>
                            {homeTeam.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-lg">
                          <span className={`text-2xl font-bold ${homeWon ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-slate-500'}`}>
                            {match.homeScore}
                          </span>
                          <span className="text-slate-600 font-bold">-</span>
                          <span className={`text-2xl font-bold ${awayWon ? 'text-emerald-400' : isDraw ? 'text-slate-400' : 'text-slate-500'}`}>
                            {match.awayScore}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className={`font-semibold ${awayTeam.color} ${awayWon ? 'text-base' : 'text-sm opacity-70'}`}>
                            {awayTeam.name}
                          </span>
                          <span className={awayTeam.color}>{renderIcon(awayTeam.logo, 'w-6 h-6')}</span>
                        </div>
                      </div>

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
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
        <Modal
          isOpen={modalState.isOpen}
          title={modalState.title}
          confirmLabel={modalState.confirmLabel}
          cancelLabel={modalState.cancelLabel}
          showCancel={modalState.showCancel}
          onConfirm={() => { modalState.onConfirm?.(); }}
          onCancel={() => closeModal()}
        >
          {modalState.message}
        </Modal>
      </div>
    );
  }

  // Render Knockout Tournament
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-600 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">{tournament.name}</h1>
                <p className="text-xs text-slate-400">Knockout Tournament</p>
              </div>
            </div>
            <button 
              onClick={handleReset}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              title="New Tournament"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <List className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Tournament Bracket</h2>
          </div>
          <KnockoutBracket 
            matches={matches}
            teams={tournament.teams}
            onUpdateScore={updateScore}
          />
        </div>

        {/* Winner Announcement */}
        {(() => {
          const finalMatch = matches.find(m => m.knockoutRound === 'final');
          if (finalMatch && finalMatch.status === MatchStatus.COMPLETED && finalMatch.homeScore !== null && finalMatch.awayScore !== null) {
            const winnerId = finalMatch.homeScore > finalMatch.awayScore ? finalMatch.homeTeamId : finalMatch.awayTeamId;
            const winner = getTeam(winnerId);
            
            if (winner) {
              return (
                <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 rounded-2xl p-8 border-2 border-amber-500/50 text-center">
                  <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
                  <h2 className="text-3xl font-bold text-white mb-2">Tournament Champion!</h2>
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className={`${winner.color}`}>
                      {renderIcon(winner.logo, 'w-12 h-12')}
                    </span>
                    <span className={`text-4xl font-bold ${winner.color}`}>
                      {winner.name}
                    </span>
                  </div>
                </div>
              );
            }
          }
          return null;
        })()}
      </main>
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        confirmLabel={modalState.confirmLabel}
        cancelLabel={modalState.cancelLabel}
        showCancel={modalState.showCancel}
        onConfirm={() => { modalState.onConfirm?.(); }}
        onCancel={() => closeModal()}
      >
        {modalState.message}
      </Modal>
    </div>
  );
};

export default App;
