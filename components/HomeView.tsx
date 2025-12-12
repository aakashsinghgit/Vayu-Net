

import React from 'react';
import { AppView, UserRole } from '../types';
import { ArrowRight, Leaf, TrendingDown, Users, Award, Newspaper, LayoutDashboard, Microscope, FileBarChart, MessageSquare, ExternalLink } from 'lucide-react';

interface HomeViewProps {
  onChangeView: (view: AppView) => void;
  userRole: UserRole;
}

const HomeView: React.FC<HomeViewProps> = ({ onChangeView, userRole }) => {

  const MOCK_NEWS = [
    {
      id: 1,
      title: "Pune's Kothrud Sees 15% Dip in PM2.5 Levels",
      source: "AQI Lab Blog",
      date: "Oct 24, 2023",
      category: "Success Story",
      imageColor: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      excerpt: "Following the implementation of the Green Buffer Zone project, sensor data confirms a consistent drop in particulate matter during peak hours."
    },
    {
      id: 2,
      title: "Challenges in Delhi: Crop Burning Season Begins",
      source: "The Daily Monitor",
      date: "Oct 22, 2023",
      category: "External Report",
      imageColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      excerpt: "Despite early warnings from our Causal Analysis AI, satellite data shows an uptick in farm fires. How can we intervene faster?"
    },
    {
      id: 3,
      title: "Integrating Gemini AI: A Technical Deep Dive",
      source: "Tech Team Engineering Blog",
      date: "Oct 15, 2023",
      category: "Technology",
      imageColor: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
      excerpt: "How we reduced analysis generation time by 40% using the latest multimodal models to process satellite imagery and sensor logs simultaneously."
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-10">
      
      {/* 1. HERO SECTION: Positive Impact Summary */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-black text-white p-8 md:p-12 shadow-2xl border border-slate-800">
        {/* Abstract Background Pattern */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/50 to-transparent"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Leaf size={12} />
            Cleaner Air Initiative
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Transforming Data into <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">Breathable Action</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-xl leading-relaxed">
            The AQI Intervention Lab combines real-time sensor networks with advanced AI to diagnose pollution sources and deploy targeted solutions.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">3</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Major Cities</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-green-400 mb-1">12</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Active Projects</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-indigo-400 mb-1">24/7</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">AI Monitoring</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">15k+</div>
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Citizens Protected</div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. ARTICLES SECTION: News & Blog */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Latest from the Lab</h2>
                <p className="text-slate-500 dark:text-slate-400">Updates on interventions, challenges, and technology.</p>
            </div>
            <button className="hidden md:flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                View Archive <ArrowRight size={16} />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_NEWS.map((news) => (
                <div key={news.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                    <div className={`h-40 w-full ${news.imageColor} flex items-center justify-center relative overflow-hidden`}>
                         <div className="absolute inset-0 bg-black/5 dark:bg-white/5 group-hover:bg-transparent transition-colors"></div>
                         <Newspaper size={48} className="opacity-50" />
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{news.category}</span>
                            <span className="text-xs text-slate-400">{news.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                            {news.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
                            {news.excerpt}
                        </p>
                        <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            By {news.source} <ExternalLink size={10} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 3. RECOGNITION SECTION: Spotlight */}
      <section className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider text-xs">
                <Award size={16} /> Impact Spotlight
            </div>
            <h2 className="text-3xl font-bold">Empowering Local Heroes</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
                We recognize <span className="text-white font-bold">The Baner Citizens Watch Group</span> for their tireless efforts in manually validating our sensor data last quarter. Their ground-truth feedback helped calibrate our AI models to 98% accuracy.
            </p>
            <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-800 flex items-center justify-center text-slate-600 text-xs font-bold">A</div>
                    <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-slate-800 flex items-center justify-center text-slate-600 text-xs font-bold">B</div>
                    <div className="w-10 h-10 rounded-full bg-slate-400 border-2 border-slate-800 flex items-center justify-center text-slate-600 text-xs font-bold">+5</div>
                </div>
                <span className="text-sm font-medium text-slate-400">Community Partners</span>
            </div>
        </div>
        <div className="w-full md:w-1/3 aspect-square bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-sm relative">
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl z-0"></div>
             <Users size={64} className="text-white/80 relative z-10" />
             <div className="absolute bottom-4 left-4 z-10">
                <p className="font-bold">Baner Watch Group</p>
                <p className="text-xs text-slate-300">Pune, MH</p>
             </div>
        </div>
      </section>

      {/* 4. NAVIGATION GUIDE: CTA */}
      <section>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">How to use AQI Lab</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div 
                onClick={() => onChangeView(AppView.DASHBOARD)}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group text-center"
            >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={24} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Check Live Monitor</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">View real-time pollution levels for your specific zone.</p>
            </div>

            <div 
                onClick={() => onChangeView(AppView.ANALYSIS)}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group text-center"
            >
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Microscope size={24} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Causal Analysis</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Understand <i>why</i> pollution is happening with AI.</p>
            </div>

            <div 
                onClick={() => onChangeView(AppView.REPORTS)}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group text-center"
            >
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileBarChart size={24} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Data Repository</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Access historical logs and project completion reports.</p>
            </div>

            <div 
                onClick={() => onChangeView(AppView.FEEDBACK)}
                className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group text-center"
            >
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Give Feedback</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {userRole === 'SCIENTIST' ? 'Report functional issues to IT.' : 'Suggest improvements to the lab.'}
                </p>
            </div>

        </div>
      </section>

    </div>
  );
};

export default HomeView;