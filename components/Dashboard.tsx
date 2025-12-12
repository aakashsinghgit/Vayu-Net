import React from 'react';
import { Zone, UserRole } from '../types';
import { HEALTH_ADVISORIES } from '../recommendations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wind, Activity, Droplets, AlertTriangle, Share2, HeartPulse, ShieldCheck, ShieldAlert, AlertOctagon } from 'lucide-react';

interface DashboardProps {
  zone: Zone;
  userRole: UserRole;
}

const getAqiColor = (aqi: number) => {
  if (aqi <= 50) return 'text-green-500';
  if (aqi <= 100) return 'text-yellow-500';
  if (aqi <= 200) return 'text-orange-500';
  if (aqi <= 300) return 'text-red-500';
  return 'text-purple-600';
};

const getAqiBg = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-100 border-green-200';
  if (aqi <= 100) return 'bg-yellow-100 border-yellow-200';
  if (aqi <= 200) return 'bg-orange-100 border-orange-200';
  if (aqi <= 300) return 'bg-red-100 border-red-200';
  return 'bg-purple-100 border-purple-200';
};

const getRecommendationIcon = (color: string) => {
  switch (color) {
    case 'green': return <ShieldCheck size={28} className="text-green-600" />;
    case 'yellow': return <Activity size={28} className="text-yellow-600" />;
    case 'orange': return <HeartPulse size={28} className="text-orange-500" />;
    case 'red': return <ShieldAlert size={28} className="text-red-600" />;
    default: return <AlertOctagon size={28} className="text-purple-600" />;
  }
};

const Dashboard: React.FC<DashboardProps> = ({ zone, userRole }) => {
  const handleShare = () => {
    alert(`Shared AQI Report for ${zone.name} to social media!`);
  };

  const currentRecommendation = HEALTH_ADVISORIES.find(
    rec => zone.currentAqi >= rec.minAqi && zone.currentAqi <= rec.maxAqi
  ) || HEALTH_ADVISORIES[HEALTH_ADVISORIES.length - 1];

  const recColorClass = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-900',
  }[currentRecommendation.color] || 'bg-slate-50 border-slate-200';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center md:hidden">
         <h2 className="text-lg font-bold text-slate-800">Live Monitor</h2>
         {userRole === 'CITIZEN' && (
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium"
            >
              <Share2 size={16} /> Share
            </button>
         )}
      </div>

      {/* Health Recommendation Card - Hidden for Scientists */}
      {userRole !== 'SCIENTIST' && (
        <div className={`p-6 rounded-2xl border ${recColorClass} shadow-sm relative overflow-hidden`}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="p-3 bg-white/60 rounded-full backdrop-blur-sm shrink-0">
              {getRecommendationIcon(currentRecommendation.color)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {currentRecommendation.title}
                <span className="text-xs font-normal opacity-80 px-2 py-0.5 bg-white/50 rounded-full border border-black/5">
                  AQI {zone.currentAqi}
                </span>
              </h3>
              <p className="mt-1 font-medium opacity-90">{currentRecommendation.advice}</p>
              <div className="mt-3 flex items-start gap-2 text-sm font-bold bg-white/40 p-3 rounded-lg border border-black/5">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>Action: {currentRecommendation.action}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main AQI Card */}
        <div className={`p-6 rounded-2xl border ${getAqiBg(zone.currentAqi)} col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wind size={120} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold opacity-70">Current AQI</h3>
              <div className={`text-6xl font-bold mt-2 ${getAqiColor(zone.currentAqi)}`}>
                {zone.currentAqi}
              </div>
              <p className="mt-2 font-medium opacity-80">
                {zone.currentAqi > 200 ? 'Very Unhealthy' : zone.currentAqi > 100 ? 'Moderate' : 'Good'}
              </p>
            </div>
            {userRole === 'CITIZEN' && (
              <button 
                onClick={handleShare}
                className="p-2 bg-white/50 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Share Update"
              >
                <Share2 size={20} className="text-slate-700" />
              </button>
            )}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm opacity-75">
            <Activity size={16} />
            <span>Updated 10 mins ago</span>
          </div>
        </div>

        {/* Pollutant Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">PM 2.5</p>
              <h4 className="text-3xl font-bold text-slate-800 mt-1">{zone.metrics.pm25}</h4>
              <p className="text-xs text-slate-400 mt-1">µg/m³</p>
            </div>
            <div className={`p-2 rounded-full ${zone.metrics.pm25 > 60 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
             <div className="bg-slate-800 h-full rounded-full" style={{ width: `${Math.min(zone.metrics.pm25, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">PM 10</p>
              <h4 className="text-3xl font-bold text-slate-800 mt-1">{zone.metrics.pm10}</h4>
              <p className="text-xs text-slate-400 mt-1">µg/m³</p>
            </div>
            <div className={`p-2 rounded-full ${zone.metrics.pm10 > 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <Droplets size={20} />
            </div>
          </div>
           <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
             <div className="bg-slate-800 h-full rounded-full" style={{ width: `${Math.min(zone.metrics.pm10 / 2, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">7-Day AQI Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={zone.history}>
              <defs>
                <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
              />
              <Area type="monotone" dataKey="aqi" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAqi)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Zone Profile</h3>
            <p className="text-slate-600 leading-relaxed">{zone.description}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Sensors</h3>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Station A (Central)
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Station B (North)
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;