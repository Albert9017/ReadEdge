import React, { useState } from 'react';

interface ArticleInputProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
  onOpenWordBook: () => void;
}

type InputMode = 'text' | 'link' | 'file';

const ArticleInput: React.FC<ArticleInputProps> = ({ onAnalyze, isAnalyzing, onOpenWordBook }) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'link') {
       // In a real app, this would need a backend proxy.
       // We can simulate or pass the URL to Gemini if it's capable (Gemini 1.5 Pro can read URLs sometimes),
       // but here we will just pass it to the analyzer which might fail to fetch.
       // For better UX, we'll try a basic fetch or warn.
       if (!url) return;
       // Simply pass the URL text for now, or fetch if possible.
       // Since we are client side only, we can't easily fetch generic URLs.
       // We will pass the URL to the prompt and ask Gemini to "Analyze the content at this URL"
       // Note: This relies on the model's ability to browse or pre-training.
       onAnalyze(`Please analyze the content of this article: ${url}`);
    } else {
       if (text.trim()) {
         onAnalyze(text);
       }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleSample = () => {
    const sample = `Artificial Intelligence (AI) is transforming the world at an unprecedented pace. From self-driving cars to intelligent virtual assistants, AI is embedding itself into the fabric of our daily lives. While these advancements promise increased efficiency and convenience, they also raise important ethical questions. 

    One of the most significant concerns is the potential displacement of jobs. As machines become more capable of performing complex tasks, many worry that human workers will become obsolete. However, proponents argue that AI will create new opportunities and industries that we cannot yet imagine.

    Furthermore, the issue of bias in AI algorithms is a critical challenge. Since these systems learn from historical data, they can inadvertently perpetuate existing prejudices. It is crucial for developers to ensure fairness and transparency in AI development to build a more equitable future.`;
    setText(sample);
  };

  const isSubmitDisabled = () => {
      if (isAnalyzing) return true;
      if (mode === 'text' || mode === 'file') return !text.trim();
      if (mode === 'link') return !url.trim();
      return true;
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-4 md:p-8 relative">
      
      {/* Top Right: Word Book */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={onOpenWordBook}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-gray-600 hover:text-accent hover:border-accent transition-all"
        >
           <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
           </svg>
           <span className="font-medium text-sm">My Word Book</span>
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-xl mb-4 text-accent">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif">ReadEdge</h1>
          <p className="text-gray-500">Transform each classic piece into a lasting asset for your linguistic competence.</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
            {(['text', 'link', 'file'] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize
                    ${mode === m ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {m === 'text' ? 'Paste Text' : m === 'link' ? 'Article Link' : 'Upload File'}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            
            {mode === 'text' && (
                <>
                <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your English text here..."
                className="w-full h-64 p-4 text-lg text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all resize-none font-serif leading-relaxed placeholder-gray-400"
                disabled={isAnalyzing}
                />
                {text.length === 0 && (
                <button 
                type="button"
                onClick={handleSample}
                className="absolute bottom-4 right-4 text-sm text-accent hover:underline bg-white/80 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 shadow-sm"
                >
                Try Sample Text
                </button>
                )}
                </>
            )}

            {mode === 'link' && (
                <div className="h-64 flex flex-col justify-center space-y-4">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full p-4 text-lg text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all placeholder-gray-400"
                    />
                    <p className="text-sm text-gray-400 text-center px-4">
                        Note: Some websites may block access. Best results with direct article links.
                    </p>
                </div>
            )}

            {mode === 'file' && (
                <div className="h-64 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center relative">
                    {text ? (
                        <div className="text-center p-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-gray-800 font-medium">File Loaded</p>
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{text.substring(0, 50)}...</p>
                            <button 
                                type="button" 
                                onClick={() => setText('')}
                                className="mt-4 text-sm text-red-500 hover:text-red-600 underline"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <>
                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 font-medium">Click to upload .txt or .md</p>
                            <input 
                                type="file" 
                                accept=".txt,.md"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </>
                    )}
                </div>
            )}
            
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled()}
            className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99]
              ${isSubmitDisabled()
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-accent hover:bg-blue-600 shadow-lg shadow-blue-500/30'
              }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing Content...</span>
              </>
            ) : (
              <>
                <span>Start Intensive Reading</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-400 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">Smart Segmentation</span>
            <span>Bilingual pairing</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">Vocab Extraction</span>
            <span>Contextual definitions</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-gray-600">Audio & Save</span>
            <span>Listen & build vocab</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleInput;