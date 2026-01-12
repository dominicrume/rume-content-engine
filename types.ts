export enum ContentTheme {
  Infrastructure = 'Infrastructure',
  Sovereignty = 'Sovereignty',
  Wealth = 'Wealth',
  AI = 'AI',
  Unclassified = 'Unclassified'
}

export enum EngineStatus {
  Idle = 'IDLE',
  Recording = 'RECORDING',
  Processing = 'PROCESSING',
  Review = 'REVIEW',
  Refining = 'REFINING',
  Scrutinizing = 'SCRUTINIZING',
  Publishing = 'PUBLISHING',
  Published = 'PUBLISHED',
  Error = 'ERROR'
}

export type PublishingPlatform = 'LINKEDIN' | 'X' | 'MEDIUM' | 'SUBSTACK';

export interface GeneratedContent {
  hook: string;
  body: string; // Markdown supported
  cta: string;
  theme: ContentTheme;
  rawResponse: string;
}

export interface StrategyIdea {
  headline: string;
  hook: string;
  angle: string;
}

export interface StrategyResult {
  painPointAnalysis: string; // New field for the Agent to explain the identified problem
  howTo: StrategyIdea[];
  listicles: StrategyIdea[];
  contrarian: StrategyIdea[];
  frameworks: StrategyIdea[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
}

export interface AuditRecord {
  traceabilityId: string;
  timestamp: string;
  inputType: 'VOICE' | 'TEXT';
  model: string;
}