export interface TemplateField {
  name: string;
  label: string;
  required: boolean;
  description: string;
  detectPatterns: RegExp[];
  missingPrompt: string;
  enhancePrompt: string;
}

export interface Template {
  type: string;
  label: string;
  description: string;
  fields: TemplateField[];
}

// ------- BLOG POST TEMPLATE -------
export const blogpostTemplate: Template = {
  type: 'blogpost',
  label: 'Blog Post',
  description: 'Web article with engaging title, content, and SEO tags',
  fields: [
    {
      name: 'title',
      label: 'Title',
      required: true,
      description: 'Engaging blog post title',
      detectPatterns: [/^#\s+/m, /^title\s*[:：]/im, /^heading\s*[:：]/im],
      missingPrompt: 'Generate an engaging blog title for this content. It covers the following topic:\n"{content}"\nReturn ONLY the title string, nothing else.',
      enhancePrompt: 'Improve this blog post title for better engagement and SEO. Current title: "{value}"\nContent context: "{content}"\nTone: {tone}.\nReturn ONLY the improved title, nothing else.',
    },
    {
      name: 'content',
      label: 'Content',
      required: true,
      description: 'Core body text of the blog post',
      detectPatterns: [],
      missingPrompt: '',
      enhancePrompt: 'Rewrite this as a blog post body. Improve flow, clarity, and engagement. Add H2 section headings where appropriate. Keep all facts intact.\nTone: {tone}.\nContent:\n"{value}"\nReturn ONLY the enhanced content.',
    },
    {
      name: 'summary',
      label: 'Summary',
      required: true,
      description: '2-3 sentence TL;DR summary',
      detectPatterns: [/^summary\s*[:：]/im, /^abstract\s*[:：]/im, /^tldr\s*[:：]/im, /^tl;dr\s*[:：]/im],
      missingPrompt: 'Write a 2-3 sentence summary of this blog post for readers who skim. Max 60 words.\nContent:\n"{content}"\nTone: {tone}.\nReturn ONLY the summary.',
      enhancePrompt: 'Refine this blog post summary for clarity and impact. Max 60 words.\nCurrent summary: "{value}"\nTone: {tone}.\nReturn ONLY the refined summary.',
    },
    {
      name: 'signature',
      label: 'Author Signature',
      required: false,
      description: 'Author sign-off with name and bio line',
      detectPatterns: [/^author\s*[:：]/im, /^by\s+/im, /^written\s+by/im, /^—\s*/m],
      missingPrompt: 'Generate a professional author sign-off for this blog post. Include a placeholder name and a short bio line.\nTone: {tone}.\nReturn ONLY the signature block.',
      enhancePrompt: 'Build a professional sign-off from this author info: "{value}". Include name, short bio line, and contact prompt.\nTone: {tone}.\nReturn ONLY the signature block.',
    },
    {
      name: 'tags',
      label: 'Tags',
      required: false,
      description: 'SEO-friendly tags/keywords',
      detectPatterns: [/^tags\s*[:：]/im, /^keywords\s*[:：]/im, /^categories\s*[:：]/im],
      missingPrompt: 'Extract 5-8 SEO-friendly tags from this blog content. Return as a JSON array of strings.\nContent:\n"{content}"\nReturn ONLY the JSON array.',
      enhancePrompt: 'Refine these tags for better SEO: {value}\nContent context: "{content}"\nReturn ONLY a JSON array of 5-8 improved tags.',
    },
    {
      name: 'date',
      label: 'Date',
      required: false,
      description: 'Publication date',
      detectPatterns: [/^date\s*[:：]/im, /^\d{4}[-/]\d{2}[-/]\d{2}/m],
      missingPrompt: '',
      enhancePrompt: '',
    },
  ],
};

// ------- JOURNAL PAPER TEMPLATE -------
export const journalTemplate: Template = {
  type: 'journal',
  label: 'Journal Paper',
  description: 'Academic paper with abstract, sections, and references',
  fields: [
    {
      name: 'title',
      label: 'Title',
      required: true,
      description: 'Academic paper title',
      detectPatterns: [/^#\s+/m, /^title\s*[:：]/im],
      missingPrompt: 'Generate an academic paper title based on the following content:\n"{content}"\nReturn ONLY the title.',
      enhancePrompt: 'Refine this academic paper title for clarity and academic tone: "{value}"\nTone: {tone}.\nReturn ONLY the improved title.',
    },
    {
      name: 'authors',
      label: 'Authors',
      required: true,
      description: 'Author names and affiliations',
      detectPatterns: [/^authors?\s*[:：]/im, /^by\s+/im],
      missingPrompt: 'The paper has no author listed. Return "Author Name Required" as a placeholder.',
      enhancePrompt: 'Format these author details properly for an academic paper: "{value}"\nReturn formatted author names with affiliations if available.',
    },
    {
      name: 'abstract',
      label: 'Abstract',
      required: true,
      description: 'Paper abstract (150-250 words)',
      detectPatterns: [/^abstract\s*[:：]?/im],
      missingPrompt: 'Generate a 150-250 word academic abstract for this paper:\n"{content}"\nTone: {tone}.\nReturn ONLY the abstract.',
      enhancePrompt: 'Refine this abstract to be between 150-250 words, maintaining academic rigor:\n"{value}"\nTone: {tone}.\nReturn ONLY the refined abstract.',
    },
    {
      name: 'keywords',
      label: 'Keywords',
      required: true,
      description: '5-7 academic keywords',
      detectPatterns: [/^keywords?\s*[:：]/im, /^index\s+terms?\s*[:：]/im],
      missingPrompt: 'Extract 5-7 academic keywords from this paper:\n"{content}"\nReturn as comma-separated keywords.',
      enhancePrompt: 'Refine these keywords for an academic paper: "{value}"\nReturn 5-7 comma-separated refined keywords.',
    },
    {
      name: 'introduction',
      label: 'Introduction',
      required: true,
      description: 'Paper introduction section',
      detectPatterns: [/^(?:1\.?\s*)?introduction\s*$/im, /^i\.\s*introduction/im],
      missingPrompt: 'Generate an introduction section for this academic paper based on:\n"{content}"\nTone: {tone}.\nReturn ONLY the introduction.',
      enhancePrompt: 'Enhance this introduction for academic quality:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced introduction.',
    },
    {
      name: 'methodology',
      label: 'Methodology',
      required: false,
      description: 'Research methodology section',
      detectPatterns: [/^(?:\d\.?\s*)?methodology\s*$/im, /^(?:\d\.?\s*)?methods?\s*$/im, /^(?:\d\.?\s*)?materials?\s+and\s+methods?\s*$/im],
      missingPrompt: 'Based on the content, attempt to generate a brief methodology section:\n"{content}"\nTone: {tone}.\nIf no methodology is apparent, return "Methodology section to be added by author."',
      enhancePrompt: 'Enhance this methodology section for academic rigor:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced methodology.',
    },
    {
      name: 'results',
      label: 'Results',
      required: false,
      description: 'Research results section',
      detectPatterns: [/^(?:\d\.?\s*)?results?\s*$/im, /^(?:\d\.?\s*)?findings?\s*$/im],
      missingPrompt: 'Extract any results or findings from this content:\n"{content}"\nIf none found, return "Results section to be added by author."',
      enhancePrompt: 'Enhance this results section for clarity and academic quality:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced results.',
    },
    {
      name: 'discussion',
      label: 'Discussion',
      required: false,
      description: 'Discussion of results',
      detectPatterns: [/^(?:\d\.?\s*)?discussion\s*$/im],
      missingPrompt: 'Based on the content and any results, draft a discussion section:\n"{content}"\nIf not enough context, return "Discussion section to be added by author."',
      enhancePrompt: 'Enhance this discussion section:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced discussion.',
    },
    {
      name: 'conclusion',
      label: 'Conclusion',
      required: true,
      description: 'Paper conclusion',
      detectPatterns: [/^(?:\d\.?\s*)?conclusions?\s*$/im],
      missingPrompt: 'Generate a conclusion for this academic paper:\n"{content}"\nTone: {tone}.\nReturn ONLY the conclusion.',
      enhancePrompt: 'Enhance this conclusion for impact and academic tone:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced conclusion.',
    },
    {
      name: 'references',
      label: 'References',
      required: false,
      description: 'Bibliography/references list',
      detectPatterns: [/^references?\s*$/im, /^bibliography\s*$/im, /^\[\d+\]/m],
      missingPrompt: '',
      enhancePrompt: 'Format these references in a consistent academic citation style:\n"{value}"\nReturn ONLY the formatted references list.',
    },
  ],
};

// ------- CV / RESUME TEMPLATE -------
export const cvTemplate: Template = {
  type: 'cv',
  label: 'CV / Resume',
  description: 'Professional resume with structured sections',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      required: true,
      description: 'Candidate full name',
      detectPatterns: [/^name\s*[:：]/im, /^[A-Z][a-z]+\s+[A-Z][a-z]+/m],
      missingPrompt: '',
      enhancePrompt: '',
    },
    {
      name: 'contact',
      label: 'Contact Information',
      required: true,
      description: 'Email, phone, LinkedIn, location',
      detectPatterns: [/^contact\s*[:：]/im, /^email\s*[:：]/im, /^phone\s*[:：]/im, /[\w.-]+@[\w.-]+/],
      missingPrompt: 'Add placeholder contact information: "Email: your.email@example.com | Phone: +XX-XXXXXXXXXX | LinkedIn: linkedin.com/in/yourprofile"',
      enhancePrompt: 'Format this contact information cleanly for a professional resume: "{value}"\nReturn ONLY the formatted contact line.',
    },
    {
      name: 'professional_summary',
      label: 'Professional Summary',
      required: true,
      description: 'Career objective or professional summary',
      detectPatterns: [/^(?:professional\s+)?summary\s*[:：]/im, /^objective\s*[:：]/im, /^profile\s*[:：]/im, /^about\s*[:：]/im],
      missingPrompt: 'Generate a professional summary (3-4 sentences) based on the following resume content:\n"{content}"\nTone: {tone}.\nReturn ONLY the summary.',
      enhancePrompt: 'Enhance this professional summary with stronger action words and impact:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced summary.',
    },
    {
      name: 'education',
      label: 'Education',
      required: true,
      description: 'Educational qualifications',
      detectPatterns: [/^education\s*[:：]?$/im, /^academic\s*[:：]/im, /^qualifications?\s*[:：]/im],
      missingPrompt: 'Add an education placeholder section: "Education\n• [Degree] - [University], [Year]"',
      enhancePrompt: 'Format this education section in reverse chronological order with consistent formatting:\n"{value}"\nReturn ONLY the formatted education section.',
    },
    {
      name: 'experience',
      label: 'Work Experience',
      required: true,
      description: 'Professional work experience',
      detectPatterns: [/^(?:work\s+)?experience\s*[:：]?$/im, /^employment\s*[:：]/im, /^work\s+history\s*[:：]/im],
      missingPrompt: 'Add a work experience placeholder: "Work Experience\n• [Job Title] - [Company], [Duration]\n  - [Key responsibility]"',
      enhancePrompt: 'Enhance these work experience bullet points with strong action verbs and quantified achievements:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced experience section.',
    },
    {
      name: 'skills',
      label: 'Skills',
      required: true,
      description: 'Technical and soft skills',
      detectPatterns: [/^skills?\s*[:：]?$/im, /^technical\s+skills?\s*[:：]/im, /^competenc/im],
      missingPrompt: 'Extract relevant skills from this resume content and categorize them:\n"{content}"\nReturn skills grouped as Technical Skills and Soft Skills.',
      enhancePrompt: 'Categorize and enhance this skills section (Technical, Soft Skills):\n"{value}"\nReturn ONLY the categorized skills.',
    },
    {
      name: 'certifications',
      label: 'Certifications',
      required: false,
      description: 'Professional certifications',
      detectPatterns: [/^certifications?\s*[:：]?$/im, /^licenses?\s*[:：]/im],
      missingPrompt: '',
      enhancePrompt: 'Format these certifications consistently:\n"{value}"\nReturn ONLY the formatted certifications.',
    },
    {
      name: 'projects',
      label: 'Projects',
      required: false,
      description: 'Notable projects',
      detectPatterns: [/^projects?\s*[:：]?$/im],
      missingPrompt: '',
      enhancePrompt: 'Enhance these project descriptions with impact and technologies used:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced projects section.',
    },
    {
      name: 'languages',
      label: 'Languages',
      required: false,
      description: 'Language proficiencies',
      detectPatterns: [/^languages?\s*[:：]?$/im],
      missingPrompt: '',
      enhancePrompt: 'Format these language proficiencies with proficiency levels:\n"{value}"\nReturn ONLY the formatted languages.',
    },
  ],
};

// ------- BIO DATA TEMPLATE -------
export const biodataTemplate: Template = {
  type: 'biodata',
  label: 'Bio Data',
  description: 'Personal bio data with comprehensive details',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      required: true,
      description: 'Full name',
      detectPatterns: [/^name\s*[:：]/im, /^full\s+name\s*[:：]/im],
      missingPrompt: '',
      enhancePrompt: '',
    },
    {
      name: 'dob',
      label: 'Date of Birth',
      required: false,
      description: 'Date of birth',
      detectPatterns: [/^(?:date\s+of\s+birth|dob|d\.o\.b)\s*[:：]/im, /^born\s*[:：]/im],
      missingPrompt: '',
      enhancePrompt: '',
    },
    {
      name: 'contact',
      label: 'Contact Information',
      required: true,
      description: 'Address, phone, email',
      detectPatterns: [/^contact\s*[:：]/im, /^address\s*[:：]/im, /^email\s*[:：]/im, /^phone\s*[:：]/im],
      missingPrompt: 'Add placeholder contact: "Address: [Your Address] | Phone: [Your Phone] | Email: [Your Email]"',
      enhancePrompt: 'Format this contact information neatly:\n"{value}"\nReturn ONLY the formatted contact info.',
    },
    {
      name: 'education',
      label: 'Education',
      required: true,
      description: 'Educational background',
      detectPatterns: [/^education\s*[:：]?$/im, /^qualification/im],
      missingPrompt: 'Add education placeholder: "Education\n• [Degree] - [Institution], [Year]"',
      enhancePrompt: 'Format this education section chronologically:\n"{value}"\nReturn ONLY the formatted education.',
    },
    {
      name: 'family',
      label: 'Family Details',
      required: false,
      description: 'Family information',
      detectPatterns: [/^family\s*[:：]/im, /^father/im, /^mother/im, /^parent/im],
      missingPrompt: '',
      enhancePrompt: 'Format these family details neatly:\n"{value}"\nReturn ONLY the formatted family details.',
    },
    {
      name: 'physical',
      label: 'Physical Attributes',
      required: false,
      description: 'Height, weight, etc.',
      detectPatterns: [/^physical\s*[:：]/im, /^height\s*[:：]/im, /^weight\s*[:：]/im],
      missingPrompt: '',
      enhancePrompt: 'Format these physical attributes neatly:\n"{value}"\nReturn ONLY the formatted attributes.',
    },
    {
      name: 'hobbies',
      label: 'Hobbies & Interests',
      required: false,
      description: 'Personal interests',
      detectPatterns: [/^hobbies?\s*[:：]?$/im, /^interests?\s*[:：]?$/im],
      missingPrompt: 'Suggest 4-5 common hobbies as placeholders based on the profile:\n"{content}"\nReturn ONLY a comma-separated list.',
      enhancePrompt: 'Refine and present these hobbies professionally:\n"{value}"\nReturn ONLY the enhanced hobbies list.',
    },
    {
      name: 'declaration',
      label: 'Declaration',
      required: false,
      description: 'Standard declaration statement',
      detectPatterns: [/^declaration\s*[:：]?$/im],
      missingPrompt: 'Generate a standard bio-data declaration statement.\nReturn ONLY: "I hereby declare that the above information is true to the best of my knowledge and belief."',
      enhancePrompt: '',
    },
  ],
};

// ------- REPORT TEMPLATE -------
export const reportTemplate: Template = {
  type: 'report',
  label: 'Report',
  description: 'Executive/thesis report with structured sections',
  fields: [
    {
      name: 'title',
      label: 'Title',
      required: true,
      description: 'Report title',
      detectPatterns: [/^#\s+/m, /^title\s*[:：]/im, /^report\s*[:：]/im],
      missingPrompt: 'Generate a professional report title based on:\n"{content}"\nReturn ONLY the title.',
      enhancePrompt: 'Refine this report title for professionalism:\n"{value}"\nTone: {tone}.\nReturn ONLY the improved title.',
    },
    {
      name: 'author',
      label: 'Author',
      required: false,
      description: 'Report author',
      detectPatterns: [/^(?:prepared\s+)?by\s*[:：]/im, /^author\s*[:：]/im],
      missingPrompt: '',
      enhancePrompt: 'Format this author line professionally: "{value}"\nReturn ONLY the formatted author.',
    },
    {
      name: 'date',
      label: 'Date',
      required: false,
      description: 'Report date',
      detectPatterns: [/^date\s*[:：]/im, /^\d{4}[-/]\d{2}[-/]\d{2}/m],
      missingPrompt: '',
      enhancePrompt: '',
    },
    {
      name: 'executive_summary',
      label: 'Executive Summary',
      required: true,
      description: 'High-level overview of the report',
      detectPatterns: [/^executive\s+summary\s*[:：]?$/im, /^overview\s*[:：]?$/im, /^summary\s*[:：]?$/im],
      missingPrompt: 'Generate an executive summary (150-200 words) for this report:\n"{content}"\nTone: {tone}.\nReturn ONLY the executive summary.',
      enhancePrompt: 'Refine this executive summary for impact and clarity (150-200 words):\n"{value}"\nTone: {tone}.\nReturn ONLY the refined summary.',
    },
    {
      name: 'introduction',
      label: 'Introduction',
      required: true,
      description: 'Report introduction',
      detectPatterns: [/^(?:\d\.?\s*)?introduction\s*[:：]?$/im],
      missingPrompt: 'Generate an introduction for this report:\n"{content}"\nTone: {tone}.\nReturn ONLY the introduction.',
      enhancePrompt: 'Enhance this report introduction:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced introduction.',
    },
    {
      name: 'body',
      label: 'Body Sections',
      required: true,
      description: 'Main content sections',
      detectPatterns: [],
      missingPrompt: '',
      enhancePrompt: 'Restructure this report body with proper headings, subheadings, and logical flow:\n"{value}"\nTone: {tone}.\nReturn ONLY the restructured body.',
    },
    {
      name: 'conclusion',
      label: 'Conclusion',
      required: true,
      description: 'Report conclusion',
      detectPatterns: [/^(?:\d\.?\s*)?conclusions?\s*[:：]?$/im],
      missingPrompt: 'Generate a conclusion for this report:\n"{content}"\nTone: {tone}.\nReturn ONLY the conclusion.',
      enhancePrompt: 'Enhance this report conclusion:\n"{value}"\nTone: {tone}.\nReturn ONLY the enhanced conclusion.',
    },
    {
      name: 'recommendations',
      label: 'Recommendations',
      required: false,
      description: 'Action recommendations',
      detectPatterns: [/^recommendations?\s*[:：]?$/im, /^suggested\s+actions?\s*[:：]/im],
      missingPrompt: 'Based on this report content, suggest 3-5 actionable recommendations:\n"{content}"\nTone: {tone}.\nReturn ONLY the numbered recommendations.',
      enhancePrompt: 'Refine these recommendations for actionability:\n"{value}"\nTone: {tone}.\nReturn ONLY the refined recommendations.',
    },
    {
      name: 'appendix',
      label: 'Appendix',
      required: false,
      description: 'Supplementary materials',
      detectPatterns: [/^appendi(?:x|ces)\s*[:：]?$/im],
      missingPrompt: '',
      enhancePrompt: 'Format this appendix with proper labeling:\n"{value}"\nReturn ONLY the formatted appendix.',
    },
  ],
};

// Template registry
export const templates: Record<string, Template> = {
  blogpost: blogpostTemplate,
  journal: journalTemplate,
  cv: cvTemplate,
  biodata: biodataTemplate,
  report: reportTemplate,
};

export function getTemplate(type: string): Template | undefined {
  return templates[type];
}
