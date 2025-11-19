import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '../types';
import { motion } from 'framer-motion';
import { Upload, User, Crown } from 'lucide-react';
import { RadarGraph } from './RadarGraph';

interface FUTCardProps {
  data: CardData;
  initialImage?: string | null;
  variant?: 'full' | 'mini';
  onClick?: () => void;
  isScrumMaster?: boolean;
  onImageUpdate?: (image: string) => void;
}

export const FUTCard: React.FC<FUTCardProps> = ({ 
  data, 
  initialImage, 
  variant = 'full', 
  onClick, 
  isScrumMaster = false,
  onImageUpdate
}) => {
  // Prioritize initialImage, then data.imageUrl, then null
  const [image, setImage] = useState<string | null>(initialImage || data.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local image state in sync if prop changes (e.g. swapping players or data update)
  useEffect(() => {
    if (initialImage) setImage(initialImage);
    else if (data.imageUrl) setImage(data.imageUrl);
    // Note: we don't reset to null here automatically to avoid clearing valid uploads if data.imageUrl is undefined initially
    else if (data.id && !image) setImage(null); 
  }, [initialImage, data.imageUrl, data.id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setImage(result);
        if (onImageUpdate) {
          onImageUpdate(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Attribute mapping for layout (Top 3 left, Bottom 3 right/left split logic)
  const leftStats = data.attributes.slice(0, 3);
  const rightStats = data.attributes.slice(3, 6);

  if (variant === 'mini') {
    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="relative w-[140px] h-[190px] cursor-pointer perspective-1000"
        onClick={onClick}
      >
         <div className={`absolute inset-0 fut-card-bg rounded-xl shadow-lg border overflow-hidden text-[#362d18] ${isScrumMaster ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-[#b98e28]'}`}>
            <div className="absolute inset-0 fut-card-inner opacity-30 z-0 pointer-events-none" />
            <div className="relative z-10 p-2 flex flex-col h-full items-center">
               <div className="flex justify-between w-full items-start">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold font-oswald leading-none">{data.overall}</span>
                    <div className="w-5 h-3 bg-slate-800/10 border border-slate-800/20 rounded flex items-center justify-center text-[6px] font-bold uppercase mt-1 overflow-hidden">
                       {data.nationality.substring(0,3)}
                    </div>
                  </div>
                  {isScrumMaster && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-bl-lg p-1 shadow-md z-20" title="Scrum Master">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
               </div>
               
               <div className="relative w-16 h-16 my-1 rounded-full overflow-hidden border-2 border-[#362d18]/20 bg-[#362d18]/5">
                   {image ? (
                     <img src={image} alt="Candidate" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-full h-full p-3 text-[#362d18] opacity-50" />
                   )}
               </div>

               <div className="w-full text-center truncate px-1">
                 <span className="font-oswald font-bold uppercase text-sm block truncate">{data.name}</span>
                 <span className="text-[10px] font-roboto uppercase opacity-80 block truncate">{data.position}</span>
               </div>
            </div>
         </div>
         {isScrumMaster && (
             <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow uppercase tracking-widest border border-blue-400 z-20 whitespace-nowrap">
                 Scrum Master
             </div>
         )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="relative w-[340px] h-[520px] mx-auto perspective-1000"
      onClick={onClick}
    >
      {/* Card Container */}
      <div className="absolute inset-0 fut-card-bg rounded-t-[2rem] rounded-b-[2rem] shadow-2xl border-2 border-[#b98e28] overflow-hidden text-[#362d18]">
        
        {/* Inner Texture */}
        <div className="absolute inset-0 fut-card-inner opacity-30 z-0 pointer-events-none" />

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col h-full p-5">
          
          {/* Top Section: Rating, Pos, Country, Image */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col items-center w-1/4 pt-2">
              <span className="text-5xl font-bold font-oswald leading-none">{data.overall}</span>
              <span className="text-lg font-bold font-oswald uppercase tracking-tight text-center leading-tight mb-2">{data.position.split(' ')[0].substring(0, 4)}</span>
              
              <div className="w-8 h-5 bg-slate-800/10 border border-slate-800/20 rounded flex items-center justify-center text-[10px] font-bold uppercase overflow-hidden" title={data.nationality}>
                 {data.nationality.substring(0,3)}
              </div>
            </div>

            <div className="relative w-3/4 h-40 flex items-center justify-center group cursor-pointer" onClick={triggerImageUpload}>
               {image ? (
                 <img src={image} alt="Candidate" className="h-full object-contain drop-shadow-xl" />
               ) : (
                 <User className="w-24 h-24 text-[#362d18] opacity-50" />
               )}
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all rounded-lg">
                 <Upload className="w-6 h-6 opacity-0 group-hover:opacity-50" />
               </div>
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Name */}
          <div className="text-center mb-2 border-b-2 border-[#b98e28]/30 pb-1 mx-2">
            <h2 className="text-2xl font-bold font-oswald uppercase tracking-wide truncate text-[#362d18] drop-shadow-sm">
              {data.name}
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-2 mb-4 font-oswald text-lg text-[#362d18]">
            <div className="space-y-1">
              {leftStats.map((attr, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-bold mr-2">{attr.value}</span>
                  <span className="uppercase text-sm opacity-80 tracking-wide">{attr.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {rightStats.map((attr, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-bold mr-2">{attr.value}</span>
                  <span className="uppercase text-sm opacity-80 tracking-wide">{attr.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart Mini View (Decoration) */}
          <div className="absolute bottom-20 right-4 w-16 h-16 opacity-40 pointer-events-none mix-blend-multiply">
             <RadarGraph attributes={data.attributes} minimal />
          </div>

          {/* Chemistry/Summary */}
          <div className="mt-auto pt-2 border-t border-[#b98e28]/20">
             <p className="text-xs font-roboto font-medium text-center leading-tight opacity-90 line-clamp-3 italic">
               "{data.summary}"
             </p>
             <div className="mt-2 flex justify-center items-center gap-2">
                <div className="h-4 w-4 bg-green-600 rounded-full shadow-inner border border-green-800" title="Chemistry: Perfect" />
                <span className="text-xs font-bold uppercase tracking-wider">Talent Scout Basic</span>
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};