import React, { useState } from 'react';
import ArticleInput from './components/ArticleInput';
import ArticleDisplay from './components/ArticleDisplay';
import WordBook from './components/WordBook';
import { AppState, ArticleAnalysis } from './types';
import { analyzeArticle } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    try {
      const result = await analyzeArticle(text);
      setAnalysis(result);
      setAppState(AppState.READING);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to analyze the article. Please try again or check your API key.");
      setAppState(AppState.INPUT);
    }
  };

  const handleBack = () => {
    setAppState(AppState.INPUT);
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleOpenWordBook = () => {
    setAppState(AppState.WORDBOOK);
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      {/* Global Error Toast */}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-bounce">
          {errorMsg}
        </div>
      )}

      {appState === AppState.INPUT || appState === AppState.ANALYZING ? (
        <ArticleInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={appState === AppState.ANALYZING} 
          onOpenWordBook={handleOpenWordBook}
        />
      ) : appState === AppState.WORDBOOK ? (
        <WordBook onBack={handleBack} />
      ) : (
        analysis && <ArticleDisplay analysis={analysis} onBack={handleBack} />
      )}
    </div>
  );
};

export default App;