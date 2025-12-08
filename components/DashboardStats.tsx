import React from 'react';
import { SegmentData, ConstructionStatus } from '../types';
import { Activity, CheckCircle2, AlertTriangle, Hammer, XCircle } from 'lucide-react';

interface DashboardStatsProps {
  data: SegmentData[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const total = data.length;
  const completed = data.filter(d => d.status === ConstructionStatus.COMPLETED).length;
  // Active means not completed, not suspended, and started
  const active = data.filter(d => 
    d.status !== ConstructionStatus.NOT_STARTED && 
    d.status !== ConstructionStatus.COMPLETED && 
    d.status !== ConstructionStatus.SUSPENDED
  ).length;
  
  // Count all In Progress types (Excavation, Rebar, Formwork, Pouring, Laying)
  const inProgress = data.filter(d => 
    d.status === ConstructionStatus.EXCAVATION ||
    d.status === ConstructionStatus.REBAR ||
    d.status === ConstructionStatus.FORMWORK ||
    d.status === ConstructionStatus.POURING ||
    d.status === ConstructionStatus.LAYING
  ).length;
  
  const suspended = data.filter(d => d.status === ConstructionStatus.SUSPENDED).length;

  // Calculate simple overall progress average (excluding Not Started for better accuracy or include all?)
  // Including all gives a true project completion status
  const avgProgress = total > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.progress, 0) / total) : 0;

  const stats = [
    {
      label: 'Overall Progress',
      value: `${avgProgress}%`,
      sub: `${completed}/${total} Parts Done`,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Parts',
      value: active,
      sub: 'Works in progress',
      icon: Hammer,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'In Progress',
      value: inProgress,
      sub: 'Critical activity',
      icon: AlertTriangle, 
      color: inProgress > 0 ? 'text-purple-600' : 'text-slate-400',
      bg: inProgress > 0 ? 'bg-purple-50' : 'bg-slate-50'
    },
    {
      label: 'Suspended / Delay',
      value: suspended,
      sub: 'Issues found',
      icon: XCircle,
      color: suspended > 0 ? 'text-red-600' : 'text-slate-400',
      bg: suspended > 0 ? 'bg-red-50' : 'bg-slate-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <Icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <p className="text-xs text-slate-400">{stat.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};