
import React, { useState, useMemo } from 'react';
import { Zone, AnalysisReport, UserRole, User } from '../types';
import { generateZoneAnalysis } from '../services/geminiService';
import { formatAnalysisTitle } from '../utils';
import { BrainCircuit, Loader2, AlertCircle, FileText, CheckCircle2, Lock, ChevronDown, ChevronUp, Download, Play, Filter, User as UserIcon } from 'lucide-react';

interface AnalysisViewProps {
  zone: Zone;
  analyses: AnalysisReport[];
  onNewAnalysis: (analysis: AnalysisReport) => void;
  userRole: UserRole;
  currentUser: User | null;
  onNavigateToIntervention: (analysisId: string) => void;
  onRequestLogin: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  zone, 
  analyses, 
  onNewAnalysis, 
  userRole, 
  currentUser,
  onNavigateToIntervention,
  onRequestLogin
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters State
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const canRunAnalysis = userRole === 'SCIENTIST';
  const canViewDetails = userRole === 'CITIZEN' || userRole === 'SCIENTIST';

  const handleRunAnalysis = async () => {
    if (!canRunAnalysis) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateZoneAnalysis(zone);
      const newReport: AnalysisReport = {
        id: `an-${Date.now()}`,
        zoneId: zone.id,
        timestamp: new Date().toISOString(),
        generatedBy: currentUser?.name || 'Unknown Scientist',
        ...result
      };
      onNewAnalysis(newReport);
      setExpandedId(newReport.id); // Auto expand new report
    } catch (err) {
      setError("Failed to generate analysis. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (!canViewDetails) {
      onRequestLogin();
      return;
    }
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter Logic
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(report => {
      // Basic Zone Filter - In a real app with "All Zones" option, we might loosen this
      // But currently the view is scoped to a selected Zone from the sidebar. 
      // If we want to show ALL reports for the CITY, we'd need access to other zones here.
      // Assuming 'zone' prop is the context.
      // Let's filter by the current zone strictly for now as per "Zone Profile" context.
      if (report.zoneId !== zone.id) return false;

      const date = new Date(report.timestamp);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (filterYear !== 'all' && year !== filterYear) return false;
      if (filterMonth !== 'all' && month !== filterMonth) return false;

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [analyses, zone.id, filterYear, filterMonth]);

  const uniqueYears = Array.from(new Set(analyses.map(a => new Date(a.timestamp).getFullYear().toString())));
  const uniqueMonths = Array.from(new Set(analyses.map(a => new Date(a.timestamp).toLocaleString('default', { month: 'long' }))));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Causal Analysis Reports</h2>
            <p className="text-slate-500">Archive of AI-diagnosed pollution events for {zone.name}</p>
        </div>
        {canRunAnalysis ? (
            <button
                onClick={handleRunAnalysis}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                {loading ? 'Analyzing...' : 'Run New AI Analysis'}
            </button>
        ) : (
            <div className="px-4 py-2 bg-slate-100 text-slate-500 rounded-lg flex items-center gap-2 text-sm font-medium border border-slate-200">
                <Lock size={16} />
                Scientific Generation Locked
            </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mr-2">
            <Filter size={16} />
            Filters:
        </div>
        
        <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
        >
            <option value="all">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
        >
            <option value="all">All Months</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <div className="flex-1 text-right text-xs text-slate-400">
            Showing {filteredAnalyses.length} report(s)
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map((report) => (
                <div 
                    key={report.id} 
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === report.id ? 'border-indigo-200 shadow-md ring-1 ring-indigo-100' : 'border-slate-200 shadow-sm hover:border-indigo-300'}`}
                >
                    {/* Card Header (Always Visible) */}
                    <div 
                        className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                        onClick={() => toggleExpand(report.id)}
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${expandedId === report.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800 text-lg font-mono tracking-tight">
                                        {formatAnalysisTitle(report)}
                                    </h3>
                                    {userRole === 'SCIENTIST' && report.generatedBy && (
                                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-500 font-medium border border-slate-200 w-fit">
                                            <UserIcon size={10} />
                                            <span>{report.generatedBy}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                        {new Date(report.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <p className={`text-sm text-slate-600 line-clamp-1 ${!canViewDetails && 'blur-[2px] select-none opacity-50'}`}>
                                        {canViewDetails ? report.summary : 'Login to view the executive summary of this analysis report.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            {!canViewDetails && (
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                    <Lock size={12} /> Login to View
                                </span>
                            )}
                            {expandedId === report.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === report.id && canViewDetails && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
                            
                            {/* Actions Toolbar */}
                            <div className="flex flex-wrap gap-3 justify-end border-b border-slate-200 pb-6">
                                {userRole === 'CITIZEN' && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                                        <Download size={16} /> Download PDF
                                    </button>
                                )}
                                {userRole === 'SCIENTIST' && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigateToIntervention(report.id);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        <Play size={16} fill="currentColor" /> Run Intervention
                                    </button>
                                )}
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                                <p className="text-slate-800 leading-relaxed font-medium">
                                    {report.summary}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Root Causes</h4>
                                <div className="grid gap-3">
                                    {report.causes.map((cause, idx) => (
                                        <div key={idx} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-slate-700">{cause.factor}</span>
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${cause.confidence > 75 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {cause.confidence}% Confidence
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {cause.reasoning}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-xl p-5 border border-green-100 flex gap-3">
                                <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="text-green-900 font-bold text-sm mb-1">Recommended Strategy</h4>
                                    <p className="text-green-800 text-sm">
                                        {report.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No reports found</h3>
                <p className="text-slate-400">Try adjusting your filters or generate a new analysis.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
