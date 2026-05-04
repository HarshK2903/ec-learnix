import { create } from 'zustand';
import type { TemplateType, ToneType, OutputFormat } from '@/types';

interface UploadState {
  file: File | null;
  templateType: TemplateType | null;
  tone: ToneType;
  outputFormat: OutputFormat;
  step: number;
  setFile: (file: File | null) => void;
  setTemplateType: (t: TemplateType) => void;
  setTone: (t: ToneType) => void;
  setOutputFormat: (f: OutputFormat) => void;
  setStep: (s: number) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  file: null,
  templateType: null,
  tone: 'formal',
  outputFormat: 'docx',
  step: 0,

  setFile: (file) => set({ file }),
  setTemplateType: (templateType) => set({ templateType }),
  setTone: (tone) => set({ tone }),
  setOutputFormat: (outputFormat) => set({ outputFormat }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({
      file: null,
      templateType: null,
      tone: 'formal',
      outputFormat: 'docx',
      step: 0,
    }),
}));
