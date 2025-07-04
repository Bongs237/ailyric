"use client"

import Checkbox from '../components/Checkbox.js';
import AutocompleteTextbox from 'react-ghost-text/dist/AutocompleteTextbox.js';
import { useState } from 'react';

export default function Home() {
  const [checked, setChecked] = useState(true);

  function handleChange() {
    setChecked(!checked);
  }

  const [onSuggestion, setOnSuggestion] = useState(false); // if you're on a suggestion or not

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const [content, setContent] = useState("");

  const getSuggestion = async (precedingText) => {
    if (precedingText.trim() === "") {
      return;
    }

    try {
      const response = await fetch(`/api/autocomplete?text=${encodeURIComponent(precedingText)}`);
      const json = await response.json();
      const numChoices = json.completions.length;
      if (numChoices > 0) {
        setSuggestions(json.completions);
        setSuggestionIndex(0);
        return json.completions[0];
      }
    } catch (error) {
      console.error(error);
    }
  };

  const suggestionShown = () => {
    setOnSuggestion(true);
  };

  const suggestionConsidered = () => {
    setOnSuggestion(false);
  };

  const handleKeydown = (e) => {
    if (onSuggestion) {
      const suggestionEle = document.getElementsByClassName("ai-suggestion")[0]; // smh i dont have access to the actual element so i have to do this hack

      if (e.code == "ArrowDown") {
        e.preventDefault();

        const newSuggestionIndex = suggestionIndex + 1;
        const newSuggestion = suggestions[newSuggestionIndex % suggestions.length];

        if (newSuggestion !== undefined) {
          suggestionEle.innerHTML = newSuggestion;
          setSuggestionIndex(newSuggestionIndex);
        }
      } else if (e.code == "ArrowUp") {
        e.preventDefault();

        const newSuggestionIndex = suggestionIndex - 1;
        const newSuggestion = suggestions[newSuggestionIndex % suggestions.length];

        if (newSuggestion !== undefined) {
          suggestionEle.innerHTML = newSuggestion;
          setSuggestionIndex(newSuggestionIndex);
        }
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    let text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-500 flex items-center justify-center relative overflow-hidden">
      <div className="w-full h-screen mx-auto p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🎤</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
            AI Lyric Autocompleter
          </h1>
        </div>
        <Checkbox checked={checked} changeFunc={handleChange} />
        <div className="flex-grow flex flex-col min-h-0" onKeyDown={handleKeydown}>
          <AutocompleteTextbox
            value="I'm cool"
            getSuggestion={getSuggestion}
            onContentChange={content => setContent(content)}
            disableAutocomplete={!checked}
            debounceTime={1000}
            className="w-full h-full text-xl font-medium bg-white/80 rounded-xl px-6 py-4 shadow-lg border-2 border-transparent focus:border-pink-400 focus:ring-2 focus:ring-pink-200 transition duration-200 outline-none placeholder-gray-400 dark:bg-gray-900/80 dark:text-white dark:placeholder-gray-500 backdrop-blur"
            onSuggestionShown={suggestionShown}
            onSuggestionAccepted={suggestionConsidered}
            onSuggestionRejected={suggestionConsidered}
            suggestionClassName="ai-suggestion"
            onPaste={handlePaste}
          />
        </div>
      </div>
    </div>
  );
}
