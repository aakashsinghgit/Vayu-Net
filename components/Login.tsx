
import React from 'react';
import { User } from '../types';
import { FlaskConical, Users, ArrowRight, X } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  
  const handleScientistLogin = () => {
    onLogin({
        username: 'sci_lead',
        name: 'Dr. A. Sharma',
        role: 'SCIENTIST',
        title: 'Scientific Lead'
    });
  };

  const handleCitizenLogin = () => {
    onLogin({
        username: 'pune_citizen',
        name: 'Rahul V.',
        role: 'CITIZEN',
        title: 'Resident'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-500 z-10 transition-colors">
          <X size={24} />
        </button>
        
        {/* Scientific Login Option */}
        <div 
           className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group"
           onClick={handleScientistLogin}
        >
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <FlaskConical size={40} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase mb-4">
                Demo Access
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Scientific Division</h2>
            <p className="text-slate-500 mb-8 max-w-xs">
                Log in as a Scientist to access intervention planning, AI analysis tools, and sensor management.
            </p>
            <button className="flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-3 transition-all">
              Login as Scientist <ArrowRight size={18} />
            </button>
        </div>

        {/* Citizen Login Option */}
        <div 
           className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center hover:bg-slate-50 transition-colors cursor-pointer group"
           onClick={handleCitizenLogin}
        >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Users size={40} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase mb-4">
                Demo Access
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Citizen Portal</h2>
            <p className="text-slate-500 mb-8 max-w-xs">
                Log in as a Resident to view detailed reports, download data catalogues, and submit feedback.
            </p>
            <button className="flex items-center gap-2 text-green-600 font-bold group-hover:gap-3 transition-all">
              Login as Resident <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;