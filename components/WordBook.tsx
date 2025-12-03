import React, { useEffect, useState } from 'react';
import { SavedWord } from '../types';
import WordModal from './WordModal';

interface WordBookProps {
  onBack: () => void;
}

const WordBook: React.FC<WordBookProps> = ({ onBack }) => {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<SavedWord | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wordBook');
      if (saved) {
        // Sort by addedAt desc
        const list: SavedWord[] = JSON.parse(saved);
        setWords(list.sort((a, b) => b.addedAt - a.addedAt));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleRemove = (e: React.MouseEvent, wordToRemove: string) => {
    e.stopPropagation();
    const newList = words.filter(w => w.word !== wordToRemove);
    setWords(newList);
    localStorage.setItem('wordBook', JSON.stringify(newList));
  };

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
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
            <h1 className="text-lg font-bold text-gray-800">
              My Word Book
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            {words.length} Words
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>Your word book is empty.</p>
            <p className="text-sm">Save words while reading articles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {words.map((word) => (
              <div 
                key={word.word} 
                onClick={() => setSelectedWord(word)}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-accent/30 cursor-pointer transition-all group relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">{word.word}</h3>
                  <button 
                    onClick={(e) => handleRemove(e, word.word)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center space-x-2 mb-2 text-sm text-gray-500">
                   <span>/{word.phonetic}/</span>
                   <span className="bg-gray-100 px-1.5 rounded text-xs">{word.partOfSpeech}</span>
                </div>
                <p className="text-gray-600 line-clamp-2 text-sm">{word.definition}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedWord && (
        <WordModal 
          word={selectedWord.word} 
          // We pass the example sentence as context for the modal to display consistent data,
          // though the modal will re-fetch details, it ensures consistency if we wanted to pass full object.
          // For now, we rely on the modal fetching fresh data or we could update Modal to accept pre-loaded data.
          // To keep it simple, we let it fetch again or we can just pass context.
          contextSentence={selectedWord.exampleSentence}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
};

export default WordBook;