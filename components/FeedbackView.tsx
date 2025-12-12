import React, { useState } from 'react';
import { Feedback, Zone, UserRole } from '../types';
import { Send, MessageSquare, ThumbsUp, AlertTriangle, Lock } from 'lucide-react';

interface FeedbackViewProps {
  zone: Zone;
  userRole: UserRole;
  onRequestLogin: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ zone, userRole, onRequestLogin }) => {
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole === 'GUEST') {
        onRequestLogin();
        return;
    }

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setMessage('');
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 animate-in fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <ThumbsUp size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Thank you for your feedback!</h3>
        <p className="text-slate-500 mb-8">Your input helps us improve air quality monitoring in {zone.name}.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="text-indigo-600 font-medium hover:text-indigo-700"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Community Feedback</h2>
        <p className="text-slate-500">Report issues or suggest improvements for {zone.name}</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Guest Overlay Hint (Optional - keeping it clean, logic is in submit) */}
        {userRole === 'GUEST' && (
             <div className="absolute top-0 right-0 p-4">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                    <Lock size={10} />
                    <span>Public Preview Mode</span>
                 </div>
             </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Feedback Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['General', 'Report Issue', 'Suggestion'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                    type === t 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Your Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-40 p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder={`Tell us about air quality issues in ${zone.name}...`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            {userRole === 'GUEST' ? (
                <>
                    <Lock size={18} />
                    Sign in to Submit
                </>
            ) : (
                <>
                    <Send size={18} />
                    Submit Feedback
                </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-semibold text-yellow-800 text-sm">Emergency Notice</h4>
          <p className="text-yellow-700 text-sm mt-1">
            For urgent health emergencies related to air quality, please contact local emergency services immediately. This form is for non-urgent feedback only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;