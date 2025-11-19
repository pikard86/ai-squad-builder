import React from 'react';
import { CardData } from '../types';
import { FUTCard } from './FUTCard';
import { RadarGraph } from './RadarGraph';
import { X, Code2 } from 'lucide-react';

interface PlayerDetailModalProps {
  player: CardData | null;
  onClose: () => void;
  onUpdatePlayer: (player: CardData) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose, onUpdatePlayer }) => {
  if (!player) return null;

  const handleImageUpdate = (imageUrl: string) => {
    onUpdatePlayer({ ...player, imageUrl });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-slate-900/95 p-6 md:p-8 rounded-3xl border border-[#b98e28]/30 shadow-2xl max-w-6xl w-full flex flex-col lg:flex-row gap-8 relative overflow-hidden max-h-[90vh]" 
        onClick={e => e.stopPropagation()}
      >
         {/* Background Texture */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

         <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-50 transition-colors bg-slate-800/50 p-2 rounded-full">
           <X className="w-6 h-6" />
         </button>

         {/* Left Column: Card */}
         <div className="flex-shrink-0 flex justify-center items-center lg:w-1/3">
            <FUTCard 
              data={player} 
              variant="full" 
              onImageUpdate={handleImageUpdate}
            />
         </div>

         {/* Right Column: Details */}
         <div className="flex-1 flex flex-col text-white relative z-10 min-w-0 overflow-y-auto pr-2 custom-scrollbar">
            <div className="mb-4 border-b border-slate-700 pb-4">
                <h2 className="text-4xl md:text-5xl font-oswald font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2 drop-shadow-sm">
                    {player.name}
                </h2>
                <div className="flex items-center gap-3">
                    <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold font-oswald uppercase text-sm">
                        {player.position}
                    </span>
                    <span className="text-slate-400 font-roboto text-sm flex items-center gap-1">
                        <span className="w-4 h-3 inline-block bg-slate-700 rounded-sm"></span> {player.nationality}
                    </span>
                </div>
            </div>
            
            {/* Summary Box */}
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 mb-6 backdrop-blur-md">
               <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Scout Summary</h3>
               <p className="italic text-slate-300 text-lg leading-relaxed">"{player.summary}"</p>
            </div>

            {/* Stats Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Attribute Radar */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 flex flex-col">
                   <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 text-center">Attribute Profile</h3>
                   <div className="flex-1 min-h-[250px]">
                      <RadarGraph attributes={player.attributes} />
                   </div>
                </div>

                {/* Tech Skills Progress Bars */}
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 flex flex-col">
                   <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                      <Code2 className="w-4 h-4" /> Technical Mastery
                   </h3>
                   
                   <div className="space-y-3 overflow-y-auto pr-2 max-h-[250px] custom-scrollbar">
                      {player.techSkills && player.techSkills.length > 0 ? (
                        player.techSkills.map((skill, idx) => (
                          <div key={idx} className="group">
                             <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold text-slate-200">{skill.name}</span>
                                <span className="font-mono text-yellow-500">{skill.rating}</span>
                             </div>
                             <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${skill.rating}%` }}
                                />
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 text-sm italic text-center mt-8">
                           No detailed tech metrics available.
                        </div>
                      )}
                   </div>
                </div>

            </div>
         </div>
      </div>
    </div>
  );
};