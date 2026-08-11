export type ProjectStatus = '계획중' | '진행중' | '보류' | '완료';

export interface Project {
  id: string;
  category: string;
  company: string;
  title: string;
  status: ProjectStatus;
  progress: number; // 0 ~ 100
  updatedAt: string;
  description: string;
  isStarred?: boolean;
}

export interface Idea {
  id: string;
  category: string;
  title: string;
  content: string;
  linkUrl?: string;
  createdAt: string;
}

export const CATEGORIES = [
  'SD Head Quarter',
  'Intelligence Core',
  'Qubit Algorithm',
  'Scarlet Ai',
  'Qubit Biz',
  'Biz Hub',
  'Product',
  'Service',
  'IT- Ai',
  'RnD- Mfg',
] as const;

export const PROJECT_STATUSES: ProjectStatus[] = ['계획중', '진행중', '보류', '완료'];

