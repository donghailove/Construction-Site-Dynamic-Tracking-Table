import React, { useState, useEffect } from 'react';
import { SegmentData, ConstructionStatus, SegmentPart } from '../types';
import { STATUS_CONFIG, PART_OPTIONS } from '../constants';
import { X } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SegmentData>) => void;
  initialData?: SegmentData | null;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<SegmentData>>({
    name: '',
    part: SegmentPart.BOTTOM_SLAB,
    status: ConstructionStatus.NOT_STARTED,
    progress: 0,
    remarks: ''
  });

  const isEditing = initialData && initialData.id !== '';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          part: SegmentPart.BOTTOM_SLAB,
          status: ConstructionStatus.NOT_STARTED,
          progress: 0,
          remarks: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-lg text-slate-800">
            {isEditing ? 'Edit Status' : 'Add New Record'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Segment Name</label>
            <input
              required
              type="text"
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${initialData?.name && !initialData?.id ? 'bg-slate-100' : ''}`}
              placeholder="e.g., Segment 33"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Part</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.part}
              onChange={e => setFormData({ ...formData, part: e.target.value as SegmentPart })}
            >
              {PART_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as ConstructionStatus })}
            >
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Progress: <span className="text-blue-600 font-bold">{formData.progress}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              value={formData.progress}
              onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Reasons for delay etc.)</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-red-600"
              rows={3}
              placeholder="E.g., Waiting for drawings, Material delay..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};