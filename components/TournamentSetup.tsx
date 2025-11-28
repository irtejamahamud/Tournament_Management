import React, { useState } from 'react';
import { Team, TournamentType } from '../types';
import { Plus, Trash2, Play, ArrowLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import IconSelector from './IconSelector';

interface Props {
  onCreateTournament: (
    name: string,
    teams: Team[],
    type: TournamentType,
    matchesPerOpponent?: number
  ) => void;
  onBack?: () => void;
}

const TEAM_COLORS = [
  'text-red-500',
  'text-blue-500',
  'text-emerald-500',
  'text-amber-500',
  'text-purple-500',
  'text-pink-500',
  'text-cyan-500',
  'text-orange-500',
  'text-lime-500',
  'text-teal-500',
  'text-indigo-500',
  'text-rose-500',
];

const QUICK_ICONS = [
  'Trophy', 'Target', 'Zap', 'Flame', 'Star', 'Crown', 
  'Shield', 'Sword', 'Rocket', 'ThumbsUp', 'Heart', 'Circle',
  'Square', 'Triangle', 'Diamond', 'Flag', 'Award', 'Medal',
  'Sparkles', 'Sun', 'Moon', 'CloudLightning', 'Mountain', 'Waves'
];

const TournamentSetup: React.FC<Props> = ({ onCreateTournament, onBack }) => {
  const [step, setStep] = useState(1); // 1: Name, 2: Teams, 3: Type
  const [tournamentName, setTournamentName] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState<number>(4);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournamentType, setTournamentType] = useState<TournamentType>(TournamentType.LEAGUE);
  const [matchesPerOpponent, setMatchesPerOpponent] = useState(2);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [editingTeamIndex, setEditingTeamIndex] = useState<number | null>(null);

  const handleSetNumberOfTeams = (num: number) => {
    setNumberOfTeams(num);
    const newTeams: Team[] = [];
    for (let i = 0; i < num; i++) {
      if (teams[i]) {
        newTeams.push(teams[i]);
      } else {
        newTeams.push({
          id: `team_${i + 1}`,
          name: `Team ${i + 1}`,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
          logo: 'Circle',
        });
      }
    }
    setTeams(newTeams);
  };

  const updateTeam = (index: number, field: keyof Team, value: string) => {
    const updated = [...teams];
    updated[index] = { ...updated[index], [field]: value };
    setTeams(updated);
  };

  const deleteTeam = (index: number) => {
    if (teams.length <= 2) {
      alert('You need at least 2 teams!');
      return;
    }
    const updated = teams.filter((_, i) => i !== index);
    setTeams(updated);
    setNumberOfTeams(updated.length);
  };

  const addTeam = () => {
    const newTeam: Team = {
      id: `team_${teams.length + 1}`,
      name: `Team ${teams.length + 1}`,
      color: TEAM_COLORS[teams.length % TEAM_COLORS.length],
      logo: 'Circle',
    };
    setTeams([...teams, newTeam]);
    setNumberOfTeams(teams.length + 1);
  };

  const openIconSelector = (index: number) => {
    setEditingTeamIndex(index);
    setShowIconSelector(true);
  };

  const handleIconSelect = (iconName: string) => {
    if (editingTeamIndex !== null) {
      updateTeam(editingTeamIndex, 'logo', iconName);
    }
  };

  // Inline quick-icon dropdown state
  const [openIconDropdown, setOpenIconDropdown] = useState<number | null>(null);

  const toggleIconDropdown = (index: number) => {
    setOpenIconDropdown(prev => (prev === index ? null : index));
  };

  const selectQuickIcon = (index: number, iconName: string) => {
    updateTeam(index, 'logo', iconName);
    setOpenIconDropdown(null);
  };

  const canProceedToType = () => {
    return teams.every(t => t.name.trim().length > 0);
  };

  const canCreateTournament = () => {
    if (tournamentType === TournamentType.KNOCKOUT) {
      return teams.length % 2 === 0 && teams.length >= 2;
    }
    return teams.length >= 2;
  };

  const handleCreate = () => {
    if (!canCreateTournament()) return;
    
    onCreateTournament(
      tournamentName || 'Carom Tournament',
      teams,
      tournamentType,
      tournamentType === TournamentType.LEAGUE ? matchesPerOpponent : undefined
    );
  };

  const renderIcon = (iconName: string, className: string = 'w-8 h-8') => {
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Icons.Circle className={className} />;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">Create New Tournament</h1>
          <p className="text-slate-400">Set up your carom tournament in 3 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 rounded ${
                  step > s ? 'bg-indigo-600' : 'bg-slate-800'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Tournament Name */}
        {step === 1 && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: Tournament Name</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="e.g., Summer Carom Championship 2025"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Next: Add Teams
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Teams */}
        {step === 2 && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Add Teams</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Teams
              </label>
              <input
                type="number"
                min="2"
                max="32"
                value={numberOfTeams}
                onChange={(e) => handleSetNumberOfTeams(parseInt(e.target.value) || 2)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {teams.map((team, index) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700"
                >
                  <button
                    onClick={() => openIconSelector(index)}
                    className={`flex-shrink-0 w-16 h-16 flex items-center justify-center ${team.color} bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border-2 border-slate-600`}
                    title="Click to browse all icons"
                  >
                    {renderIcon(team.logo)}
                  </button>
                  
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeam(index, 'name', e.target.value)}
                    placeholder="Team name"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <select
                    value={team.color}
                    onChange={(e) => updateTeam(index, 'color', e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TEAM_COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color.replace('text-', '').replace('-500', '')}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleIconDropdown(index)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none"
                    >
                      <span className="w-5 h-5 flex items-center justify-center">{renderIcon(team.logo, 'w-5 h-5')}</span>
                      <span className="text-sm truncate">{team.logo}</span>
                      <span className="ml-2 text-slate-400">▾</span>
                    </button>

                    {openIconDropdown === index && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg p-1 z-50 max-h-48 overflow-auto">
                        {QUICK_ICONS.map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => selectQuickIcon(index, iconName)}
                            className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-700 text-left"
                          >
                            <span className="w-5 h-5 flex items-center justify-center">{renderIcon(iconName, 'w-5 h-5')}</span>
                            <span className="text-sm">{iconName}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {teams.length > 2 && (
                    <button
                      onClick={() => deleteTeam(index)}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addTeam}
              className="w-full mb-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Plus className="w-5 h-5" />
              Add Another Team
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedToType()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next: Tournament Type
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tournament Type */}
        {step === 3 && (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-6">Step 3: Tournament Type</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setTournamentType(TournamentType.LEAGUE)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  tournamentType === TournamentType.LEAGUE
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">League</h3>
                <p className="text-sm text-slate-400">
                  Round-robin format where every team plays against every other team.
                  Points are awarded based on wins, draws, and losses.
                </p>
              </button>

              <button
                onClick={() => setTournamentType(TournamentType.KNOCKOUT)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  tournamentType === TournamentType.KNOCKOUT
                    ? 'border-indigo-500 bg-indigo-500/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">Knockout</h3>
                <p className="text-sm text-slate-400">
                  Single-elimination tournament. Lose once and you're out.
                  Requires an even number of teams.
                </p>
                {teams.length % 2 !== 0 && (
                  <p className="text-xs text-rose-400 mt-2">
                    ⚠️ You need an even number of teams for knockout!
                  </p>
                )}
              </button>
            </div>

            {tournamentType === TournamentType.LEAGUE && (
              <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How many times should each team play against each other?
                </label>
                <select
                  value={matchesPerOpponent}
                  onChange={(e) => setMatchesPerOpponent(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={1}>Once (Single Round-Robin)</option>
                  <option value={2}>Twice (Double Round-Robin)</option>
                  <option value={3}>Three times</option>
                  <option value={4}>Four times</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Total games: {(teams.length * (teams.length - 1) / 2) * matchesPerOpponent}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreateTournament()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Create Tournament
              </button>
            </div>
          </div>
        )}

        {showIconSelector && (
          <IconSelector
            selectedIcon={editingTeamIndex !== null ? teams[editingTeamIndex].logo : 'Circle'}
            onSelect={handleIconSelect}
            onClose={() => {
              setShowIconSelector(false);
              setEditingTeamIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TournamentSetup;
