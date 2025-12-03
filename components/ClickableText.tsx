import React from 'react';

interface ClickableTextProps {
  text: string;
  onWordClick: (word: string, context: string) => void;
}

const ClickableText: React.FC<ClickableTextProps> = ({ text, onWordClick }) => {
  // Regex to split by whitespace but keep delimiters like punctuation attached or separate
  // This is a naive split, we want to make words clickable but keep punctuation visual.
  // Strategy: Split by spaces, then map.
  
  const words = text.split(/(\s+)/);

  const handleClick = (clickedPart: string) => {
    // Basic check to see if it contains letters
    if (/[a-zA-Z]/.test(clickedPart)) {
      // Strip punctuation for the lookup key, but keep it for display
      const cleanWord = clickedPart.trim();
      onWordClick(cleanWord, text);
    }
  };

  return (
    <p className="font-serif text-lg leading-relaxed text-ink">
      {words.map((part, index) => {
        // If it's just whitespace, render it
        if (/^\s+$/.test(part)) {
          return <span key={index}>{part}</span>;
        }

        // Split word from punctuation if attached?
        // Simpler approach: Make the whole token clickable, let the Modal sanitize it.
        // But for visual feedback (hover), strictly wrapping the word is better.
        // Let's rely on the user clicking the token.
        
        return (
          <span
            key={index}
            onClick={() => handleClick(part)}
            className="cursor-pointer hover:bg-accent/20 hover:text-accent transition-colors rounded px-0.5 -mx-0.5"
          >
            {part}
          </span>
        );
      })}
    </p>
  );
};

export default ClickableText;