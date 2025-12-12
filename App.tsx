
import React, { useState } from 'react';
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
import { LayoutDashboard, Microscope, ClipboardList, FileBarChart, Map, Menu, X, LogIn, LogOut, MessageSquare, ShieldCheck, User as UserIcon, LifeBuoy, Home } from 'lucide-react';

const App: React.FC = () => {
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

  const userRole: UserRole = user ? user.role : 'GUEST';

  // Logic to determine if the view relies on specific location context in the UI
  // Reports, IT Support, Home, and Feedback are global views (or handle context internally)
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

  // Upsert logic: Update if ID exists, otherwise prepend
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
    // Reset view based on role permissions
    if (loggedInUser.role === 'SCIENTIST' && currentView === AppView.FEEDBACK) {
        setCurrentView(AppView.DASHBOARD);
    }
    
    // If Guest was on Solutions (not possible due to check) or IT Support (not possible)
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
        // Strictly restricted to Scientists
        if (userRole !== 'SCIENTIST') return <div className="p-10 text-center text-slate-500">Authorized Personnel Only. Please sign in as a scientist to access intervention projects.</div>;
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
        // Scientists shouldn't see this, but if they somehow get here, redirect or show message
        if (userRole === 'SCIENTIST') return <div className="p-10 text-center text-slate-500">Please use "Report Issue" to contact IT Support.</div>;
        return <FeedbackView zone={selectedZone} userRole={userRole} onRequestLogin={() => setShowLogin(true)} />;
      case AppView.IT_SUPPORT:
        if (userRole !== 'SCIENTIST') return <div className="p-10 text-center text-slate-500">Restricted Access.</div>;
        return <ItSupportView currentUser={user} />;
      default:
        return <div className="p-10 text-center text-slate-400">Page not found</div>;
    }
  };

  // Menu items config based on role
  const menuItems = [
    { view: AppView.HOME, label: 'Home', icon: Home, visible: true },
    { view: AppView.DASHBOARD, label: 'Live Monitor', icon: LayoutDashboard, visible: true },
    { view: AppView.ANALYSIS, label: 'Causal Analysis', icon: Microscope, visible: true },
    { view: AppView.SOLUTIONS, label: 'Interventions', icon: ClipboardList, visible: userRole === 'SCIENTIST' }, // Strictly Scientist
    { view: AppView.REPORTS, label: 'Reports & Data', icon: FileBarChart, visible: true },
    // Feedback: Visible to GUEST and CITIZEN. Hidden for SCIENTIST.
    { view: AppView.FEEDBACK, label: 'Feedback', icon: MessageSquare, visible: userRole !== 'SCIENTIST' },
    // IT Support: Visible ONLY to SCIENTIST.
    { view: AppView.IT_SUPPORT, label: 'Report Issue', icon: LifeBuoy, visible: userRole === 'SCIENTIST' },
  ];

  const getPageTitle = () => {
    if (isHomeView) return 'Welcome to AQI Lab';
    if (isReportsView) return 'Data Repository';
    if (isFeedbackView) return 'Community Feedback Portal';
    if (isItSupportView) return 'IT Incident Management';
    return `${selectedZone.city} / ${selectedZone.name}`;
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {showLogin && <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />}
      {showMap && <CoverageMap cities={MOCK_CITIES} onClose={() => setShowMap(false)} />}
      
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col overflow-hidden fixed md:relative z-20 h-full`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg ${userRole === 'SCIENTIST' ? 'bg-indigo-600 shadow-indigo-200' : userRole === 'CITIZEN' ? 'bg-green-600 shadow-green-200' : 'bg-slate-800 shadow-slate-200'}`}>
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">AQI Lab</span>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* User Status Card */}
          <div className={`rounded-xl p-4 border ${user ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
            {user ? (
              <div className="flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'SCIENTIST' ? 'bg-indigo-600' : 'bg-green-600'}`}>
                    {user.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.title}</p>
                 </div>
              </div>
            ) : (
              <div onClick={() => setShowLogin(true)} className="cursor-pointer">
                 <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
                    <LogIn size={16} />
                    <span>Sign In Required</span>
                 </div>
                 <p className="text-xs text-blue-600">Access advanced features for Citizens or Scientists.</p>
              </div>
            )}
          </div>

          {/* Location Selector - Hidden in Global Views */}
          {!hideLocationContext && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-2 px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <button 
                        onClick={() => setShowMap(true)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="View Coverage Map"
                    >
                        <Map size={12} /> Map View
                    </button>
                </div>
                
                <div className="space-y-3">
                <div>
                    <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">City</label>
                    <select 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    value={selectedCity.name}
                    onChange={(e) => handleCityChange(e.target.value)}
                    >
                    {MOCK_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                
                <div>
                    <label className="text-[10px] text-slate-500 font-semibold uppercase mb-1 block">Zone</label>
                    <select
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
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

          {/* Navigation */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block px-2">Modules</label>
            <nav className="space-y-1">
              {menuItems.filter(item => item.visible).map(item => (
                <button 
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentView === item.view ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
           {user ? (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
           ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-100"
              >
                Sign In
              </button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden">
             <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${userRole === 'SCIENTIST' ? 'bg-indigo-600' : userRole === 'CITIZEN' ? 'bg-green-600' : 'bg-slate-800'}`}>AL</div>
                <span className="font-bold text-slate-800">AQI Lab</span>
             </div>
             <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
        </header>

        {/* Top Bar (Desktop) */}
        <div className="hidden md:flex items-center justify-between px-8 py-5 border-b border-slate-200 bg-white/50 backdrop-blur-sm z-10">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                  {getPageTitle()}
              </h1>
              {userRole === 'GUEST' && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-bold uppercase">Public View</span>}
              {userRole === 'SCIENTIST' && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase flex items-center gap-1"><ShieldCheck size={12}/> Scientific Access</span>}
              {userRole === 'CITIZEN' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase flex items-center gap-1"><UserIcon size={12}/> Resident</span>}
            </div>
            <p className="text-sm text-slate-500">Last updated: Just now</p>
          </div>
          <div className="flex items-center gap-4">
             {!hideLocationContext && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
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
            className="fixed inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default App;