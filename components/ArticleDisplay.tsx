import React, { useState } from 'react';
import { ArticleAnalysis, ArticleSegment, VocabItem } from '../types';
import ClickableText from './ClickableText';
import WordModal from './WordModal';

interface ArticleDisplayProps {
  analysis: ArticleAnalysis;
  onBack: () => void;
}

const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ analysis, onBack }) => {
  const [selectedWord, setSelectedWord] = useState<{ word: string; context: string } | null>(null);

  const handleWordClick = (word: string, context: string) => {
    setSelectedWord({ word, context });
  };

  const closeWordModal = () => {
    setSelectedWord(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800 truncate max-w-xs md:max-w-md">
              {analysis.title}
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            {analysis.segments.length} Segments
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {analysis.segments.map((segment) => (
          <SegmentRow 
            key={segment.id} 
            segment={segment} 
            onWordClick={handleWordClick} 
          />
        ))}
      </div>

      {selectedWord && (
        <WordModal 
          word={selectedWord.word} 
          contextSentence={selectedWord.context}
          onClose={closeWordModal}
        />
      )}
    </div>
  );
};

const SegmentRow: React.FC<{ 
  segment: ArticleSegment; 
  onWordClick: (word: string, context: string) => void;
}> = ({ segment, onWordClick }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playSegment = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(segment.originalText);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for study
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
      {/* Main Content Area (Text + Translation) */}
      <div className="flex-1 p-6 md:p-8 space-y-6">
        {/* Original Text with Audio Control */}
        <div className="relative">
          <div className="flex items-start gap-4">
             <button
               onClick={playSegment}
               className={`flex-shrink-0 mt-1 p-2 rounded-full transition-all ${isPlaying ? 'bg-accent text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:text-accent hover:bg-accent/10'}`}
               aria-label={isPlaying ? "Stop audio" : "Play audio"}
             >
               {isPlaying ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
               ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
               )}
             </button>
             <div className="flex-1 text-gray-800">
                <ClickableText text={segment.originalText} onWordClick={onWordClick} />
             </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="h-px bg-gray-100 w-full" />
        
        {/* Translation */}
        <div className="text-gray-600 leading-relaxed font-sans text-base bg-gray-50 p-4 rounded-lg ml-11 md:ml-0">
          {segment.translatedText}
        </div>
      </div>

      {/* Sidebar (Vocabulary) */}
      <div className="md:w-72 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-6">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Key Vocabulary
        </h4>
        
        <div className="space-y-4">
          {segment.vocabulary.map((vocab, idx) => (
            <div 
              key={idx} 
              className="group cursor-pointer hover:bg-white hover:shadow-sm p-2 rounded-lg transition-all"
              onClick={() => onWordClick(vocab.word, segment.originalText)}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-bold text-gray-800 text-sm">{vocab.word}</span>
                {vocab.phonetic && (
                  <span className="text-xs text-gray-400 font-mono">/{vocab.phonetic}/</span>
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{vocab.definition}</p>
            </div>
          ))}
          {segment.vocabulary.length === 0 && (
            <p className="text-xs text-gray-400 italic">No difficult words identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDisplay;