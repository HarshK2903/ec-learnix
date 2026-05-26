import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import { useUploadStore } from '@/stores/uploadStore';
import { TEMPLATE_INFO, TONE_INFO, PROCESSING_MODE_INFO } from '@/types';
import type { TemplateType, ToneType, OutputFormat, ProcessingMode } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Upload, FileText, CheckCircle2, ArrowLeft, ArrowRight, Loader2,
  X, FileUp, Sparkles
} from 'lucide-react';
import { useState } from 'react';

const STEPS = ['Upload File', 'Select Template', 'Customize', 'Confirm'];

export default function UploadPage() {
  const navigate = useNavigate();
  const { file, templateType, tone, outputFormat, processingMode, step, setFile, setTemplateType, setTone, setOutputFormat, setProcessingMode, setStep, reset } = useUploadStore();
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setFile(f);
    }
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    multiple: false,
  });

  const canNext = () => {
    if (step === 0) return !!file;
    if (step === 1) return !!templateType;
    return true;
  };

  const handleSubmit = async () => {
    if (!file || !templateType) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('templateType', templateType);
      formData.append('tone', tone);
      formData.append('outputFormat', outputFormat);
      formData.append('processingMode', processingMode);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      reset();
      navigate(`/processing/${res.data.documentId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <Sparkles className="inline h-7 w-7 mr-2 text-violet-500" />
            New Document
          </h1>
          <p className="mt-1 text-muted-foreground">Upload and configure your document for AI formatting</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                i < step ? 'bg-gradient-to-br from-violet-600 to-cyan-500 text-white' :
                i === step ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background' :
                'bg-muted text-muted-foreground'
              }`}>
                {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
              {i < STEPS.length - 1 && <Separator className="flex-1" />}
            </div>
          ))}
        </div>

        {/* Step 0: Upload */}
        {step === 0 && (
          <div className="animate-fade-in">
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-8">
                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-16 transition-all cursor-pointer ${
                      isDragActive
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-border hover:border-violet-500/50 hover:bg-muted/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 mb-6">
                      <Upload className="h-8 w-8 text-violet-500" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {isDragActive ? 'Drop your file here' : 'Upload your DOCX file'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop or click to browse. Max 10MB.
                    </p>
                    <Badge variant="secondary">.docx files only</Badge>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-border p-6 bg-muted/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10">
                      <FileText className="h-7 w-7 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 1: Template */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.entries(TEMPLATE_INFO) as [TemplateType, typeof TEMPLATE_INFO[TemplateType]][]).map(([key, info]) => (
                <Card
                  key={key}
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                    templateType === key
                      ? 'border-violet-500 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                      : 'border-border/40 bg-card/50 hover:border-border'
                  }`}
                  onClick={() => setTemplateType(key)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{info.icon}</span>
                      {templateType === key && <CheckCircle2 className="h-5 w-5 text-violet-500" />}
                    </div>
                    <h3 className="font-semibold mb-1">{info.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customize */}
        {step === 2 && (
          <div className="animate-fade-in space-y-8">
            {/* Processing Mode */}
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-1">What should AI do?</h3>
                <p className="text-sm text-muted-foreground mb-4">Choose how AI processes your document</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(Object.entries(PROCESSING_MODE_INFO) as [ProcessingMode, typeof PROCESSING_MODE_INFO[ProcessingMode]][]).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => setProcessingMode(key)}
                      className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all ${
                        processingMode === key
                          ? 'border-violet-500 bg-violet-500/5 shadow-md'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-xl">{info.icon}</span>
                        <span className="font-medium text-sm">{info.label}</span>
                        {processingMode === key && <CheckCircle2 className="h-4 w-4 text-violet-500 ml-auto" />}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{info.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tone Selection */}
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Enhancement Tone</h3>
                <RadioGroup
                  value={tone}
                  onValueChange={(v) => setTone(v as ToneType)}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {(Object.entries(TONE_INFO) as [ToneType, typeof TONE_INFO[ToneType]][]).map(([key, info]) => (
                    <Label
                      key={key}
                      htmlFor={`tone-${key}`}
                      className={`flex items-center gap-3 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                        tone === key ? 'border-violet-500 bg-violet-500/5' : 'border-border hover:border-border/80'
                      }`}
                    >
                      <RadioGroupItem value={key} id={`tone-${key}`} />
                      <div>
                        <p className="font-medium text-sm">{info.label}</p>
                        <p className="text-xs text-muted-foreground">{info.description}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Output Format */}
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Output Format</h3>
                <div className="flex gap-4">
                  {(['docx', 'pdf'] as OutputFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        outputFormat === fmt ? 'border-violet-500 bg-violet-500/5' : 'border-border hover:border-border/80'
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-medium uppercase">{fmt}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-fade-in">
            <Card className="border-border/40 bg-card/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-violet-600/10 to-cyan-500/10 p-6 border-b border-border/40">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-violet-500" />
                    Ready to process
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Review your settings before starting</p>
                </div>
                <div className="divide-y divide-border/40">
                  {[
                    { label: 'File', value: file?.name || '-', sub: file ? `${(file.size / 1024).toFixed(1)} KB` : '' },
                    { label: 'Template', value: templateType ? TEMPLATE_INFO[templateType].label : '-', sub: templateType ? TEMPLATE_INFO[templateType].icon : '' },
                    { label: 'AI Mode', value: PROCESSING_MODE_INFO[processingMode].label, sub: PROCESSING_MODE_INFO[processingMode].icon },
                    { label: 'Tone', value: TONE_INFO[tone].label, sub: TONE_INFO[tone].description },
                    { label: 'Output', value: outputFormat.toUpperCase(), sub: '' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between p-5">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <div className="text-right">
                        <span className="font-medium">{row.sub && <span className="mr-2">{row.sub}</span>}{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => step === 0 ? navigate('/dashboard') : setStep(step - 1)}
            disabled={submitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 px-8"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {submitting ? 'Uploading...' : 'Process Document'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
