export interface VocabItem {
  word: string;
  phonetic?: string;
  definition: string;
  importance: 'high' | 'medium' | 'low';
}

export interface ArticleSegment {
  id: string;
  originalText: string;
  translatedText: string;
  vocabulary: VocabItem[];
}

export interface ArticleAnalysis {
  title: string;
  segments: ArticleSegment[];
}

export interface WordDetail {
  word: string;
  phonetic: string;
  definition: string;
  partOfSpeech: string;
  exampleSentence: string;
  usageTips: string;
}

export interface SavedWord extends WordDetail {
  addedAt: number;
}

export enum AppState {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  READING = 'READING',
  WORDBOOK = 'WORDBOOK',
  ERROR = 'ERROR'
}