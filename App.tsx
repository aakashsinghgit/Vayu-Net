

import React, { useState, useEffect } from 'react';
import { MOCK_CITIES, MOCK_ANALYSES, MOCK_PROJECTS } from './constants';
import { City, Zone, AppView, AnalysisReport, InterventionProject, User, UserRole } from './types';
import Dashboard from './components/Dashboard';
import AnalysisView from './components/AnalysisView';
import SolutionsView from './components/SolutionsView';
import ReportsView from './components/ReportsView';
import FeedbackView from './components/FeedbackView';
import ItSupportView from './components/ItSupportView';
import HomeView from './components/HomeView';
import Login from './components/Login';
import CoverageMap from './components/CoverageMap';
import { LayoutDashboard, Microscope, ClipboardList, FileBarChart, Map, Menu, X, LogIn, LogOut, MessageSquare, ShieldCheck, User as UserIcon, LifeBuoy, Home, Sparkles, Wind, ChevronDown, Moon, Sun } from 'lucide-react';

const App: React.FC = () => {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Access Control State
  const [hasAccess, setHasAccess] = useState(false);

  // App Data State
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City>(MOCK_CITIES[0]);
  const [selectedZone, setSelectedZone] = useState<Zone>(MOCK_CITIES[0].zones[0]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Navigation state for cross-view linking
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null);

  // App State (Simulated Database)
  const [analyses, setAnalyses] = useState<AnalysisReport[]>(MOCK_ANALYSES);
  const [projects, setProjects] = useState<InterventionProject[]>(MOCK_PROJECTS);

  // --- THEME LOGIC ---
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- API KEY PROXY LOGIC ---
  useEffect(() => {
    const checkAccess = async () => {
      // 1. Check if using AI Studio Proxy
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) {
          setHasAccess(true);
          return;
        }
      }
      
      // 2. Fallback: Check standard .env for local dev
      if (process.env.API_KEY) {
        setHasAccess(true);
      }
    };
    checkAccess();
  }, []);

  const handleRequestAccess = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setHasAccess(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    } else {
      setHasAccess(true);
    }
  };

  // --- APP LOGIC ---

  const userRole: UserRole = user ? user.role : 'GUEST';

  const isReportsView = currentView === AppView.REPORTS;
  const isFeedbackView = currentView === AppView.FEEDBACK;
  const isItSupportView = currentView === AppView.IT_SUPPORT;
  const isHomeView = currentView === AppView.HOME;
  const hideLocationContext = isReportsView || isFeedbackView || isItSupportView || isHomeView;

  const handleCityChange = (cityName: string) => {
    const city = MOCK_CITIES.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(city);
      setSelectedZone(city.zones[0]);
    }
  };

  const handleZoneChange = (zoneId: string) => {
    const zone = selectedCity.zones.find(z => z.id === zoneId);
    if (zone) {
        setSelectedZone(zone);
    }
  };

  const handleNewAnalysis = (analysis: AnalysisReport) => {
    setAnalyses(prev => [analysis, ...prev]);
  };

  const handleNewProject = (project: InterventionProject) => {
    setProjects(prev => {
        const existingIndex = prev.findIndex(p => p.id === project.id);
        if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = project;
            return updated;
        }
        return [project, ...prev];
    });
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setShowLogin(false);
    if (loggedInUser.role === 'SCIENTIST' && currentView === AppView.FEEDBACK) {
        setCurrentView(AppView.DASHBOARD);
    }
    if (loggedInUser.role === 'GUEST') {
        if (currentView === AppView.SOLUTIONS || currentView === AppView.IT_SUPPORT) {
             setCurrentView(AppView.DASHBOARD);
        }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.HOME);
  };

  const handleNavigateToIntervention = (analysisId: string) => {
    setPendingAnalysisId(analysisId);
    setCurrentView(AppView.SOLUTIONS);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <HomeView onChangeView={setCurrentView} userRole={userRole} />;
      case AppView.DASHBOARD:
        return <Dashboard zone={selectedZone} userRole={userRole} />;
      case AppView.ANALYSIS:
        return (
          <AnalysisView 
            zone={selectedZone} 
            analyses={analyses} 
            onNewAnalysis={handleNewAnalysis} 
            userRole={userRole}
            currentUser={user}
            onNavigateToIntervention={handleNavigateToIntervention}
            onRequestLogin={() => setShowLogin(true)}
          />
        );
      case AppView.SOLUTIONS:
        if (userRole !== 'SCIENTIST') return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Authorized Personnel Only. Please sign in as a scientist to access intervention projects.</div>;
        return (
          <SolutionsView 
            zone={selectedZone} 
            analyses={analyses} 
            projects={projects} 
            onNewProject={handleNewProject} 
            userRole={userRole} 
            initialAnalysisId={pendingAnalysisId}
          />
        );
      case AppView.REPORTS:
        return <ReportsView zone={selectedZone} userRole={userRole} analyses={analyses} projects={projects} />;
      case AppView.FEEDBACK:
        if (userRole === 'SCIENTIST') return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Please use "Report Issue" to contact IT Support.</div>;
        return <FeedbackView zone={selectedZone} userRole={userRole} onRequestLogin={() => setShowLogin(true)} />;
      case AppView.IT_SUPPORT:
        if (userRole !== 'SCIENTIST') return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Restricted Access.</div>;
        return <ItSupportView currentUser={user} />;
      default:
        return <div className="p-10 text-center text-slate-400">Page not found</div>;
    }
  };

  const menuItems = [
    { view: AppView.HOME, label: 'Home', icon: Home, visible: true },
    { view: AppView.DASHBOARD, label: 'Live Monitor', icon: LayoutDashboard, visible: true },
    { view: AppView.ANALYSIS, label: 'Causal Analysis', icon: Microscope, visible: true },
    { view: AppView.SOLUTIONS, label: 'Interventions', icon: ClipboardList, visible: userRole === 'SCIENTIST' },
    { view: AppView.REPORTS, label: 'Reports & Data', icon: FileBarChart, visible: true },
    { view: AppView.FEEDBACK, label: 'Feedback', icon: MessageSquare, visible: userRole !== 'SCIENTIST' },
    { view: AppView.IT_SUPPORT, label: 'Report Issue', icon: LifeBuoy, visible: userRole === 'SCIENTIST' },
  ];

  const getPageTitle = () => {
    if (isHomeView) return 'Welcome to AQI Lab';
    if (isReportsView) return 'Data Repository';
    if (isFeedbackView) return 'Community Feedback Portal';
    if (isItSupportView) return 'IT Incident Management';
    if (currentView === AppView.DASHBOARD) return 'Live Monitor';
    if (currentView === AppView.ANALYSIS) return 'Causal Analysis';
    if (currentView === AppView.SOLUTIONS) return 'Intervention Board';

    return `${selectedZone.city} / ${selectedZone.name}`;
  };

  const getViewTheme = () => {
    switch (currentView) {
        case AppView.DASHBOARD: return 'bg-sky-50/40 dark:bg-sky-900/5';
        case AppView.ANALYSIS: return 'bg-violet-50/30 dark:bg-violet-900/5';
        case AppView.SOLUTIONS: return 'bg-emerald-50/30 dark:bg-emerald-900/5';
        default: return 'bg-slate-50 dark:bg-slate-950';
    }
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
         <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
         <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-green-900/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
         
         <div className="relative z-10 max-w-3xl animate-in fade-in zoom-in-95 duration-700">
             <div className="flex justify-center mb-8">
                 <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                    <Wind size={48} className="text-indigo-400" />
                 </div>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
               Vayu-Net
             </h1>
             
             <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                Existing tools just monitor air pollution. <br className="hidden md:block" />
                <span className="text-indigo-400 font-semibold">Vayu-Net</span> uses Gemini to analyze root causes and generate phased, actionable intervention projects for city teams.
             </p>
             
             <button 
                onClick={handleRequestAccess}
                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3 mx-auto overflow-hidden"
             >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <Sparkles size={24} className="group-hover:text-yellow-300 transition-colors" />
                Initialize AI System
             </button>
             
             <p className="mt-8 text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                Powered by Google Gemini 2.5 Flash
             </p>
         </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-700 ${getViewTheme()}`}>
      {showLogin && <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {showMap && <CoverageMap cities={MOCK_CITIES} onClose={() => setShowMap(false)} />}
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col overflow-hidden fixed md:relative z-20 h-full`}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg ${userRole === 'SCIENTIST' ? 'bg-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/50' : userRole === 'CITIZEN' ? 'bg-green-600 shadow-green-200 dark:shadow-green-900/50' : 'bg-slate-800 dark:bg-slate-700 shadow-slate-200 dark:shadow-slate-900/50'}`}>
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800 dark:text-slate-100">AQI Lab</span>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* User Status Card */}
          <div className={`rounded-xl p-4 border ${user ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50'}`}>
            {user ? (
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'SCIENTIST' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                    {user.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.title}</p>
                 </div>
              </div>
            ) : (
              <div onClick={() => setShowLogin(true)} className="cursor-pointer">
                 <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold mb-1">
                    <LogIn size={16} />
                    <span>Sign In Required</span>
                 </div>
                 <p className="text-xs text-blue-600 dark:text-blue-400">Access advanced features for Citizens or Scientists.</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div>
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block px-2">Modules</label>
            <nav className="space-y-1">
              {menuItems.filter(item => item.visible).map(item => (
                <button 
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === item.view ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-lg shadow-slate-200 dark:shadow-slate-900/50' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Location Selector - Moved below navigation, MOBILE ONLY */}
          {!hideLocationContext && (
            <div className="md:hidden animate-in fade-in slide-in-from-top-2 duration-300 border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</label>
                    <button 
                        onClick={() => setShowMap(true)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Coverage Map"
                    >
                        <Map size={12} /> Map View
                    </button>
                </div>
                
                <div className="space-y-3">
                <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase mb-1 block">City</label>
                    <select 
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    value={selectedCity.name}
                    onChange={(e) => handleCityChange(e.target.value)}
                    >
                    {MOCK_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase mb-1 block">Zone</label>
                    <select
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    value={selectedZone.id}
                    onChange={(e) => handleZoneChange(e.target.value)}
                    >
                        {selectedCity.zones.map(z => (
                            <option key={z.id} value={z.id}>{z.name}</option>
                        ))}
                    </select>
                </div>
                </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
           {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
           ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30"
              >
                Sign In
              </button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between md:hidden sticky top-0 z-30">
             <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${userRole === 'SCIENTIST' ? 'bg-indigo-600' : userRole === 'CITIZEN' ? 'bg-green-600' : 'bg-slate-800 dark:bg-slate-700'}`}>AL</div>
                <span className="font-bold text-slate-800 dark:text-slate-100">AQI Lab</span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-400">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
             </div>
        </header>

        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {getPageTitle()}
                </h1>
                {userRole === 'GUEST' && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-xs font-bold uppercase">Public View</span>}
                {userRole === 'SCIENTIST' && <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-bold uppercase flex items-center gap-1"><ShieldCheck size={12}/> Scientific Access</span>}
                {userRole === 'CITIZEN' && <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-bold uppercase flex items-center gap-1"><UserIcon size={12}/> Resident</span>}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: Just now</p>
            </div>

            {/* NEW LOCATION SELECTOR (Desktop) */}
            {!hideLocationContext && (
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Map size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                      <div className="relative group">
                          <select
                              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 text-sm outline-none cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-400 appearance-none pr-4"
                              value={selectedCity.name}
                              onChange={(e) => handleCityChange(e.target.value)}
                          >
                              {MOCK_CITIES.map(c => <option key={c.name} value={c.name} className="dark:bg-slate-900">{c.name}</option>)}
                          </select>
                      </div>
                      <span className="text-slate-300 dark:text-slate-600 font-light text-lg">/</span>
                      <div className="relative group">
                          <select
                              className="bg-transparent font-bold text-slate-700 dark:text-slate-200 text-sm outline-none cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-400 appearance-none pr-6"
                              value={selectedZone.id}
                              onChange={(e) => handleZoneChange(e.target.value)}
                          >
                              {selectedCity.zones.map(z => <option key={z.id} value={z.id} className="dark:bg-slate-900">{z.name}</option>)}
                          </select>
                          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                  </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             {/* THEME TOGGLE (Desktop) */}
             <button 
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                title="Toggle Theme"
             >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             {!hideLocationContext && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    LIVE DATA
                </div>
             )}
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </div>
      </main>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;