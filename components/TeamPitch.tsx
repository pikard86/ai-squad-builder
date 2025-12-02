import React from 'react';
import { TeamLineup, PositionRole, ROLE_LABELS, CardData, Formation, TeamSynergy } from '../types';
import { FUTCard } from './FUTCard';
import { Plus, X, Crown, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamPitchProps {
  lineup: TeamLineup;
  formation: Formation;
  analysis: TeamSynergy | null;
  onSlotClick: (role: PositionRole) => void;
  onRemovePlayer: (role: PositionRole) => void;
  onSetScrumMaster: (playerId: string) => void;
  onViewDetails: (player: CardData) => void;
}

export const TeamPitch: React.FC<TeamPitchProps> = ({ lineup, formation, analysis, onSlotClick, onRemovePlayer, onSetScrumMaster, onViewDetails }) => {
  
  const Slot: React.FC<{ role: PositionRole, top: string, left: string }> = ({ role, top, left }) => {
    const player = lineup.players[role];
    const isScrumMaster = player ? lineup.scrumMasterId === player.id : false;
    const label = ROLE_LABELS[role] || role;
    
    // Get fitness for this specific slot if analysis exists
    const fitness = analysis?.roleFitness[role];

    return (
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
        style={{ top, left }}
      >
         <div className="flex flex-col items-center group">
            {player ? (
                <div className="relative">
                  <div onClick={() => onViewDetails(player)} title="Click for Details">
                    <FUTCard 
                      data={player} 
                      variant="mini" 
                      isScrumMaster={isScrumMaster} 
                      fitness={fitness}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute -top-2 -right-4 flex flex-col gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSlotClick(role); }}
                      className="bg-yellow-500 text-black p-1.5 rounded-full shadow-md hover:bg-yellow-400 hover:scale-110 transition-all border border-black/20"
                      title="Swap Player"
                    >
                      <RefreshCcw className="w-3 h-3" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemovePlayer(role); }}
                      className="bg-red-600 text-white p-1.5 rounded-full shadow-md hover:bg-red-500 hover:scale-110 transition-all border border-black/20"
                      title="Remove from Squad"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onSetScrumMaster(player.id); }}
                      className={`p-1.5 rounded-full shadow-md hover:scale-110 transition-all border border-black/20 ${isScrumMaster ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                      title="Toggle Scrum Master"
                    >
                      <Crown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
            ) : (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSlotClick(role)}
                  className="w-[120px] h-[160px] border-2 border-dashed border-slate-500/50 rounded-xl bg-slate-800/30 backdrop-blur-sm flex flex-col items-center justify-center group hover:border-yellow-500 hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                   <Plus className="w-8 h-8 text-slate-500 group-hover:text-yellow-500 mb-2" />
                   <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-white">Add Player</span>
                </motion.button>
            )}
            <div className="mt-2 bg-slate-900/80 text-white px-3 py-1 rounded text-xs font-bold uppercase border border-slate-600 shadow-lg backdrop-blur-md whitespace-nowrap z-20 pointer-events-none">
                {label}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-[800px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Pitch Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:100px_100px]" />
      
      {/* Center Circle Decoration */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-slate-600/30 rounded-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-600/50 rounded-full" />

      {/* Manager Zone (Top Box) */}
      <div className="absolute top-0 left-0 right-0 h-[180px] bg-gradient-to-b from-black/40 to-transparent border-b border-slate-700/30" />

      {/* Dynamic Positions from Formation */}
      {formation.slots.map((slot) => (
        <Slot 
          key={slot.id} 
          role={slot.id} 
          top={slot.position.top} 
          left={slot.position.left} 
        />
      ))}

    </div>
  );
};