import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Attribute } from '../types';

interface RadarGraphProps {
  attributes: Attribute[];
  minimal?: boolean;
}

export const RadarGraph: React.FC<RadarGraphProps> = ({ attributes, minimal = false }) => {
  // Transform data for recharts
  const data = attributes.map(attr => ({
    subject: attr.label,
    A: attr.value,
    fullMark: 100,
  }));

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={minimal ? "70%" : "80%"} data={data}>
          <PolarGrid stroke={minimal ? "#362d18" : "#64748b"} strokeOpacity={minimal ? 0.1 : 0.3} />
          
          {!minimal && (
            <>
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold', fontFamily: 'Oswald' }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            </>
          )}

          <Radar
            name="Skills"
            dataKey="A"
            stroke="#eec35e"
            strokeWidth={minimal ? 2 : 3}
            fill="#eec35e"
            fillOpacity={minimal ? 0.3 : 0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};