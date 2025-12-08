import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, FileText, X, Copy } from 'lucide-react';

interface AIReportProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  reportContent: string;
}

export const AIReport: React.FC<AIReportProps> = ({ isOpen, onClose, isLoading, reportContent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg text-slate-800">AI Daily Report</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 font-medium">Gemini is analyzing site data...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
               <ReactMarkdown>{reportContent}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3 rounded-b-xl">
          <button
            onClick={() => {
              navigator.clipboard.writeText(reportContent);
              alert('Report copied to clipboard!');
            }}
            disabled={isLoading || !reportContent}
            className="flex items-center px-4 py-2 text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};