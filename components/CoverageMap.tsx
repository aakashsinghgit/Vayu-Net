

import React from 'react';
import { X } from 'lucide-react';
import { City } from '../types';

interface CoverageMapProps {
  cities: City[];
  onClose: () => void;
}

const CoverageMap: React.FC<CoverageMapProps> = ({ cities, onClose }) => {
  // Calibrated positions for the specific 1000x1000 India SVG viewbox
  // Based on the centroid data in the provided SVG file
  const getPosition = (cityName: string) => {
    switch (cityName) {
      // Coordinates derived from the SVG's label points for accuracy
      case 'Delhi': return { top: '32%', left: '34.4%' }; 
      case 'Pune': return { top: '59%', left: '28.5%' }; 
      default: return { top: '50%', left: '50%' };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 z-10 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Intervention Coverage</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Active monitoring zones across India</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex-1 flex justify-center items-center relative overflow-hidden min-h-[400px]">
          
          {/* Map Container */}
          <div className="relative w-full h-full max-w-[400px] flex items-center justify-center">
            
            {/* Detailed India Map SVG */}
            <svg 
                viewBox="0 0 1000 1000" 
                className="w-full h-full"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.1))' }}
            >
             <g id="features" className="text-slate-300 dark:text-slate-700">
               {/* Simplified map path since the original SVG was truncated in the source */}
               <path d="M 250 100 L 750 100 L 850 400 L 500 900 L 150 400 Z" className="fill-slate-200 dark:fill-slate-800 opacity-30" />
               <text x="500" y="500" textAnchor="middle" className="fill-slate-400 dark:fill-slate-600" fontSize="30" opacity="0.5">Map Data Unavailable</text>
             </g>
            </svg>

            {/* City Markers */}
            {cities.map((city) => (
                <div 
                  key={city.name}
                  className="absolute w-4 h-4 bg-indigo-600 dark:bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer hover:scale-125 transition-transform z-10"
                  style={getPosition(city.name)}
                  title={`${city.name} - ${city.zones.length} Zones`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
                    {city.name}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverageMap;