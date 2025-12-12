import React, { useState } from 'react';
import { Incident, User } from '../types';
import { AlertCircle, CheckCircle2, Clock, Plus, Search, Mail, Phone, LifeBuoy, X, AlertTriangle } from 'lucide-react';

interface ItSupportViewProps {
  currentUser: User | null;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-2024-001',
    title: 'Gemini API Latency in Analysis Module',
    description: 'Generating causal analysis takes >15 seconds during peak hours.',
    priority: 'Medium',
    status: 'In Progress',
    reportedBy: 'Dr. A. Sharma',
    timestamp: '2023-10-25'
  },
  {
    id: 'INC-2024-002',
    title: 'Export PDF alignment issue',
    description: 'The zone header overlaps with the chart legend in the exported PDF report.',
    priority: 'Low',
    status: 'Resolved',
    reportedBy: 'J. Doe',
    timestamp: '2023-10-20'
  }
];

const ItSupportView: React.FC<ItSupportViewProps> = ({ currentUser }) => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Incident['priority']
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incident: Incident = {
      id: `INC-2024-${String(incidents.length + 1).padStart(3, '0')}`,
      title: newIncident.title,
      description: newIncident.description,
      priority: newIncident.priority,
      status: 'Open',
      reportedBy: currentUser?.name || 'Unknown',
      timestamp: new Date().toISOString().split('T')[0]
    };

    setIncidents([incident, ...incidents]);
    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setIsFormOpen(false);
        setNewIncident({ title: '', description: '', priority: 'Medium' });
    }, 2000);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'Resolved': return <CheckCircle2 size={16} className="text-green-600" />;
      case 'In Progress': return <Clock size={16} className="text-blue-600" />;
      default: return <AlertCircle size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">IT Incident Management</h2>
            <p className="text-slate-500">Log functional issues or bugs for the IT Operations team.</p>
        </div>
        <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-slate-200"
        >
            <Plus size={18} />
            Log New Incident
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-2 space-y-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                <Search size={18} className="text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search incidents by ID or keywords..." 
                    className="flex-1 outline-none text-sm text-slate-700"
                />
             </div>

             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Incident ID</th>
                            <th className="px-6 py-4">Title / Description</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Reported</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {incidents.map((inc) => (
                            <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-600">{inc.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{inc.title}</div>
                                    <div className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">{inc.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(inc.priority)}`}>
                                        {inc.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(inc.status)}
                                        <span className="font-medium text-slate-700">{inc.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{inc.timestamp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {incidents.length === 0 && (
                    <div className="p-10 text-center text-slate-400">No incidents reported recently.</div>
                )}
             </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <LifeBuoy size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">IT Operations</h3>
                        <p className="text-xs text-blue-700 font-medium">Escalation Matrix</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-blue-800 bg-white/50 p-3 rounded-lg">
                        <Mail size={16} />
                        <span>support@aqilab.internal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-blue-800 bg-white/50 p-3 rounded-lg">
                        <Phone size={16} />
                        <span>+91 20-2555-0199 (Ext 404)</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-2 leading-relaxed">
                        For <span className="font-bold">Critical (P1)</span> outages impacting live monitoring, please call the emergency hotline immediately.
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-slate-800 mb-3 text-sm">System Status</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">API Gateway</span>
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Operational</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Data Pipeline</span>
                        <span className="text-green-600 font-bold text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Operational</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Gemini AI Model</span>
                        <span className="text-yellow-600 font-bold text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Degraded</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* New Incident Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">Log New Incident</h3>
                    <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                {submitted ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Incident Logged</h4>
                        <p className="text-slate-500">Ticket created successfully. IT Team has been notified.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex gap-2 items-start">
                             <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                             <span>Please do not share sensitive patient or resident PII in this form.</span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Incident Title</label>
                            <input 
                                type="text" 
                                required
                                value={newIncident.title}
                                onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="e.g. Map not loading in Safari"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                required
                                value={newIncident.description}
                                onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm min-h-[100px]"
                                placeholder="Describe the steps to reproduce the issue..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                            <select 
                                value={newIncident.priority}
                                onChange={(e) => setNewIncident({...newIncident, priority: e.target.value as Incident['priority']})}
                                className="w-full p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="Low">Low - Cosmetic issue</option>
                                <option value="Medium">Medium - Feature unavailable</option>
                                <option value="High">High - Workflow blocked</option>
                                <option value="Critical">Critical - System Down</option>
                            </select>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="flex-1 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
                            >
                                Submit Incident
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ItSupportView;