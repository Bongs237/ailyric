"use client"

import Checkbox from '../components/Checkbox.js';
import { useState, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@uiw/react-codemirror';
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';
import { Geist } from 'next/font/google';
import { abcdef } from '@uiw/codemirror-theme-abcdef';

const geist = Geist({subsets: ['latin']});
const DEBOUNCE_TIME = 2000;

export default function Home() {
  const [checked, setChecked] = useState(true);
  function onCheckboxChange() {
    setChecked(!checked);
  }

  const [content, setContent] = useState("");
  const timeoutRef = useRef(null);

  const fetchSuggestion = async (state) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (state.doc.length === 0) {
      return "";
    }

    const fullText = state.doc.text.join("\n");

    // The codemirror inline suggestion extension makes u return a promise which then resolves to the autocomplete suggestion
    // And the "debounce time"/"delay" thing that they put in still tracks every single keystroke so I had to manually add that in
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/autocomplete?text=${encodeURIComponent(fullText)}`);
          const json = await res.json();
          const numChoices = json.completions.length;
          if (numChoices > 0) {
            resolve(json.completions[0]);
          } else {
            resolve("");
          }
        } catch (error) {
          console.error('Error fetching suggestion:', error);
          resolve("");
        }
      }, DEBOUNCE_TIME);
    });
  };

  const onTextboxChange = useCallback((val) => {
    setContent(val);
  }, []);

  const FontFamilyTheme = EditorView.theme({
    ".cm-content": {
      fontFamily: `${geist.style.fontFamily} !important`
    }
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-500 flex items-center justify-center relative overflow-hidden">
      <div className="w-full h-screen mx-auto p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🎤</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
            AI Lyric Autocompleter
          </h1>
        </div>
        <Checkbox checked={checked} changeFunc={onCheckboxChange} />
        <div className="flex-grow flex flex-col min-h-0">
          <CodeMirror 
            value={content}
            onChange={onTextboxChange}
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
            }}
            theme={abcdef}
            extensions={[
              FontFamilyTheme,
              inlineSuggestion({
                fetchFn: fetchSuggestion,
                delay: 0,
              })
            ]}
          />
        </div>
      </div>
    </div>
  );
}
