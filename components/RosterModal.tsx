import React from 'react';
import { CardData, PositionRole, ROLE_LABELS, TeamLineup } from '../types';
import { FUTCard } from './FUTCard';
import { X, RefreshCcw } from 'lucide-react';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CardData[];
  onSelect: (candidate: CardData) => void;
  roleLabel: string;
  lineup: TeamLineup;
}

export const RosterModal: React.FC<RosterModalProps> = ({ isOpen, onClose, candidates, onSelect, roleLabel, lineup }) => {
  if (!isOpen) return null;

  // Helper to find if candidate is already assigned
  const getExistingRole = (candidateId: string): string | null => {
    // Iterate over values of the players record
    for (const [key, player] of Object.entries(lineup.players)) {
       const p = player as CardData | null;
       if (p && p.id === candidateId) {
          return ROLE_LABELS[key] || key;
       }
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h3 className="text-2xl font-oswald text-white uppercase">Select Player</h3>
            <p className="text-yellow-500 font-roboto text-sm">Assigning to: {roleLabel}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
           {candidates.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
               <p>No candidates available in the club.</p>
               <p className="text-sm">Go to the Scout tab to upload resumes.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {candidates.map(candidate => {
                  const existingRole = getExistingRole(candidate.id);
                  
                  return (
                    <div key={candidate.id} className="transform hover:scale-105 transition-transform relative">
                       <FUTCard 
                          data={candidate} 
                          variant="mini" 
                          onClick={() => onSelect(candidate)} 
                       />
                       
                       {existingRole && (
                         <div className="absolute top-2 left-2 right-2 bg-slate-900/90 text-yellow-500 text-[10px] font-bold uppercase p-1 text-center rounded border border-yellow-500/50 backdrop-blur-sm z-20">
                            Currently: {existingRole}
                         </div>
                       )}

                       <button 
                         onClick={() => onSelect(candidate)}
                         className={`w-full mt-2 py-2 font-bold uppercase text-xs rounded shadow-lg flex items-center justify-center gap-2 ${
                            existingRole 
                            ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500' 
                            : 'bg-yellow-600 hover:bg-yellow-500 text-black'
                         }`}
                       >
                         {existingRole ? (
                            <><RefreshCcw className="w-3 h-3" /> Move Here</>
                         ) : (
                            "Select"
                         )}
                       </button>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};