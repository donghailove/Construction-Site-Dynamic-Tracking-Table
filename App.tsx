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
  Unlock,
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

import { SegmentData, ConstructionStatus, SegmentPart } from './types';
import { STATUS_CONFIG, MOCK_INITIAL_DATA, PART_OPTIONS } from './constants';
import { DashboardStats } from './components/DashboardStats';
import { EditModal } from './components/EditModal';
import { AIReport } from './components/AIReport';
import { SetupGuide } from './components/SetupGuide';
import { Toast, ToastType } from './components/Toast';
import { generateSiteReport } from './services/geminiService';
import { db } from './services/firebase';

const App: React.FC = () => {
  // Loading state for initial data fetch
  const [isLoading, setIsLoading] = useState(true);
  
  const [segments, setSegments] = useState<SegmentData[]>([]);
  
  const [filter, setFilter] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentData | null>(null);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportContent, setReportContent] = useState('');

  // Setup Guide Modal
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Sync State
  const isSyncEnabled = !!db;

  useEffect(() => {
    let unsubscribe: () => void;

    const initializeData = async () => {
      if (isSyncEnabled) {
        // --- FIREBASE MODE ---
        const segmentsRef = collection(db, 'segments');
        
        unsubscribe = onSnapshot(segmentsRef, async (snapshot) => {
          if (snapshot.empty) {
            // Seed data if DB is empty
            // Check local storage first to migrate existing work
            const localData = localStorage.getItem('site_segments_v3');
            const dataToSeed = localData ? JSON.parse(localData) : MOCK_INITIAL_DATA;
            
            console.log("Database empty. Seeding with initial data...", dataToSeed.length);
            
            // Use batch for better performance
            const batch = writeBatch(db);
            dataToSeed.forEach((seg: SegmentData) => {
              const docRef = doc(db, 'segments', seg.id);
              batch.set(docRef, seg);
            });
            await batch.commit();
            // Data will appear in next snapshot update
          } else {
            const remoteData = snapshot.docs.map(doc => doc.data() as SegmentData);
            setSegments(remoteData);
            setIsLoading(false);
          }
        }, (error) => {
          console.error("Sync error:", error);
          setIsLoading(false);
        });
      } else {
        // --- LOCAL STORAGE MODE ---
        const saved = localStorage.getItem('site_segments_v3');
        if (saved) {
           setSegments(JSON.parse(saved));
        } else {
           setSegments(MOCK_INITIAL_DATA);
        }
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSyncEnabled]);

  // Save to LocalStorage as backup/fallback whenever segments change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('site_segments_v3', JSON.stringify(segments));
    }
  }, [segments, isLoading]);

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

  const handleDeleteGroup = async (name: string) => {
    if (confirm(`Are you sure you want to delete all records for "${name}"?`)) {
      if (isSyncEnabled) {
        // Delete from Firebase
        const q = query(collection(db, "segments"), where("name", "==", name));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        setToast({ message: `Deleted records for ${name}`, type: 'success' });
      } else {
        // Delete Local
        setSegments(segments.filter(s => s.name !== name));
        setToast({ message: `Deleted records for ${name}`, type: 'success' });
      }
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

  const handleSave = async (data: Partial<SegmentData>) => {
    const timestamp = new Date().toISOString();
    let segmentToSave: SegmentData;

    if (editingSegment && editingSegment.id) {
      // Update existing record
      segmentToSave = { 
        ...editingSegment, 
        ...data, 
        lastUpdated: timestamp 
      } as SegmentData;
    } else {
      // Create new record
      segmentToSave = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name || editingSegment?.name || 'New Segment',
        part: data.part || editingSegment?.part || SegmentPart.BOTTOM_SLAB,
        status: data.status || ConstructionStatus.NOT_STARTED,
        progress: data.progress || 0,
        remarks: data.remarks || '',
        lastUpdated: timestamp
      };
      
      // Check for duplicates locally to prevent UI glitch before sync
      const exists = segments.some(s => s.name === segmentToSave.name && s.part === segmentToSave.part && s.id !== editingSegment?.id);
      if (exists) {
        setToast({ message: 'Record for this part already exists.', type: 'error' });
        return;
      }
    }

    if (isSyncEnabled) {
      // Save to Firebase
      try {
        await setDoc(doc(db, "segments", segmentToSave.id), segmentToSave);
        setToast({ message: 'Data saved to Cloud successfully', type: 'success' });
      } catch (e) {
        console.error("Error saving to DB", e);
        setToast({ message: 'Failed to save to cloud.', type: 'error' });
      }
    } else {
      // Save Local
      if (editingSegment && editingSegment.id) {
        setSegments(segments.map(s => s.id === editingSegment.id ? segmentToSave : s));
      } else {
        setSegments([...segments, segmentToSave]);
      }
      setToast({ message: 'Data saved locally', type: 'success' });
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
    // Only used to enter admin mode now
    const password = prompt("Enter Admin Password to Edit:");
    // Simple hardcoded password check
    if (password === "admin888") {
      setIsAdmin(true);
      setToast({ message: 'Admin Mode Unlocked', type: 'success' });
    } else if (password !== null) {
      setToast({ message: 'Incorrect Password', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading Site Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative">
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-30 border-b px-6 py-3 shadow-sm backdrop-blur-md transition-colors ${isAdmin ? 'bg-amber-50/90 border-amber-200' : 'bg-white/80 border-slate-200'}`}>
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SiteTrack Pro</h1>
            
            {/* Sync Status Indicator */}
            <button 
              onClick={() => !isSyncEnabled && setIsSetupOpen(true)}
              className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border transition-all 
                ${isSyncEnabled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default' 
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 cursor-pointer'
                }`}
            >
              {isSyncEnabled ? (
                <>
                  <Cloud className="w-3 h-3 mr-1" />
                  Live Sync
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 mr-1" />
                  Local Mode
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-3">
             <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-500 border border-slate-200">
               <CalendarDays className="w-4 h-4 mr-2" />
               {new Date().toLocaleDateString()}
             </div>
             
             {/* Admin Controls */}
             {isAdmin ? (
               <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-5 duration-200">
                 <button
                   onClick={() => setIsAdmin(false)}
                   className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => {
                     setIsAdmin(false);
                     setToast({ message: 'Session completed. Editing locked.', type: 'info' });
                   }}
                   className="flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                 >
                   <CheckCircle2 className="w-4 h-4 mr-2" />
                   Save & Finish
                 </button>
               </div>
             ) : (
               <button
                 onClick={handleAdminToggle}
                 className="flex items-center px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
               >
                 <Lock className="w-4 h-4 mr-2" />
                 Admin Mode
               </button>
             )}

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

      <main className="w-full px-6 py-8">
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
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors w-full md:w-auto justify-center animate-in fade-in"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Add Segment
            </button>
          )}
        </div>

        {/* Matrix View */}
        <div className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${isAdmin ? 'border-amber-200 ring-4 ring-amber-50/50' : 'border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                  <th className="px-1 py-4 w-[60px] sticky left-0 bg-slate-50 z-10 shadow-sm border-r border-slate-100 text-center">Segment</th>
                  {PART_OPTIONS.map(part => {
                    // Adjust widths: Blinding & Waterproofing wider (15%), Others (21%)
                    const isNarrow = part === SegmentPart.BLINDING || part === SegmentPart.WATERPROOFING;
                    const widthClass = isNarrow ? "w-[15%]" : "w-[21%]";
                    return (
                      <th key={part} className={`px-4 py-4 text-center ${widthClass}`}>{part}</th>
                    );
                  })}
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
                      <td className="px-1 py-4 text-sm font-bold text-slate-700 text-center sticky left-0 bg-white hover:bg-slate-50 transition-colors z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
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
                                  ${isAdmin ? 'cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5' : 'cursor-default'}
                                  ${statusCfg.bgColor} border-slate-200 min-h-[120px]
                                `}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className={`flex items-center space-x-1.5 ${statusCfg.color}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">{statusCfg.label}</span>
                                  </div>
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

      <SetupGuide
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;