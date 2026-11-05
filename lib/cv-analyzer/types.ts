export interface ExtractedCV {
  text: string;
  wordCount: number;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
}

export interface AnalysisRequest {
  text: string;
  sector: string;
}

export interface AnalysisResult {
  score: number; // 0-100
  level: 'excellent' | 'bon' | 'moyen' | 'faible';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordsSuggestion: string[];
  sector: string;
  scoresByCriteria?: {
    ats: number;
    structure: number;
    content: number;
    sector: number;
    differentiation: number;
  };
  summary?: string;
}

export interface ApiError {
  error: string;
  message: string;
}
