import React, { useState, useMemo, useEffect } from 'react';
import { Zone, UserRole, AnalysisReport, InterventionProject, ProjectStatus } from '../types';
import { MOCK_CITIES } from '../constants';
import { FileText, Download, Lock, Filter, FileBarChart, FileSpreadsheet, FileDigit, BrainCircuit, HardHat, CheckCircle2 } from 'lucide-react';

interface ReportsViewProps {
  zone: Zone; // Initial context
  userRole: UserRole;
  analyses: AnalysisReport[];
  projects: InterventionProject[];
}

type ReportCategory = 'All' | 'Causal Analysis' | 'Intervention Report' | 'Data Log';

interface ReportItem {
  id: string;
  title: string;
  type: ReportCategory;
  date: string;
  size: string;
  city: string;
  zoneId: string;
  zoneName: string;
  format: 'PDF' | 'CSV' | 'JSON';
}

// Generate some static mock logs to flesh out the "Data Logs" category
const MOCK_DATA_LOGS = [
  { id: 'log-1', title: 'Raw Sensor Data - Oct 2023', zoneId: 'pn-01', date: '2023-10-31', size: '15.2 MB' },
  { id: 'log-2', title: 'Raw Sensor Data - Sept 2023', zoneId: 'pn-01', date: '2023-09-30', size: '14.8 MB' },
  { id: 'log-3', title: 'Pollutant Conc. Logs - Q3 2023', zoneId: 'pn-02', date: '2023-09-30', size: '22.4 MB' },
  { id: 'log-4', title: 'Hourly PM2.5/PM10 Dump', zoneId: 'dl-01', date: '2023-10-25', size: '45.1 MB' },
  { id: 'log-5', title: 'Meteorological Correlation Data', zoneId: 'pn-03', date: '2023-10-15', size: '8.5 MB' },
];

const ReportsView: React.FC<ReportsViewProps> = ({ zone, userRole, analyses, projects }) => {
  const isGuest = userRole === 'GUEST';

  // Filters State
  // Default to the current zone context passed from App
  const [selectedCity, setSelectedCity] = useState<string>(zone.city);
  const [selectedZone, setSelectedZone] = useState<string>(zone.id);
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>('All');

  // Update filters if the global context changes (e.g. sidebar selection)
  useEffect(() => {
    setSelectedCity(zone.city);
    setSelectedZone(zone.id);
  }, [zone]);

  // Handle City Change (Reset Zone)
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const cityObj = MOCK_CITIES.find(c => c.name === cityName);
    if (cityObj && cityObj.zones.length > 0) {
      setSelectedZone(cityObj.zones[0].id);
    } else {
      setSelectedZone('All');
    }
  };

  // Aggregation Logic
  const allReports: ReportItem[] = useMemo(() => {
    const items: ReportItem[] = [];

    // 1. Map Analyses
    analyses.forEach(a => {
      // Find location details
      let cityName = 'Unknown';
      let zoneName = 'Unknown';
      
      // Inefficient lookup but fine for mock data scale
      for (const c of MOCK_CITIES) {
        const z = c.zones.find(z => z.id === a.zoneId);
        if (z) {
          cityName = c.name;
          zoneName = z.name;
          break;
        }
      }

      items.push({
        id: a.id,
        title: `AI Analysis: ${a.summary.substring(0, 40)}...`,
        type: 'Causal Analysis',
        date: a.timestamp,
        size: '1.2 MB',
        city: cityName,
        zoneId: a.zoneId,
        zoneName: zoneName,
        format: 'PDF'
      });
    });

    // 2. Map Projects (ONLY COMPLETED Projects are Reports)
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);
    
    completedProjects.forEach(p => {
       let cityName = 'Unknown';
       let zoneName = 'Unknown';
       for (const c of MOCK_CITIES) {
         const z = c.zones.find(z => z.id === p.zoneId);
         if (z) {
           cityName = c.name;
           zoneName = z.name;
           break;
         }
       }

       items.push({
         id: p.id,
         title: `Completion Report: ${p.title}`,
         type: 'Intervention Report',
         date: p.startDate, // Ideally end date, but using start date for mock
         size: '2.5 MB',
         city: cityName,
         zoneId: p.zoneId,
         zoneName: zoneName,
         format: 'PDF'
       });
    });

    // 3. Map Mock Data Logs
    MOCK_DATA_LOGS.forEach(log => {
       let cityName = 'Unknown';
       let zoneName = 'Unknown';
       for (const c of MOCK_CITIES) {
         const z = c.zones.find(z => z.id === log.zoneId);
         if (z) {
           cityName = c.name;
           zoneName = z.name;
           break;
         }
       }

       items.push({
         id: log.id,
         title: log.title,
         type: 'Data Log',
         date: log.date, // simple date string in mock
         size: log.size,
         city: cityName,
         zoneId: log.zoneId,
         zoneName: zoneName,
         format: 'CSV'
       });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [analyses, projects]);

  // Filtering Logic
  const filteredReports = useMemo(() => {
    return allReports.filter(item => {
      const itemDate = new Date(item.date);
      const year = itemDate.getFullYear().toString();
      const month = itemDate.toLocaleString('default', { month: 'long' });

      // City Filter (Strict)
      if (selectedCity !== 'All' && item.city !== selectedCity) return false;
      
      // Zone Filter (Strict if not All)
      if (selectedZone !== 'All' && item.zoneId !== selectedZone) return false;

      // Time Filters
      if (selectedYear !== 'All' && year !== selectedYear) return false;
      if (selectedMonth !== 'All' && month !== selectedMonth) return false;

      // Category Filter
      if (selectedCategory !== 'All' && item.type !== selectedCategory) return false;

      return true;
    });
  }, [allReports, selectedCity, selectedZone, selectedYear, selectedMonth, selectedCategory]);

  // Derived Options for Dropdowns
  const availableYears = Array.from(new Set(allReports.map(r => new Date(r.date).getFullYear().toString()))).sort();
  const availableMonths = Array.from(new Set(allReports.map(r => new Date(r.date).toLocaleString('default', { month: 'long' })))).sort();
  const availableZones = selectedCity === 'All' 
    ? [] 
    : MOCK_CITIES.find(c => c.name === selectedCity)?.zones || [];

  const getIconForType = (type: ReportCategory) => {
    switch (type) {
        case 'Causal Analysis': return <BrainCircuit size={20} />;
        case 'Intervention Report': return <CheckCircle2 size={20} />;
        case 'Data Log': return <FileSpreadsheet size={20} />;
        default: return <FileText size={20} />;
    }
  };

  const getColorForType = (type: ReportCategory) => {
    switch (type) {
        case 'Causal Analysis': return 'bg-purple-100 text-purple-600';
        case 'Intervention Report': return 'bg-green-100 text-green-600';
        case 'Data Log': return 'bg-blue-100 text-blue-600';
        default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleDownload = (title: string) => {
    if (isGuest) return;
    alert(`Downloading: ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Reports & Data Archive</h2>
            <p className="text-slate-500">Centralized repository for completed analyses, intervention reports, and raw data.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-700 font-medium text-sm">
             <Filter size={16} /> Filter Repository
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
             
             {/* City Filter */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">City</label>
                <select 
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {MOCK_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
             </div>

             {/* Zone Filter */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Zone</label>
                <select 
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={selectedCity === 'All'}
                >
                    <option value="All">All Zones</option>
                    {availableZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                </select>
             </div>

             {/* Category Filter */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Category</label>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ReportCategory)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="All">All Types</option>
                    <option value="Causal Analysis">Causal Analysis</option>
                    <option value="Intervention Report">Intervention Reports (Completed)</option>
                    <option value="Data Log">Data Logs</option>
                </select>
             </div>

             {/* Year Filter */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Year</label>
                <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="All">All Years</option>
                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
             </div>

             {/* Month Filter */}
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Month</label>
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="All">All Months</option>
                    {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
             </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {filteredReports.length > 0 ? (
            <div className="grid gap-1">
            {filteredReports.map((report, idx) => (
                <div 
                key={`${report.type}-${report.id}`} 
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between transition-colors ${idx !== filteredReports.length - 1 ? 'border-b border-slate-100' : ''} hover:bg-slate-50 group`}
                >
                <div className="flex items-start gap-4 mb-4 md:mb-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getColorForType(report.type)}`}>
                        {getIconForType(report.type)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{report.type}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-medium text-slate-500">{report.zoneName}, {report.city}</span>
                        </div>
                        <h3 className="font-semibold text-slate-800 text-lg md:text-base line-clamp-1">{report.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {new Date(report.date).toLocaleDateString()} • {report.size} • {report.format}
                        </p>
                    </div>
                </div>
                
                {isGuest ? (
                    <button disabled className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed w-full md:w-auto">
                    <Lock size={16} />
                    Sign in to Download
                    </button>
                ) : (
                    <button 
                        onClick={() => handleDownload(report.title)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 rounded-lg text-sm font-medium transition-colors shadow-sm w-full md:w-auto"
                    >
                    <Download size={16} />
                    Download
                    </button>
                )}
                </div>
            ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Filter size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-600">No reports found</h3>
                <p className="text-slate-400 max-w-xs text-center">Try adjusting your filters for City, Zone, or Date.</p>
            </div>
        )}
      </div>
      
      {isGuest && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
          <h4 className="text-indigo-900 font-semibold mb-2">Restricted Access</h4>
          <p className="text-indigo-700 text-sm">
            Sign in as a Citizen or Scientific team member to download full reports and access historical data archives.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsView;