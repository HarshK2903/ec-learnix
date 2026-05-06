export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type TemplateType = 'journal' | 'cv' | 'biodata' | 'blogpost' | 'report';
export type ToneType = 'formal' | 'casual' | 'polite' | 'aggressive' | 'academic';
export type OutputFormat = 'docx' | 'pdf';
export type ProcessingMode = 'enhance' | 'fill_missing' | 'both';
export type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface ChangeSummary {
  field: string;
  action: 'generated' | 'enhanced' | 'unchanged';
  description: string;
  originalContent?: string;
  newContent?: string;
}

export interface DocumentItem {
  _id: string;
  originalFileName: string;
  outputFormat: OutputFormat;
  templateType: TemplateType;
  tone: ToneType;
  status: DocumentStatus;
  changeSummary: ChangeSummary[];
  errorMessage?: string;
  createdAt: string;
  processingCompletedAt?: string;
}

export interface ProgressEvent {
  stage: string;
  progress: number;
  field?: string;
  message?: string;
}

export const TEMPLATE_INFO: Record<TemplateType, { label: string; icon: string; description: string; color: string }> = {
  journal: { label: 'Journal Paper', icon: '📄', description: 'Academic paper with abstract, sections, and references', color: 'from-blue-500 to-indigo-600' },
  cv: { label: 'CV / Resume', icon: '📋', description: 'Professional resume with structured sections', color: 'from-emerald-500 to-teal-600' },
  biodata: { label: 'Bio Data', icon: '👤', description: 'Personal bio data with comprehensive details', color: 'from-purple-500 to-violet-600' },
  blogpost: { label: 'Blog Post', icon: '✍️', description: 'Web article with engaging content and SEO tags', color: 'from-orange-500 to-red-600' },
  report: { label: 'Report', icon: '📊', description: 'Executive/thesis report with structured sections', color: 'from-cyan-500 to-blue-600' },
};

export const TONE_INFO: Record<ToneType, { label: string; description: string }> = {
  formal: { label: 'Formal', description: 'Professional and business-appropriate' },
  casual: { label: 'Casual', description: 'Friendly and conversational' },
  polite: { label: 'Polite', description: 'Courteous and respectful' },
  aggressive: { label: 'Aggressive', description: 'Bold and assertive' },
  academic: { label: 'Academic', description: 'Scholarly and research-oriented' },
};

export const PROCESSING_MODE_INFO: Record<ProcessingMode, { label: string; icon: string; description: string }> = {
  enhance: { label: 'Enhance Only', icon: '✨', description: 'Improve existing content quality, grammar, and tone — don\'t add anything new' },
  fill_missing: { label: 'Fill Missing Only', icon: '📝', description: 'Generate content only for missing sections — leave existing content untouched' },
  both: { label: 'Enhance + Fill Missing', icon: '🚀', description: 'Enhance existing content AND generate any missing sections (recommended)' },
};

