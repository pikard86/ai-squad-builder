import React, { useState } from 'react';
import { TeamLineup, CardData, TeamSynergy, ROLE_LABELS } from '../types';
import { RadarGraph } from './RadarGraph';
import { BrainCircuit, Loader2, Maximize2, Minimize2, Wand2 } from 'lucide-react';

interface TeamStatsProps {
  lineup: TeamLineup;
  analysis: TeamSynergy | null;
  onAnalyze: () => void;
  onAutoArrange: () => void;
  isAnalyzing: boolean;
  isArranging: boolean;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ 
  lineup, 
  analysis, 
  onAnalyze, 
  onAutoArrange, 
  isAnalyzing, 
  isArranging 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Use AI score if available, else simple average
  const displayScore = analysis ? analysis.overallScore : (players.length 
    ? Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length)
    : 0);

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 backdrop-blur-md text-white h-full flex flex-col transition-all relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 border-b border-slate-600 pb-2">
        <h3 className="font-oswald text-xl uppercase text-yellow-500">Team Chemistry</h3>
        <div className="flex items-center gap-2">
           <span className="text-xs text-slate-400 uppercase">SYN</span>
           <span className={`text-2xl font-bold font-oswald ${analysis ? (displayScore >= 80 ? 'text-green-400' : displayScore >= 50 ? 'text-yellow-400' : 'text-red-400') : 'text-white'}`}>
             {displayScore}
           </span>
        </div>
      </div>

      {playerCount > 0 || isArranging ? (
        <>
           <div className="flex-1 min-h-[200px] relative rounded-lg overflow-hidden">
             <RadarGraph attributes={avgAttributes} />
             
             {/* Overlay for Analysis Text */}
             {analysis && (
               <div className={`absolute left-0 right-0 transition-all duration-300 ease-in-out ${isExpanded ? 'top-0 bottom-0 bg-slate-900/95 z-20 overflow-y-auto' : 'bottom-0 bg-slate-900/90'} p-3 rounded border-t border-slate-700 backdrop-blur-sm flex flex-col`}>
                 <div className="flex justify-between items-start mb-2 shrink-0">
                   <p className="text-yellow-500 font-bold text-sm flex items-center gap-2">
                     <BrainCircuit className="w-3 h-3" /> AI Insight
                   </p>
                   <button 
                      onClick={() => setIsExpanded(!isExpanded)} 
                      className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                   >
                      {isExpanded ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                   </button>
                 </div>
                 
                 <div className="text-slate-300 italic text-xs leading-relaxed">
                    <p className={!isExpanded ? 'line-clamp-3' : 'mb-4'}>
                      {analysis.summary}
                    </p>

                    {isExpanded && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <h4 className="text-[10px] font-bold uppercase text-slate-500 border-b border-slate-700 pb-1 mt-4">
                             Role Fit Breakdown
                           </h4>
                           <div className="space-y-3">
                               {Object.values(analysis.roleFitness).map(fit => (
                                  <div key={fit.roleId} className="text-xs border-b border-slate-800/50 pb-2 last:border-0">
                                     <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-200">
                                            {ROLE_LABELS[fit.roleId] || fit.roleId}
                                        </span>
                                        <span className={`font-mono font-bold ${fit.score >= 80 ? 'text-green-400' : fit.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                           {fit.score}
                                        </span>
                                     </div>
                                     <p className="text-slate-400 text-[11px]">{fit.reason}</p>
                                  </div>
                               ))}
                           </div>
                        </div>
                    )}
                 </div>
               </div>
             )}
           </div>
           
           <div className="mt-4 space-y-3 shrink-0">
              <div className="grid grid-cols-2 gap-2">
                 <button 
                   onClick={onAutoArrange}
                   disabled={isArranging || isAnalyzing}
                   className="py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold uppercase text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-black"
                 >
                   {isArranging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                   {isArranging ? 'Arranging...' : 'Auto Pick'}
                 </button>

                 <button 
                   onClick={onAnalyze}
                   disabled={isAnalyzing || isArranging || playerCount === 0}
                   className="py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded font-bold uppercase text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                   {isAnalyzing ? 'Analyzing...' : 'Insight'}
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                  {avgAttributes.map(attr => (
                    <div key={attr.label} className="flex justify-between items-center text-xs bg-slate-900/50 p-1.5 rounded">
                      <span className="text-slate-400 font-bold">{attr.label}</span>
                      <span className={`${attr.value > 80 ? 'text-green-400' : attr.value > 70 ? 'text-yellow-400' : 'text-slate-200'} font-mono`}>
                        {attr.value}
                      </span>
                    </div>
                  ))}
              </div>
           </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm italic space-y-4">
          <p>Add players to see stats.</p>
          <button 
             onClick={onAutoArrange}
             disabled={isArranging}
             className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600 hover:text-black border border-yellow-600 text-yellow-500 rounded font-bold uppercase text-xs shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isArranging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
             Auto Arrange Squad
           </button>
        </div>
      )}
    </div>
  );
};