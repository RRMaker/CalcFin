export interface WeaknessScores {
  [key: string]: number;
}

export type ActionStatus = 'incomplete' | 'practicing' | 'complete';

export interface ActionItem {
  id: number;
  text: string;
  topic: string;
  type: 'concept' | 'technical';
  status: ActionStatus;
}

export interface AnalysisResponse {
  weaknessScores: WeaknessScores;
  actionPlan: ActionItem[];
}

export type Page = 'HOME' | 'UPLOAD' | 'ACTION_PLAN';
