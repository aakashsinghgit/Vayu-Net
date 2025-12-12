

import React, { useState, useEffect, useMemo } from 'react';
import { Zone, AnalysisReport, InterventionProject, ProjectStatus, UserRole, ProjectPhase, PhaseStatus } from '../types';
import { generateInterventionPlan } from '../services/geminiService';
import { formatAnalysisTitle, getRelativeTime } from '../utils';
import { Plus, Loader2, Layout, Calendar, ChevronRight, ChevronDown, ChevronUp, CheckCircle2, Clock, ArrowRight, Lock, Filter, FileText, Download, Play, Archive, AlertCircle, Sparkles, Send, User as UserIcon, ShieldCheck, Target } from 'lucide-react';

interface SolutionsViewProps {
  zone: Zone;
  analyses: AnalysisReport[];
  projects: InterventionProject[];
  onNewProject: (project: InterventionProject) => void;
  userRole: UserRole;
  initialAnalysisId?: string | null;
}

const SolutionsView: React.FC<SolutionsViewProps> = ({ zone, analyses, projects, onNewProject, userRole, initialAnalysisId }) => {
  // View State
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  
  // Creation Wizard State
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<Partial<InterventionProject> | null>(null);

  // Archive Filter State
  const [archiveFilterYear, setArchiveFilterYear] = useState<string>('All');

  // Derived Data
  const canCreateProject = userRole === 'SCIENTIST';

  // Effect to handle navigation from Analysis View
  useEffect(() => {
    if (initialAnalysisId && canCreateProject) {
        setIsCreating(true);
        setSelectedAnalysisId(initialAnalysisId);
    }
  }, [initialAnalysisId, canCreateProject]);

  // AI Generation Handler
  const handleGeneratePlan = async () => {
    if (!selectedAnalysisId) return;
    setLoading(true);
    const analysis = analyses.find(a => a.id === selectedAnalysisId)!;
    let analysisZone = zone;
    
    try {
      const plan = await generateInterventionPlan(analysisZone, analysis);
      setGeneratedPlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Submit Draft Handler
  const handleSubmitProposal = () => {
    if (!generatedPlan || !selectedAnalysisId) return;
    
    const newProject: InterventionProject = {
        id: `prj-${Date.now()}`,
        zoneId: analyses.find(a => a.id === selectedAnalysisId)?.zoneId || zone.id,
        status: ProjectStatus.PENDING_APPROVAL,
        basedOnAnalysisId: selectedAnalysisId,
        startDate: new Date().toISOString().split('T')[0],
        title: generatedPlan.title || 'Untitled Project',
        notes: generatedPlan.notes || '',
        phases: generatedPlan.phases?.map((p, idx) => ({ ...p, id: `ph-${Date.now()}-${idx}`, status: 'PENDING' as PhaseStatus })) || []
    };
    
    onNewProject(newProject);
    setIsCreating(false);
    setGeneratedPlan(null);
    setSelectedAnalysisId('');
  };

  // --- FILTERING LOGIC ---

  // 1. Projects strictly scoped to the current Zone
  const zoneProjects = useMemo(() => {
    return projects.filter(p => p.zoneId === zone.id);
  }, [projects, zone.id]);

  const pendingProjects = zoneProjects.filter(p => p.status === ProjectStatus.PENDING_APPROVAL);
  const activeProjects = zoneProjects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  
  // 2. Archive Logic with Year Filter
  const completedProjects = useMemo(() => {
    return zoneProjects.filter(p => {
        if (p.status !== ProjectStatus.COMPLETED) return false;
        if (archiveFilterYear !== 'All') {
            const year = new Date(p.startDate).getFullYear().toString();
            if (year !== archiveFilterYear) return false;
        }
        return true;
    });
  }, [zoneProjects, archiveFilterYear]);

  // Available years for the archive dropdown
  const availableArchiveYears = Array.from(new Set(
      zoneProjects
        .filter(p => p.status === ProjectStatus.COMPLETED)
        .map(p => new Date(p.startDate).getFullYear().toString())
  )).sort();

  // 3. Analysis Logic for Creation Wizard (Scoped to Zone + Recent 30 Days)
  const recentAnalyses = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return analyses.filter(a => {
        if (a.zoneId !== zone.id) return false; // Strict Zone Check
        if (initialAnalysisId && a.id === initialAnalysisId) return true;
        return new Date(a.timestamp) > cutoff;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [analyses, initialAnalysisId, zone.id]);


  // --- ACTIONS ---

  const handleApproveProject = (project: InterventionProject) => {
    // UX Update: Direct approval without confirmation dialog for smoother demo flow
    onNewProject({ ...project, status: ProjectStatus.IN_PROGRESS }); 
    // Auto-expand the project in the Active list so user sees where it went
    setExpandedProjectId(project.id);
  };

  const updatePhaseStatus = (project: InterventionProject, phaseId: string, newStatus: PhaseStatus, assignee?: string) => {
    const updatedPhases = project.phases.map(p => {
        if (p.id === phaseId) {
            return { 
                ...p, 
                status: newStatus,
                assignedTo: assignee || p.assignedTo 
            };
        }
        return p;
    });

    const updatedProject = { ...project, phases: updatedPhases };
    onNewProject(updatedProject);
  };

  const handleReviewAndClose = (project: InterventionProject) => {
    if (confirm(`All phases are complete. Are you sure you want to Archive "${project.title}" as Completed?`)) {
        onNewProject({ ...project, status: ProjectStatus.COMPLETED });
        setExpandedProjectId(null);
    }
  };

  const assignUserToPhase = (project: InterventionProject, phaseId: string) => {
      // In a real app, this would use the current logged in user context
      const simulatedUser = "Dr. A. Sharma"; 
      updatePhaseStatus(project, phaseId, 'IN_PROGRESS', simulatedUser);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
       
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <div className="flex items-center gap-2">
                <Target className="text-emerald-700 dark:text-emerald-400" size={24} />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Operations War Room</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Agile tactical command for pollution control initiatives in {zone.name}.</p>
        </div>
        {!isCreating && canCreateProject && (
             <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50"
            >
                <Plus size={20} />
                Create New Proposal
            </button>
        )}
      </div>

      {/* SECTION 1: CREATION WIZARD */}
      {isCreating && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 shadow-xl ring-4 ring-emerald-50/50 dark:ring-emerald-900/20 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="bg-emerald-50/50 dark:bg-emerald-900/20 p-6 border-b border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                    <Sparkles size={20} />
                    <h3>AI Intervention Generator</h3>
                </div>
                <button 
                    onClick={() => setIsCreating(false)} 
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium"
                >
                    Cancel
                </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Step 1: Select Analysis */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">1. Select Source Analysis</label>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Last 30 Days</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentAnalyses.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400">
                                <FileText size={24} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent analysis reports found for {zone.name}.</p>
                                <p className="text-xs">Run a new analysis in the Analysis tab first.</p>
                            </div>
                        ) : (
                            recentAnalyses.map(analysis => (
                                <div 
                                    key={analysis.id}
                                    onClick={() => setSelectedAnalysisId(analysis.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                        selectedAnalysisId === analysis.id 
                                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-600 dark:ring-emerald-500' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`font-bold font-mono text-sm tracking-tight ${selectedAnalysisId === analysis.id ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {formatAnalysisTitle(analysis)}
                                        </h4>
                                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-2">
                                            {getRelativeTime(analysis.timestamp)}
                                        </span>
                                    </div>
                                    <p className={`text-xs mt-1 line-clamp-2 ${selectedAnalysisId === analysis.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {analysis.summary}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Step 2: Review & Submit */}
                <div className="space-y-4 flex flex-col h-full">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">2. Proposal Preview</label>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 p-6 relative min-h-[300px]">
                        {!generatedPlan ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mb-2 text-emerald-600" size={32} />
                                        <p className="text-emerald-600 font-medium">Consulting Gemini AI...</p>
                                        <p className="text-xs mt-1">Analyzing root causes & generating phases</p>
                                    </>
                                ) : (
                                    <>
                                        <Layout size={32} className="mb-2 opacity-50" />
                                        <p>Select a source analysis on the left</p>
                                        <p className="text-xs">to generate an intervention plan</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 h-full overflow-y-auto max-h-[350px] pr-2">
                                <div className="border-l-4 border-emerald-500 pl-4 py-1">
                                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{generatedPlan.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Based on: {recentAnalyses.find(a => a.id === selectedAnalysisId)?.summary.substring(0, 40)}...</p>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700 italic">
                                    "{generatedPlan.notes}"
                                </p>
                                <div className="space-y-3 pt-2">
                                    {generatedPlan.phases?.map((ph, i) => (
                                        <div key={i} className="text-sm bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                                <span className="font-bold text-slate-800 dark:text-slate-100">{ph.name}</span>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-400 pl-7 text-xs mb-2">{ph.description}</p>
                                            <div className="pl-7 flex flex-wrap gap-2">
                                                {ph.actions?.map((act, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] rounded border border-slate-200 dark:border-slate-600">
                                                        • {act}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                         {!generatedPlan ? (
                             <button 
                                onClick={handleGeneratePlan}
                                disabled={!selectedAnalysisId || loading}
                                className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                             >
                                <Sparkles size={18} />
                                Generate AI Plan
                             </button>
                         ) : (
                             <button 
                                onClick={handleSubmitProposal}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40"
                             >
                                <Send size={18} />
                                Submit to Board for Approval
                             </button>
                         )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* SECTION 2: ACTIVE OPERATIONS (No filters, scoped to current zone) */}
      <div className="space-y-6">
         
         {/* Lane 1: Pending Approvals */}
         <div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Clock className="text-yellow-600" size={20} />
                Pending Board Approval <span className="text-slate-400 text-sm font-normal">({pendingProjects.length})</span>
            </h3>
            
            {pendingProjects.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-400 text-sm">
                    No proposals waiting for review in {zone.name}.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingProjects.map(project => (
                        <div key={project.id} className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-900/30 p-6 flex flex-col h-full relative group hover:shadow-md transition-shadow">
                            <div className="absolute top-4 right-4 text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Awaiting Approval">
                                <AlertCircle size={20} />
                            </div>
                            <div className="mb-4 flex-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white dark:bg-slate-800 dark:border-slate-700 px-2 py-1 rounded border border-slate-200 mb-2 inline-block">
                                    Draft
                                </span>
                                <h4 className="font-bold text-slate-800 dark:text-yellow-100 text-lg mb-2">{project.title}</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{project.notes}</p>
                            </div>
                            <div className="pt-4 border-t border-yellow-200/50 dark:border-yellow-900/30">
                                <button 
                                    onClick={() => handleApproveProject(project)}
                                    className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Approve & Start
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>

         {/* Lane 2: Active Execution (Accordion / Detail View) */}
         <div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Play className="text-emerald-600" size={20} />
                In Execution <span className="text-slate-400 text-sm font-normal">({activeProjects.length})</span>
            </h3>
            
            <div className="space-y-4">
                {activeProjects.map(project => {
                    const completedPhases = project.phases.filter(p => p.status === 'COMPLETED').length;
                    const totalPhases = project.phases.length;
                    const progress = Math.round((completedPhases / totalPhases) * 100);
                    const isExpanded = expandedProjectId === project.id;
                    const allPhasesComplete = completedPhases === totalPhases;

                    return (
                        <div key={project.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-200 dark:ring-emerald-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
                            
                            {/* Card Header / Summary Story */}
                            <div 
                                onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{project.id}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{project.title}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} /> Started: {new Date(project.startDate).toLocaleDateString()}
                                        </span>
                                        {/* Simple Progress Bar for Summary */}
                                        <div className="flex items-center gap-2 min-w-[120px]">
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600">{progress}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                                </div>
                            </div>

                            {/* Expanded Detail View (Roadmap Dashboard) */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 animate-in slide-in-from-top-2">
                                    <div className="max-w-4xl">
                                        <div className="mb-6 flex justify-between items-end">
                                            <div>
                                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Execution Roadmap</h5>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm">Complete phases sequentially to unlock project closure.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative">
                                            {/* Vertical Line */}
                                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 z-0"></div>

                                            {project.phases.map((phase, idx) => {
                                                const isCompleted = phase.status === 'COMPLETED';
                                                const isInProgress = phase.status === 'IN_PROGRESS';
                                                const isPending = phase.status === 'PENDING';
                                                
                                                // Lock logic: Previous phase must be complete
                                                const previousPhase = idx > 0 ? project.phases[idx - 1] : null;
                                                const isLocked = previousPhase ? previousPhase.status !== 'COMPLETED' : false;

                                                return (
                                                    <div key={phase.id} className={`relative z-10 flex gap-4 ${isLocked ? 'opacity-50' : ''}`}>
                                                        {/* Status Icon */}
                                                        <div className={`w-12 h-12 rounded-full border-4 shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 transition-colors ${
                                                            isCompleted ? 'border-green-500 text-green-600' :
                                                            isInProgress ? 'border-emerald-500 text-emerald-600' :
                                                            'border-slate-200 dark:border-slate-700 text-slate-400'
                                                        }`}>
                                                            {isCompleted ? <CheckCircle2 size={20} /> : 
                                                             isInProgress ? <Loader2 size={20} className="animate-spin" /> :
                                                             isLocked ? <Lock size={18} /> : <span className="font-bold">{idx + 1}</span>}
                                                        </div>

                                                        {/* Phase Card */}
                                                        <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{phase.name}</h4>
                                                                        {isInProgress && <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded uppercase">In Progress</span>}
                                                                        {isCompleted && <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded uppercase">Done</span>}
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-400">{phase.description}</p>
                                                                </div>
                                                                
                                                                {/* Assignee Section */}
                                                                <div className="min-w-[180px]">
                                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Scientific Lead</label>
                                                                    {phase.assignedTo ? (
                                                                        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs">
                                                                                {phase.assignedTo.charAt(0)}
                                                                            </div>
                                                                            {phase.assignedTo}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-sm text-slate-400 italic p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                                                                            Unassigned
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions List */}
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {phase.actions.map((action, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded border border-slate-100 dark:border-slate-700">
                                                                        • {action}
                                                                    </span>
                                                                ))}
                                                            </div>

                                                            {/* Phase Controls */}
                                                            {!isCompleted && !isLocked && (
                                                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                                                    {isPending ? (
                                                                        <button 
                                                                            onClick={() => assignUserToPhase(project, phase.id)}
                                                                            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                                                                        >
                                                                            Assign Lead & Start Phase <ArrowRight size={16} />
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => updatePhaseStatus(project, phase.id, 'COMPLETED')}
                                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                                        >
                                                                            <CheckCircle2 size={16} /> Mark Phase Complete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Project Closure Action */}
                                        <div className="mt-8 flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                                            {allPhasesComplete ? (
                                                <button 
                                                    onClick={() => handleReviewAndClose(project)}
                                                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 flex items-center gap-2"
                                                >
                                                    <ShieldCheck size={20} />
                                                    Review & Close Project
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg cursor-not-allowed">
                                                    <Lock size={16} />
                                                    Complete all phases to close project
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {activeProjects.length === 0 && (
                    <div className="p-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                        <p className="text-slate-500 dark:text-slate-400">No active projects running in {zone.name}. Approve a proposal to begin execution.</p>
                    </div>
                )}
            </div>
         </div>
      </div>

      {/* SECTION 3: ARCHIVE */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Archive className="text-slate-400" size={20} />
                Completed Projects Archive <span className="text-slate-400 text-sm font-normal">({completedProjects.length})</span>
            </h3>

            {/* Local Year Filter for Archive */}
            <div className="flex items-center gap-2">
                 <label className="text-xs font-bold text-slate-400 uppercase">Filter Year:</label>
                 <select 
                    value={archiveFilterYear}
                    onChange={(e) => setArchiveFilterYear(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="All">All Years</option>
                    {availableArchiveYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Project Title</th>
                        <th className="px-6 py-4 font-semibold">Start Date</th>
                        <th className="px-6 py-4 font-semibold">Phases Executed</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {completedProjects.map(project => (
                        <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{project.title}</td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{project.startDate}</td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                    {project.phases.length} / {project.phases.length}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors" title="Download Report">
                                        <Download size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors" title="Generate Summary Blog">
                                        <FileText size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {completedProjects.length === 0 && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                No completed projects found for this zone/filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default SolutionsView;