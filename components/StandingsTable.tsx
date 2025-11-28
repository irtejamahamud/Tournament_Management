import React from 'react';
import { TeamStats } from '../types';
import { Trophy, Target, ShieldAlert, Activity } from 'lucide-react';

interface Props {
  stats: TeamStats[];
}

const StandingsTable: React.FC<Props> = ({ stats }) => {
  return (
    <div className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-800">
      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white">Tournament Standings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs uppercase bg-slate-800 text-slate-300">
            <tr>
              <th scope="col" className="px-4 py-3 w-12 text-center">#</th>
              <th scope="col" className="px-4 py-3">Team</th>
              <th scope="col" className="px-3 py-3 text-center" title="Played">P</th>
              <th scope="col" className="px-3 py-3 text-center text-emerald-400" title="Won">W</th>
              <th scope="col" className="px-3 py-3 text-center text-amber-400" title="Drawn">D</th>
              <th scope="col" className="px-3 py-3 text-center text-rose-400" title="Lost">L</th>
              <th scope="col" className="px-3 py-3 text-center hidden sm:table-cell" title="Point Difference">PD</th>
              <th scope="col" className="px-4 py-3 text-center font-bold text-white text-base">Pts</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((team, index) => (
              <tr 
                key={team.id} 
                className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${index === 0 ? 'bg-indigo-900/10' : ''}`}
              >
                <td className="px-4 py-3 text-center font-medium">
                  {index + 1}
                  {index === 0 && <Trophy className="w-3 h-3 text-yellow-500 inline ml-1" />}
                </td>
                <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                  <span className="text-xl">{team.logo}</span>
                  <span className={`${team.color}`}>{team.name}</span>
                </td>
                <td className="px-3 py-3 text-center">{team.played}</td>
                <td className="px-3 py-3 text-center text-emerald-500/80 font-medium">{team.won}</td>
                <td className="px-3 py-3 text-center text-amber-500/80">{team.drawn}</td>
                <td className="px-3 py-3 text-center text-rose-500/80">{team.lost}</td>
                <td className="px-3 py-3 text-center hidden sm:table-cell font-mono">
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="px-4 py-3 text-center font-bold text-white text-base bg-slate-800/30">
                  {team.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-900 text-xs text-slate-500 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> PF: Points For</span>
          <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> PA: Points Against</span>
        </div>
        <div>Top 2 Qualify</div>
      </div>
    </div>
  );
};

export default StandingsTable;
