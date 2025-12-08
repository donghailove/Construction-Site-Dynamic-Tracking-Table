export enum SegmentPart {
  BLINDING = 'Blinding',
  WATERPROOFING = 'Waterproofing',
  BOTTOM_SLAB = 'Base Slab',
  SIDE_WALL = 'Side Wall',
  TOP_SLAB = 'Top Slab'
}

export enum ConstructionStatus {
  NOT_STARTED = 'NOT_STARTED',
  EXCAVATION = 'EXCAVATION',
  REBAR = 'REBAR',
  FORMWORK = 'FORMWORK',
  POURING = 'POURING',
  CURING = 'CURING',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED' // Added for stopped work
}

export interface SegmentData {
  id: string;
  name: string; // e.g., "Segment 33"
  part: SegmentPart;
  status: ConstructionStatus;
  progress: number; // 0-100
  lastUpdated: string; // ISO Date
  remarks: string;
}

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon?: any;
}