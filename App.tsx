import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  Sparkles, 
  Edit3, 
  Trash2,
  CalendarDays,
  MoreHorizontal,
  Lock,
  Unlock
} from 'lucide-react';

import { SegmentData, ConstructionStatus, SegmentPart } from './types';
import { STATUS_CONFIG, MOCK_INITIAL_DATA, PART_OPTIONS } from './constants';
import { DashboardStats } from './components/DashboardStats';
import { EditModal } from './components/EditModal';
import { AIReport } from './components/AIReport';
import { generateSiteReport } from './services/geminiService';

const App: React.FC = () => {
  const [segments, setSegments] = useState<SegmentData[]>(() => {
    // Changed key to force refresh for new data set
    const saved = localStorage.getItem('site_segments_v3');
    if (saved) {
       return JSON.parse(saved);
    }
    return MOCK_INITIAL_DATA;
  });
  
  const [filter, setFilter] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentData | null>(null);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState('');

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem('site_segments_v3', JSON.stringify(segments));
  }, [segments]);

  // Group segments by name
  const groupedSegments = useMemo(() => {
    const groups: Record<string, Partial<Record<SegmentPart, SegmentData>>> = {};
    segments.forEach(seg => {
      if (!groups[seg.name]) groups[seg.name] = {};
      groups[seg.name][seg.part] = seg;
    });
    return groups;
  }, [segments]);

  // Filter and Sort keys
  const filteredGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedSegments);
    // Sort naturally (numeric) - handling "Segment 33", "Segment 34" etc.
    keys.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
    
    if (!filter) return keys;
    
    return keys.filter(name => {
      return name.toLowerCase().includes(filter.toLowerCase());
    });
  }, [groupedSegments, filter]);

  const handleDeleteGroup = (name: string) => {
    if (confirm(`Are you sure you want to delete all records for "${name}"?`)) {
      setSegments(segments.filter(s => s.name !== name));
    }
  };

  const handleCellClick = (name: string, part: SegmentPart, data?: SegmentData) => {
    // Only allow edit if admin
    if (!isAdmin) return;

    if (data) {
      setEditingSegment(data);
    } else {
      // Create template for new part in existing segment
      setEditingSegment({
        id: '', // Empty ID marks it as new
        name: name,
        part: part,
        status: ConstructionStatus.NOT_STARTED,
        progress: 0,
        remarks: '',
        lastUpdated: new Date().toISOString()
      } as SegmentData);
    }
    setIsEditModalOpen(true);
  };

  const handleAddNewSegment = () => {
    setEditingSegment(null); // Completely new
    setIsEditModalOpen(true);
  };

  const handleSave = (data: Partial<SegmentData>) => {
    if (editingSegment && editingSegment.id) {
      // Update existing record
      setSegments(segments.map(s => s.id === editingSegment.id ? { 
        ...s, 
        ...data, 
        lastUpdated: new Date().toISOString() 
      } as SegmentData : s));
    } else {
      // Create new record
      const newSegment: SegmentData = {
        id: Date.now().toString(),
        name: data.name || editingSegment?.name || 'New Segment',
        part: data.part || editingSegment?.part || SegmentPart.BOTTOM_SLAB,
        status: data.status || ConstructionStatus.NOT_STARTED,
        progress: data.progress || 0,
        remarks: data.remarks || '',
        lastUpdated: new Date().toISOString()
      };
      
      // Check if this part already exists for this segment to avoid duplicates
      const exists = segments.some(s => s.name === newSegment.name && s.part === newSegment.part);
      if (exists) {
        alert('Record for this part already exists. Please edit the existing one.');
        return;
      }
      
      setSegments([...segments, newSegment]);
    }
  };

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    if (!reportContent) {
      setIsGeneratingReport(true);
      const report = await generateSiteReport(segments);
      setReportContent(report);
      setIsGeneratingReport(false);
    }
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const password = prompt("Enter Admin Password to Edit:");
      // Simple hardcoded password check
      if (password === "admin888") {
        setIsAdmin(true);
      } else if (password !== null) {
        alert("Incorrect password");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 border-b border-slate-200 px-4 py-3 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SiteTrack Pro</h1>
          </div>
          <div className="flex items-center space-x-3">
             <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-500 border border-slate-200">
               <CalendarDays className="w-4 h-4 mr-2" />
               {new Date().toLocaleDateString()}
             </div>
             
             {/* Admin Toggle */}
             <button
               onClick={handleAdminToggle}
               className={`p-2 rounded-lg transition-colors ${isAdmin ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
               title={isAdmin ? "Lock Editing" : "Unlock Editing"}
             >
               {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
             </button>

             <button 
              onClick={handleGenerateReport}
              className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Report
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <DashboardStats data={segments} />

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search Segment..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          
          {/* Only show Add button if Admin */}
          {isAdmin && (
            <button 
              onClick={handleAddNewSegment}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Add Segment
            </button>
          )}
        </div>

        {/* Matrix View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  {/* Reduced width from w-32 to w-20 */}
                  <th className="px-4 py-4 w-20 sticky left-0 bg-slate-50 z-10 shadow-sm border-r border-slate-100 text-center">No.</th>
                  {PART_OPTIONS.map(part => (
                    <th key={part} className="px-4 py-4 text-center min-w-[140px]">{part}</th>
                  ))}
                  {/* Only show Actions column if Admin */}
                  {isAdmin && <th className="px-4 py-4 w-20 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroupKeys.length === 0 ? (
                  <tr>
                    <td colSpan={PART_OPTIONS.length + (isAdmin ? 2 : 1)} className="px-6 py-12 text-center text-slate-400">
                      No data found.
                    </td>
                  </tr>
                ) : (
                  filteredGroupKeys.map(name => (
                    <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                      {/* Reduced font size to text-sm and simplified name display */}
                      <td className="px-4 py-4 text-sm font-bold text-slate-700 text-center sticky left-0 bg-white hover:bg-slate-50 transition-colors z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {name.replace(/Segment\s?/i, '')}
                      </td>
                      {PART_OPTIONS.map(part => {
                        const data = groupedSegments[name][part];
                        const statusCfg = data ? STATUS_CONFIG[data.status] : null;
                        const StatusIcon = statusCfg?.icon;

                        return (
                          <td key={part} className="px-2 py-3 align-top">
                            {data && statusCfg ? (
                              <div 
                                onClick={() => handleCellClick(name, part, data)}
                                className={`
                                  relative p-3 rounded-xl border transition-all 
                                  ${isAdmin ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : 'cursor-default'}
                                  ${statusCfg.bgColor} border-slate-200 min-h-[120px]
                                `}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className={`flex items-center space-x-1.5 ${statusCfg.color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">{statusCfg.label}</span>
                                  </div>
                                  {/* Added Percentage Display */}
                                  <span className={`text-xs font-bold ${data.progress === 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                    {data.progress}%
                                  </span>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${data.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                      style={{ width: `${data.progress}%` }}
                                    />
                                  </div>
                                  {data.remarks && (
                                    <p className="text-[10px] text-red-600 font-medium leading-tight border-t border-red-200/50 pt-1 mt-1 break-words whitespace-pre-wrap">
                                      {data.remarks}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              // Empty state handling
                              isAdmin ? (
                                <button
                                  onClick={() => handleCellClick(name, part)}
                                  className="w-full h-full min-h-[120px] border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all gap-1 group"
                                >
                                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-medium">Add</span>
                                </button>
                              ) : (
                                <div className="w-full h-full min-h-[120px] flex items-center justify-center text-slate-200">
                                  -
                                </div>
                              )
                            )}
                          </td>
                        );
                      })}
                      {/* Only show delete button column if Admin */}
                      {isAdmin && (
                        <td className="px-4 py-4 text-center">
                          <button 
                            onClick={() => handleDeleteGroup(name)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        initialData={editingSegment}
      />

      <AIReport 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        isLoading={isGeneratingReport}
        reportContent={reportContent}
      />
    </div>
  );
};

export default App;