import { ConstructionStatus, SegmentPart } from './types';
import { 
  CircleDashed, 
  Shovel, 
  Component, 
  Square, 
  Droplets, 
  Clock, 
  CheckCircle2,
  XCircle // For Suspended
} from 'lucide-react';

export const STATUS_CONFIG: Record<ConstructionStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  [ConstructionStatus.NOT_STARTED]: { 
    label: 'Not Started', 
    color: 'text-slate-500', 
    bgColor: 'bg-slate-100',
    icon: CircleDashed 
  },
  [ConstructionStatus.EXCAVATION]: { 
    label: 'Excavation', 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-100',
    icon: Shovel
  },
  [ConstructionStatus.REBAR]: { 
    label: 'Rebar', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    icon: Component
  },
  [ConstructionStatus.FORMWORK]: { 
    label: 'Formwork', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-100',
    icon: Square
  },
  [ConstructionStatus.POURING]: { 
    label: 'In Progress', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100',
    icon: Droplets
  },
  [ConstructionStatus.CURING]: { 
    label: 'Curing', 
    color: 'text-teal-600', 
    bgColor: 'bg-teal-100',
    icon: Clock
  },
  [ConstructionStatus.COMPLETED]: { 
    label: 'Completed', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-100',
    icon: CheckCircle2
  },
  [ConstructionStatus.SUSPENDED]: { 
    label: 'Suspended', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100',
    icon: XCircle
  }
};

export const PART_OPTIONS = [
  SegmentPart.BLINDING,
  SegmentPart.WATERPROOFING,
  SegmentPart.BOTTOM_SLAB,
  SegmentPart.SIDE_WALL,
  SegmentPart.TOP_SLAB
];

// Helper to generate mock data based on specific instructions
const generateMockData = () => {
  const segments: any[] = [];
  
  const add = (num: number, part: SegmentPart, status: ConstructionStatus, progress: number, remarks: string) => {
    segments.push({
      id: `${num}-${part}`,
      name: `Segment ${num}`,
      part,
      status,
      progress,
      lastUpdated: new Date().toISOString(),
      remarks
    });
  };

  for (let i = 33; i <= 79; i++) {
    const hasTopSlab = i <= 62;
    
    // Default: If Slab is not started, usually previous steps are done or waiting.
    // If Slab is Completed, previous steps MUST be completed.
    
    let blindStatus = ConstructionStatus.COMPLETED;
    let blindProg = 100;
    let wpStatus = ConstructionStatus.COMPLETED;
    let wpProg = 100;
    let bsStatus = ConstructionStatus.NOT_STARTED;
    let bsProg = 0;
    let bsRemark = '';
    let swStatus = ConstructionStatus.NOT_STARTED;
    let swProg = 0;
    let swRemark = '';
    let tsStatus = ConstructionStatus.NOT_STARTED;
    let tsProg = 0;
    let tsRemark = '';

    // Logic based on the provided image
    if (i === 33) {
      bsStatus = ConstructionStatus.SUSPENDED; bsProg = 50; bsRemark = "1.30 T delivered, installation completed, 180T in waiting (Ultmost)\n2. site stopped > 3d";
      swRemark = "waiting for slab compeltion";
    } else if (i === 34) {
      blindStatus = ConstructionStatus.EXCAVATION; blindProg = 50; // Piling work implies Blinding not ready
      wpStatus = ConstructionStatus.NOT_STARTED; wpProg = 0;
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "UAF piling work";
      swRemark = "waiting for slab compeltion";
    } else if (i === 35) {
      blindStatus = ConstructionStatus.SUSPENDED; blindProg = 0;
      wpStatus = ConstructionStatus.NOT_STARTED; wpProg = 0;
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "UAF blocking the access";
      swRemark = "waiting for slab compeltion";
    } else if (i === 36) {
      wpStatus = ConstructionStatus.POURING; wpProg = 60; bsRemark = "1. waterproofing on-going\n2. 220 T rebar in waiting (Ultmost)";
      bsStatus = ConstructionStatus.NOT_STARTED;
      swRemark = "waiting for slab compeltion";
    } else if (i === 37) {
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "to start after seg 36, 38 slabs completion";
      swRemark = "waiting for slab compeltion";
    } else if (i === 38) {
      wpStatus = ConstructionStatus.POURING; wpProg = 60; bsRemark = "1. waterproofing on-going\n2. 220 T rebar frebarication done (CRIG), in trasportaiton";
      bsStatus = ConstructionStatus.NOT_STARTED;
      swRemark = "waiting for slab compeltion";
    } else if (i >= 39 && i <= 43) {
      bsStatus = ConstructionStatus.NOT_STARTED;
      swRemark = "waiting for slab compeltion";
      if (i === 39) bsRemark = "to start after pump room compeltion";
      if (i === 40) bsRemark = "to start after pump room compeltion (pump room location)";
      if (i === 41) bsRemark = "to start after pump room compeltion";
      if (i === 42) bsRemark = "within 2 days after access relocate";
      if (i === 43) bsRemark = "to start after seg44 slab completion";
    } else if (i === 44) {
      bsStatus = ConstructionStatus.SUSPENDED; bsProg = 40; bsRemark = "1. 88 T delivered, installation completed, 130 T in waiting (Cicon)\n2. site stopped > 1d";
      swRemark = "waiting for slab compeltion";
    } else if (i === 45) {
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "to start after seg44, 46 slab completion";
      swRemark = "waiting for slab compeltion";
    } else if (i === 46) {
      bsStatus = ConstructionStatus.SUSPENDED; bsProg = 20; bsRemark = "1. all reber delivered until 7th Decemebr\n2. site stopped > 4 days, to re-start today";
      swRemark = "waiting for slab compeltion";
    } else if (i === 47) {
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "to start after 46 slab completion";
      swRemark = "waiting for slab compeltion";
    } else if (i === 48) {
      bsStatus = ConstructionStatus.COMPLETED; bsProg = 100; bsRemark = "completion";
      swStatus = ConstructionStatus.SUSPENDED; swRemark = "no material";
    } else if (i === 49) {
      wpStatus = ConstructionStatus.NOT_STARTED; wpProg = 0; 
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "1. to start waterproofing 8th of December\n2. 25th PO confirmed, request 9th of December to deliver(Cicon)";
      swRemark = "waiting for slab compeltion";
    } else if (i === 50) {
      bsStatus = ConstructionStatus.COMPLETED; bsProg = 100; bsRemark = "completion";
      swStatus = ConstructionStatus.SUSPENDED; swRemark = "no material";
    } else if (i === 51) {
      bsStatus = ConstructionStatus.REBAR; bsProg = 60; bsRemark = "1. 120 T delivered, installation on-going (delivered quantity gaps about 20 T)\n2. 80T request to delvier 8th of Decmber (Cicon)\n3. site stopped 0.5 day";
      swRemark = "waiting for slab compeltion";
    } else if (i >= 52 && i <= 59) {
      bsStatus = ConstructionStatus.COMPLETED; bsProg = 100; bsRemark = "completion";
      if (i === 52) { swStatus = ConstructionStatus.REBAR; swProg = 10; swRemark = "1. PO sent 7th to CRIG"; }
      else if (i === 53) { swStatus = ConstructionStatus.SUSPENDED; swRemark = "no material"; }
      else if (i === 54) { swStatus = ConstructionStatus.SUSPENDED; swRemark = "no material"; }
      else if (i === 55) { swStatus = ConstructionStatus.REBAR; swProg = 20; swRemark = "21st rebar po confirmed, waiting for delviery (CRTG)"; }
      else if (i === 56) { swStatus = ConstructionStatus.REBAR; swProg = 50; swRemark = "rebar works on-going"; }
      else if (i === 57) { swStatus = ConstructionStatus.REBAR; swProg = 20; swRemark = "28th rebar po confirmed, waiting for delviery ( CRTG)"; }
      else if (i === 58) { swStatus = ConstructionStatus.FORMWORK; swProg = 60; swRemark = "formwork on-going, casting plan about 10th"; }
      else if (i === 59) { swStatus = ConstructionStatus.SUSPENDED; swRemark = "MEP issue blcoking rebar PO, in waiting"; }
    } else if (i === 60) {
      bsStatus = ConstructionStatus.SUSPENDED; bsProg = 80; bsRemark = "1. MEP issues blocking, stopped > 2days\n2. CRTG casting plan 6th of December overdue";
      swStatus = ConstructionStatus.NOT_STARTED; swRemark = "1. waiting for slab compeltion\n2. MEP issue blcoking rebar PO";
    } else if (i === 61) {
      bsStatus = ConstructionStatus.COMPLETED; bsProg = 100; bsRemark = "completion";
      swStatus = ConstructionStatus.REBAR; swProg = 10; swRemark = "1. Rebar PO 4th of December (CRIG), in wating";
    } else if (i === 62) {
      wpStatus = ConstructionStatus.NOT_STARTED; wpProg = 0; 
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "1. to start after seg 63 backfilling completion";
      swRemark = "waiting for slab compeltion";
    } else if (i === 63) {
      wpStatus = ConstructionStatus.POURING; wpProg = 50; 
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "1. AMC water proofing on-going;\n2. then backfilling\n3. to start after seg62, 64 compeltion.";
      swRemark = "waiting for slab compeltion";
    } else if (i === 64) {
      wpStatus = ConstructionStatus.NOT_STARTED; wpProg = 0;
      bsStatus = ConstructionStatus.NOT_STARTED; bsRemark = "to start after seg 63 backfilling completion";
      swRemark = "waiting for slab compeltion";
    } else if (i >= 65 && i <= 79) {
      bsStatus = ConstructionStatus.COMPLETED; bsProg = 100; bsRemark = "completion";
      if (i === 65) { swStatus = ConstructionStatus.FORMWORK; swProg = 70; swRemark = "formwork on-going, casting plan about 13rd of December"; }
      else if (i === 66) { swStatus = ConstructionStatus.REBAR; swProg = 50; swRemark = "rebar works on-going"; }
      else if (i === 67) { swStatus = ConstructionStatus.FORMWORK; swProg = 40; swRemark = "1. in pushing CRTG, casting plan about 14th of December"; }
      else if (i === 68) { swStatus = ConstructionStatus.NOT_STARTED; swRemark = "1. waiting 67, 69 side wall completion\n2. rebar PO sent 17th of Nov, request to delvier 12th"; }
      else if (i === 69) { swStatus = ConstructionStatus.SUSPENDED; swProg = 30; swRemark = "1. scalfolding issue, site installtion issue and mainly waiting for MEP\n2. East side casting plan 8th of December"; }
      else if (i === 70) { swStatus = ConstructionStatus.COMPLETED; swProg = 100; swRemark = "completion"; }
      else if (i === 71) { swStatus = ConstructionStatus.SUSPENDED; swProg = 90; swRemark = "1. rebar comleted apart from the ITS Gantry issue, drawing not fixed. Awaiting for around 45 days"; }
      else if (i >= 72) { swStatus = ConstructionStatus.COMPLETED; swProg = 100; swRemark = "completion"; }
    }

    add(i, SegmentPart.BLINDING, blindStatus, blindProg, "");
    add(i, SegmentPart.WATERPROOFING, wpStatus, wpProg, "");
    add(i, SegmentPart.BOTTOM_SLAB, bsStatus, bsProg, bsRemark);
    add(i, SegmentPart.SIDE_WALL, swStatus, swProg, swRemark);
    
    if (hasTopSlab) {
      add(i, SegmentPart.TOP_SLAB, tsStatus, tsProg, tsRemark);
    }
  }
  return segments;
};

export const MOCK_INITIAL_DATA = generateMockData();