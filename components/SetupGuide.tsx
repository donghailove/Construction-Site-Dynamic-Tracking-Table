import React from 'react';
import { X, ExternalLink, Database } from 'lucide-react';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const envVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">Enable Cloud Sync (Firebase)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600 text-sm">
          <p>
            Currently, your data is saved in <strong>Local Storage</strong>. To enable real-time synchronization across devices, you need to connect a free Google Firebase database.
          </p>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center">
                Step 1: Create Firebase Project
                <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:underline inline-flex items-center">
                  Open Console <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </h4>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>Create a new project (e.g., "SiteTrack").</li>
                <li>Go to <strong>Build</strong> &rarr; <strong>Firestore Database</strong> &rarr; <strong>Create Database</strong>.</li>
                <li>Select <strong>Start in test mode</strong> (for easy setup).</li>
              </ol>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
               <h4 className="font-semibold text-slate-800 mb-2">Step 2: Register App</h4>
               <ol className="list-decimal list-inside space-y-1 ml-1">
                <li>In Project Overview, click the <strong>Web (&lt;/&gt;)</strong> icon.</li>
                <li>Register app (e.g., "SiteWeb").</li>
                <li>Copy the <code>firebaseConfig</code> values from the SDK setup block.</li>
              </ol>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
               <h4 className="font-semibold text-slate-800 mb-2">Step 3: Configure Environment</h4>
               <p className="mb-2">Add these environment variables to your <strong>.env</strong> file (local) or <strong>Vercel Project Settings</strong>:</p>
               
               <div className="bg-slate-800 text-slate-200 p-3 rounded-md font-mono text-xs overflow-x-auto">
                 {envVars.map(key => (
                   <div key={key} className="flex justify-between items-center py-1 border-b border-slate-700/50 last:border-0">
                     <span>{key}=...</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
         <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};