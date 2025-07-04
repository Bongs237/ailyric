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

  const suggestionShown = (data) => {
    setOnSuggestion(true);
  };

  const suggestionConsidered = (data) => {
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
    <>
      <div
        className="d-flex flex-column p-3"
        style={{ height: "100vh" }}
        onKeyDown={handleKeydown}
      >
        <Checkbox checked={checked} changeFunc={handleChange} />
        <AutocompleteTextbox
          value={"I'm cool"}
          getSuggestion={getSuggestion}
          onContentChange={content => setContent(content)}
          disableAutocomplete={!checked}
          debounceTime={1000}
          className="
            p-4
            text-lg
            bg-white
            rounded-2xl
            shadow-xl
            border-2
            border-transparent
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-200
            transition
            duration-200
            outline-none
            placeholder-gray-400
            dark:bg-gray-900
            dark:text-white
            dark:placeholder-gray-500
          "
          style={{ height: "100%", overflow: "auto" }}
          onSuggestionShown={suggestionShown}
          onSuggestionAccepted={suggestionConsidered}
          onSuggestionRejected={suggestionConsidered}
          suggestionClassName={"ai-suggestion"}
          onPaste={handlePaste}
        />
      </div>
    </>
  );
}
