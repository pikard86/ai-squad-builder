import React from 'react';
import { TeamLineup, CardData } from '../types';
import { RadarGraph } from './RadarGraph';

interface TeamStatsProps {
  lineup: TeamLineup;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ lineup }) => {
  // Extract players from the dynamic record
  const players = Object.values(lineup.players).filter((p): p is CardData => p !== null);

  const playerCount = players.length;

  // Calculate average attributes
  const attributeTotals = new Map<string, number>();
  
  players.forEach(player => {
    player.attributes.forEach(attr => {
      const current = attributeTotals.get(attr.label) || 0;
      attributeTotals.set(attr.label, current + attr.value);
    });
  });

  const avgAttributes = Array.from(attributeTotals.entries()).map(([label, total]) => ({
    label,
    value: Math.round(total / (playerCount || 1)),
    fullLabel: label // Simplified for aggregation
  }));

  const teamOverall = players.length 
    ? Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length)
    : 0;

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 backdrop-blur-md text-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-2">
        <h3 className="font-oswald text-xl uppercase text-yellow-500">Team Chemistry</h3>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-400 uppercase">OVR</span>
           <span className="text-2xl font-bold font-oswald text-white">{teamOverall}</span>
        </div>
      </div>

      {playerCount > 0 ? (
        <>
           <div className="flex-1 min-h-[200px]">
             <RadarGraph attributes={avgAttributes} />
           </div>
           <div className="grid grid-cols-2 gap-2 mt-4">
              {avgAttributes.map(attr => (
                <div key={attr.label} className="flex justify-between items-center text-sm bg-slate-900/50 p-2 rounded">
                  <span className="text-slate-400 font-bold">{attr.label}</span>
                  <span className={`${attr.value > 80 ? 'text-green-400' : attr.value > 70 ? 'text-yellow-400' : 'text-slate-200'} font-mono`}>
                    {attr.value}
                  </span>
                </div>
              ))}
           </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm italic">
          Add players to the roster to see team stats.
        </div>
      )}
    </div>
  );
};