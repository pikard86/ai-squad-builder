export interface Attribute {
  label: string;
  value: number; // 0-99
  fullLabel?: string;
}

export interface TechSkill {
  name: string;
  rating: number; // 0-99
}

export interface CardData {
  id: string;
  name: string;
  position: string;
  nationality: string;
  overall: number;
  attributes: Attribute[]; // Exactly 6 attributes
  summary: string;
  techSkills?: TechSkill[]; // New field for specific tech metrics
  foot?: 'Left' | 'Right' | 'Both'; 
  workRate?: string; 
  imageUrl?: string;
}

export interface ParseResult {
  data: CardData | null;
  imageUrl: string | null;
}

export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  UNKNOWN = 'unknown'
}

// Expanded Roles for various formations
export type PositionRole = 
  | 'manager' | 'po' | 'devops' 
  | 'fe1' | 'fe2' | 'fe3' | 'fe4' 
  | 'be1' | 'be2' | 'be3' | 'be4' 
  | 'ux' | 'qa' | 'arch' 
  | 'data1' | 'data2' | 'ds';

export const ROLE_LABELS: Record<string, string> = {
  manager: 'Eng Manager',
  po: 'Product Owner',
  devops: 'DevOps / SRE',
  fe1: 'Frontend Dev',
  fe2: 'Frontend Dev',
  fe3: 'Frontend Dev',
  fe4: 'Frontend Dev',
  be1: 'Backend Dev',
  be2: 'Backend Dev',
  be3: 'Backend Dev',
  be4: 'Backend Dev',
  ux: 'UX Designer',
  qa: 'QA Engineer',
  arch: 'Solutions Arch',
  data1: 'Data Engineer',
  data2: 'Data Engineer',
  ds: 'Data Scientist'
};

export interface TeamLineup {
  // Dynamic dictionary of slotKey -> Player
  players: Record<string, CardData | null>;
  
  // Special designation (Captain equivalent)
  scrumMasterId: string | null;
}

// -- Formation Definitions --

export interface PitchPosition {
  top: string;
  left: string;
}

export interface FormationSlot {
  id: PositionRole; 
  label?: string; // Optional override
  position: PitchPosition;
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Formation[] = [
  {
    id: 'cross-functional',
    name: 'Classic Agile (Cross-Functional)',
    description: 'Balanced team for end-to-end delivery.',
    slots: [
      { id: 'manager', position: { top: '12%', left: '50%' } },
      { id: 'po', position: { top: '35%', left: '50%' } },
      { id: 'fe1', position: { top: '55%', left: '20%' } },
      { id: 'fe2', position: { top: '55%', left: '80%' } },
      { id: 'devops', position: { top: '55%', left: '50%' } },
      { id: 'be1', position: { top: '80%', left: '35%' } },
      { id: 'be2', position: { top: '80%', left: '65%' } },
    ]
  },
  {
    id: 'microservices',
    name: 'Microservices Squad',
    description: 'Backend heavy team optimized for API and service scale.',
    slots: [
      { id: 'manager', position: { top: '12%', left: '50%' } },
      { id: 'po', position: { top: '30%', left: '30%' } },
      { id: 'devops', position: { top: '30%', left: '70%' } },
      { id: 'be1', position: { top: '55%', left: '35%' } },
      { id: 'be2', position: { top: '55%', left: '65%' } },
      { id: 'be3', position: { top: '80%', left: '20%' } },
      { id: 'be4', position: { top: '80%', left: '80%' } },
    ]
  },
  {
    id: 'frontend-exp',
    name: 'Frontend Experience',
    description: 'UX and Frontend focus for UI/UX intensive products.',
    slots: [
      { id: 'manager', position: { top: '12%', left: '50%' } },
      { id: 'ux', position: { top: '35%', left: '50%' } },
      { id: 'fe1', position: { top: '55%', left: '20%' } },
      { id: 'fe2', position: { top: '55%', left: '80%' } },
      { id: 'fe3', position: { top: '75%', left: '30%' } },
      { id: 'fe4', position: { top: '75%', left: '70%' } },
      { id: 'be1', position: { top: '88%', left: '50%' } },
    ]
  },
  {
    id: 'data-analytics',
    name: 'Data & Analytics',
    description: 'Specialized team for data pipelines and AI models.',
    slots: [
      { id: 'manager', position: { top: '12%', left: '50%' } },
      { id: 'po', position: { top: '35%', left: '30%' } },
      { id: 'ds', position: { top: '35%', left: '70%' } },
      { id: 'data1', position: { top: '60%', left: '40%' } },
      { id: 'data2', position: { top: '60%', left: '60%' } },
      { id: 'be1', position: { top: '80%', left: '20%' } },
      { id: 'devops', position: { top: '80%', left: '80%' } },
    ]
  },
  {
    id: 'integration',
    name: 'Integration & Platform',
    description: 'Robust engineering with QA and Architecture.',
    slots: [
      { id: 'manager', position: { top: '12%', left: '50%' } },
      { id: 'arch', position: { top: '30%', left: '50%' } },
      { id: 'be1', position: { top: '50%', left: '30%' } },
      { id: 'be2', position: { top: '50%', left: '70%' } },
      { id: 'qa', position: { top: '70%', left: '50%' } },
      { id: 'be3', position: { top: '85%', left: '30%' } },
      { id: 'devops', position: { top: '85%', left: '70%' } },
    ]
  }
];