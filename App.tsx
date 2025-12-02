import React, { useState } from 'react';
import { UploadZone } from './components/UploadZone';
import { FUTCard } from './components/FUTCard';
import { TeamPitch } from './components/TeamPitch';
import { TeamStats } from './components/TeamStats';
import { RosterModal } from './components/RosterModal';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { 
  CardData, FileType, TeamLineup, PositionRole, 
  ROLE_LABELS, FORMATIONS, Formation, TeamSynergy 
} from './types';
import { analyzeResume, analyzeTeamSynergy, autoArrangeLineup } from './services/geminiService';
import { fileToBase64, detectFileType, extractTextFromDocx } from './utils/parser';
import { Trophy, Users, PlusCircle, LayoutDashboard, ArrowLeft, Briefcase, Eye, ChevronDown } from 'lucide-react';

type ViewMode = 'scout' | 'team';

function App() {
  // Application State
  const [viewMode, setViewMode] = useState<ViewMode>('team');
  
  // Formation State
  const [currentFormation, setCurrentFormation] = useState<Formation>(FORMATIONS[0]);
  
  // Roster State (All Uploaded Candidates)
  const [roster, setRoster] = useState<CardData[]>([]);
  
  // Lineup State (Assigned Roles)
  const [lineup, setLineup] = useState<TeamLineup>({
    players: {}, 
    scrumMasterId: null
  });

  // Analysis State
  const [teamAnalysis, setTeamAnalysis] = useState<TeamSynergy | null>(null);
  const [isAnalyzingTeam, setIsAnalyzingTeam] = useState(false);
  const [isArranging, setIsArranging] = useState(false);

  // Scouting State
  const [currentScout, setCurrentScout] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<PositionRole | null>(null);
  
  // Detail View State
  const [viewingPlayer, setViewingPlayer] = useState<CardData | null>(null);

  // Handlers
  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const type = detectFileType(file);
      let base64 = '';
      let text = '';

      if (type === FileType.PDF) {
        base64 = await fileToBase64(file);
      } else if (type === FileType.DOCX) {
        text = await extractTextFromDocx(file);
      } else {
        throw new Error("Unsupported file type. Please use PDF or DOCX.");
      }

      const data = await analyzeResume(base64, type, text);
      setCurrentScout(data);
      // Automatically add to roster if valid
      setRoster(prev => [...prev, data]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to parse resume");
    } finally {
      setLoading(false);
    }
  };

  const handleScoutReset = () => {
    setCurrentScout(null);
    setError(null);
  };

  const handleSlotClick = (role: PositionRole) => {
    setSelectedRole(role);
    setModalOpen(true);
  };

  const handleRemoveFromSlot = (role: PositionRole) => {
    setLineup(prev => {
      const player = prev.players[role];
      const newPlayers = { ...prev.players };
      delete newPlayers[role];

      let newScrumMasterId = prev.scrumMasterId;
      if (player && prev.scrumMasterId === player.id) {
        newScrumMasterId = null;
      }
      
      return { 
        ...prev, 
        players: newPlayers, 
        scrumMasterId: newScrumMasterId 
      };
    });
    // Reset analysis when lineup changes
    setTeamAnalysis(null);
  };

  const handleSetScrumMaster = (playerId: string) => {
    setLineup(prev => ({
        ...prev,
        scrumMasterId: prev.scrumMasterId === playerId ? null : playerId
    }));
  };

  const handlePlayerSelect = (candidate: CardData) => {
    if (selectedRole) {
      setLineup(prev => {
        const newPlayers = { ...prev.players };

        // 1. Check if player is already in another slot and remove them
        for (const key of Object.keys(newPlayers)) {
           // Explicit check to avoid TS errors
           const p = newPlayers[key] as CardData | null;
           if (p?.id === candidate.id) {
             delete newPlayers[key];
           }
        }

        // 2. Assign to new slot
        newPlayers[selectedRole] = candidate;
        
        return {
          ...prev,
          players: newPlayers
        };
      });
      
      setModalOpen(false);
      setSelectedRole(null);
      // Reset analysis when lineup changes
      setTeamAnalysis(null);
    }
  };

  const handlePlayerUpdate = (updatedPlayer: CardData) => {
    setRoster(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    setLineup(prev => {
      const newPlayers = { ...prev.players };
      let changed = false;
      for (const key in newPlayers) {
        const p = newPlayers[key] as CardData | null;
        if (p?.id === updatedPlayer.id) {
          newPlayers[key] = updatedPlayer;
          changed = true;
        }
      }
      return changed ? { ...prev, players: newPlayers } : prev;
    });
    if (currentScout?.id === updatedPlayer.id) setCurrentScout(updatedPlayer);
    if (viewingPlayer?.id === updatedPlayer.id) setViewingPlayer(updatedPlayer);
  };

  const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const formationId = e.target.value;
    const newFormation = FORMATIONS.find(f => f.id === formationId);
    if (newFormation) {
      setCurrentFormation(newFormation);
      setTeamAnalysis(null); // Reset analysis on formation change
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzingTeam(true);
    try {
      const result = await analyzeTeamSynergy(lineup, currentFormation);
      setTeamAnalysis(result);
    } catch (err) {
      console.error("Analysis failed", err);
      // Optional: Add toast or error state
    } finally {
      setIsAnalyzingTeam(false);
    }
  };

  const handleAutoArrange = async () => {
    if (roster.length === 0) return;
    setIsArranging(true);
    setTeamAnalysis(null); // Clear old analysis

    try {
      const assignmentMap = await autoArrangeLineup(roster, currentFormation);
      
      const newPlayers: Record<string, CardData | null> = {};
      
      // Map IDs back to player objects
      for (const [slotId, playerId] of Object.entries(assignmentMap)) {
        const player = roster.find(p => p.id === playerId);
        if (player) {
          newPlayers[slotId] = player;
        }
      }

      setLineup(prev => ({
        ...prev,
        players: newPlayers,
        // Optional: Keep SM if they are still in the lineup, else clear
        scrumMasterId: newPlayers[Object.keys(newPlayers).find(key => newPlayers[key]?.id === prev.scrumMasterId) || ''] ? prev.scrumMasterId : null
      }));

    } catch (err) {
      console.error("Auto arrange failed", err);
    } finally {
      setIsArranging(false);
    }
  };

  const getPlayerRole = (playerId: string) => {
    for (const [key, val] of Object.entries(lineup.players)) {
      if (val && val.id === playerId) {
        return ROLE_LABELS[key] || key;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-slate-900 flex flex-col text-white font-roboto">
      
      {/* Header */}
      <header className="p-4 border-b border-slate-800/50 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg shadow-lg shadow-yellow-500/20">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-oswald font-bold text-white uppercase tracking-wider">Talent Scout</h1>
              <p className="text-xs text-slate-400">Agile Team Builder</p>
            </div>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
             <button 
                onClick={() => setViewMode('team')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold uppercase transition-all ${viewMode === 'team' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
                <Users className="w-4 h-4" /> Squad
             </button>
             <button 
                onClick={() => setViewMode('scout')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold uppercase transition-all ${viewMode === 'scout' ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
             >
                <PlusCircle className="w-4 h-4" /> Scout
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 w-full max-w-7xl mx-auto">
        
        {viewMode === 'scout' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {!currentScout ? (
               <div className="max-w-2xl w-full text-center mt-12">
                 <h2 className="text-4xl font-oswald font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-4 uppercase">
                    Scout New Talent
                 </h2>
                 <p className="text-slate-400 mb-8">Upload a resume to parse attributes and add them to your club roster.</p>
                 <UploadZone onFileSelect={handleFileSelect} isProcessing={loading} />
                 {error && <p className="mt-4 text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">{error}</p>}
               </div>
            ) : (
               <div className="w-full flex flex-col md:flex-row gap-8 justify-center mt-8">
                  <div className="flex flex-col items-center">
                     <FUTCard 
                       data={currentScout} 
                       onImageUpdate={(img) => handlePlayerUpdate({ ...currentScout, imageUrl: img })}
                     />
                     <div className="flex gap-4 mt-6">
                        <button onClick={handleScoutReset} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                           <ArrowLeft className="w-4 h-4" /> Scout Another
                        </button>
                        <button onClick={() => setViewMode('team')} className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20">
                           <Briefcase className="w-4 h-4" /> Go to Squad
                        </button>
                     </div>
                  </div>
                  <div className="w-full md:w-1/3 bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-md">
                     <h3 className="text-xl font-oswald text-yellow-500 mb-4">Scout Report</h3>
                     <p className="text-slate-300 italic">"{currentScout.summary}"</p>
                     <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-center font-bold">
                        Player Added to Club Roster
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

        {viewMode === 'team' && (
           <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Left Sidebar: Stats & Roster */}
              <div className="lg:col-span-1 order-2 lg:order-1 space-y-6">
                 <TeamStats 
                   lineup={lineup} 
                   analysis={teamAnalysis}
                   onAnalyze={handleRunAnalysis}
                   onAutoArrange={handleAutoArrange}
                   isAnalyzing={isAnalyzingTeam}
                   isArranging={isArranging}
                 />
                 
                 <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 backdrop-blur-md">
                    <h3 className="font-oswald text-xl uppercase text-slate-300 mb-4 flex items-center gap-2">
                       <LayoutDashboard className="w-5 h-5 text-yellow-500" /> Club Roster
                    </h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                       {roster.map(player => {
                          const activeRole = getPlayerRole(player.id);
                          return (
                            <div 
                              key={player.id} 
                              className={`flex items-center gap-3 p-2 rounded border transition-all cursor-pointer hover:bg-slate-700/50 ${
                                activeRole 
                                  ? 'bg-slate-900 border-slate-700 opacity-60 grayscale-[0.5]' 
                                  : 'bg-slate-900/50 border-slate-700/50'
                              }`}
                              onClick={() => setViewingPlayer(player)}
                            >
                               <div className="relative">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-yellow-500 ${activeRole ? 'bg-slate-800' : 'bg-slate-700'}`}>
                                    {player.overall}
                                 </div>
                                 {activeRole && (
                                   <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-slate-900" title="Active"></div>
                                 )}
                               </div>
                               <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold truncate text-white">{player.name}</div>
                                  {activeRole ? (
                                    <div className="text-[10px] font-bold uppercase text-yellow-500 truncate">
                                       {activeRole}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 truncate">{player.position}</div>
                                  )}
                               </div>
                               <button className="p-1 text-slate-500 hover:text-white">
                                 <Eye className="w-4 h-4" />
                               </button>
                            </div>
                          );
                       })}
                       {roster.length === 0 && (
                          <div className="text-center py-8 text-slate-500 text-sm">
                             No players found. <br/> Switch to <span className="text-yellow-500 font-bold cursor-pointer" onClick={() => setViewMode('scout')}>Scout</span> mode.
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Center: Pitch */}
              <div className="lg:col-span-3 order-1 lg:order-2">
                 
                 {/* Formation Selector */}
                 <div className="mb-4 flex justify-end items-center">
                    <div className="relative inline-block w-64">
                      <select 
                        value={currentFormation.id}
                        onChange={handleFormationChange}
                        className="block w-full appearance-none bg-slate-800 border border-slate-600 text-white py-2 px-4 pr-8 rounded shadow leading-tight focus:outline-none focus:border-yellow-500 font-bold"
                      >
                        {FORMATIONS.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-yellow-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="ml-4 text-slate-400 text-xs italic max-w-xs hidden md:block">
                      {currentFormation.description}
                    </div>
                 </div>

                 <TeamPitch 
                   lineup={lineup} 
                   formation={currentFormation}
                   analysis={teamAnalysis}
                   onSlotClick={handleSlotClick} 
                   onRemovePlayer={handleRemoveFromSlot}
                   onSetScrumMaster={handleSetScrumMaster}
                   onViewDetails={setViewingPlayer}
                 />
              </div>
           </div>
        )}

      </main>

      {/* Modals */}
      <RosterModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        candidates={roster}
        onSelect={handlePlayerSelect}
        roleLabel={selectedRole ? (ROLE_LABELS[selectedRole] || selectedRole) : ''}
        lineup={lineup}
      />
      
      <PlayerDetailModal 
        player={viewingPlayer}
        onClose={() => setViewingPlayer(null)}
        onUpdatePlayer={handlePlayerUpdate}
      />

    </div>
  );
}

export default App;