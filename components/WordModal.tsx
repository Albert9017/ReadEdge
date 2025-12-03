import React, { useEffect, useState } from 'react';
import { WordDetail, SavedWord } from '../types';
import { lookupWordDetail } from '../services/geminiService';

interface WordModalProps {
  word: string;
  contextSentence?: string;
  onClose: () => void;
}

const WordModal: React.FC<WordModalProps> = ({ word, contextSentence, onClose }) => {
  const [data, setData] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Check if word is already saved in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wordBook');
      if (saved) {
        const list: SavedWord[] = JSON.parse(saved);
        const cleanWord = word.replace(/[^a-zA-Z\-'’]/g, "").toLowerCase();
        if (list.some(w => w.word.toLowerCase() === cleanWord)) {
          setIsSaved(true);
        }
      }
    } catch (e) {
      console.error("Error reading storage", e);
    }
  }, [word]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const cleanWord = word.replace(/[^a-zA-Z\-'’]/g, "");
        if (!cleanWord) {
            setError("Invalid word selection");
            setLoading(false);
            return;
        }
        
        const result = await lookupWordDetail(cleanWord, contextSentence);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load word details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [word, contextSentence]);

  const playAudio = () => {
    if (!data) return;
    
    // cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(data.word);
    utterance.lang = 'en-US';
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en-US') && !v.name.includes('Google') ) || 
                         voices.find(v => v.lang.includes('en-US'));
    
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const toggleSave = () => {
    if (!data) return;

    try {
      const saved = localStorage.getItem('wordBook');
      let list: SavedWord[] = saved ? JSON.parse(saved) : [];
      
      if (isSaved) {
        // Remove
        list = list.filter(w => w.word.toLowerCase() !== data.word.toLowerCase());
        setIsSaved(false);
      } else {
        // Add
        const newWord: SavedWord = { ...data, addedAt: Date.now() };
        list.push(newWord);
        setIsSaved(true);
      }
      localStorage.setItem('wordBook', JSON.stringify(list));
    } catch (e) {
      console.error("Error saving word", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800 border-b-2 border-accent pb-1">
              {word}
            </h3>
            <div className="flex items-center space-x-2">
              {/* Save Button */}
              {!loading && !error && (
                <button 
                  onClick={toggleSave}
                  className={`p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-gray-50'}`}
                  title={isSaved ? "Remove from Word Book" : "Add to Word Book"}
                >
                  <svg className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              {/* Close Button */}
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">AI is analyzing "{word}"...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-serif text-gray-600">/{data.phonetic}/</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded uppercase">{data.partOfSpeech}</span>
                <button 
                  onClick={playAudio}
                  className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  aria-label="Play pronunciation"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Definition</h4>
                <p className="text-lg text-gray-800">{data.definition}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Example</h4>
                <p className="text-gray-700 italic">"{data.exampleSentence}"</p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">Recommendation</h4>
                <p className="text-gray-700 text-sm">{data.usageTips}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordModal;