import { create } from 'zustand';
import type { TemplateType, ToneType, OutputFormat, ProcessingMode } from '@/types';

interface UploadState {
  file: File | null;
  templateType: TemplateType | null;
  tone: ToneType;
  outputFormat: OutputFormat;
  processingMode: ProcessingMode;
  step: number;
  setFile: (file: File | null) => void;
  setTemplateType: (t: TemplateType) => void;
  setTone: (t: ToneType) => void;
  setOutputFormat: (f: OutputFormat) => void;
  setProcessingMode: (m: ProcessingMode) => void;
  setStep: (s: number) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  file: null,
  templateType: null,
  tone: 'formal',
  outputFormat: 'docx',
  processingMode: 'both',
  step: 0,

  setFile: (file) => set({ file }),
  setTemplateType: (templateType) => set({ templateType }),
  setTone: (tone) => set({ tone }),
  setOutputFormat: (outputFormat) => set({ outputFormat }),
  setProcessingMode: (processingMode) => set({ processingMode }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({
      file: null,
      templateType: null,
      tone: 'formal',
      outputFormat: 'docx',
      processingMode: 'both',
      step: 0,
    }),
}));

