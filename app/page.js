"use client"

import Checkbox from '../components/Checkbox.js';
import { useState, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@uiw/react-codemirror';
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';
import { Geist } from 'next/font/google';
import { abcdef } from '@uiw/codemirror-theme-abcdef';

const geist = Geist({subsets: ['latin']});
const DEBOUNCE_TIME = 1000;

export default function Home() {
  const [checked, setChecked] = useState(true);
  function onCheckboxChange() {
    setChecked(!checked);
  }

  const [content, setContent] = useState("");
  const timeoutRef = useRef(null);
  const suggestionCache = useRef({});

  const fetchSuggestion = async (state) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (state.doc.length === 0) {
      return "";
    }

    const allLines = state.doc.text;
    const fullText = allLines.join("\n");
    const cursorPos = state.selection.main.head;

    // if last line empty, dont give suggestions
    if (allLines[allLines.length - 1].trim() === "") {
      return "";
    }

    // Find the line and column of the cursor
    let charCount = 0;
    let cursorLine = 0;
    let cursorCol = 0;
    for (let i = 0; i < allLines.length; i++) {
      if (charCount + allLines[i].length >= cursorPos) {
        cursorLine = i;
        cursorCol = cursorPos - charCount;
        break;
      }
      charCount += allLines[i].length + 1; // +1 for the newline
    }

    // Only use lines up to and including the cursor's line
    const linesToCursor = allLines.slice(0, cursorLine + 1);
    // Insert {CURSOR} at the correct position in the last line
    linesToCursor[linesToCursor.length - 1] =
      linesToCursor[linesToCursor.length - 1].slice(0, cursorCol) +
      '{CURSOR}' +
      linesToCursor[linesToCursor.length - 1].slice(cursorCol);
    const textWithCursor = linesToCursor.join("\n");

    if (suggestionCache.current[fullText]) {
      return suggestionCache.current[fullText];
    }

    // Only set to true when actually starting a fetch
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/autocomplete?text=${encodeURIComponent(textWithCursor)}`);
          const json = await res.json();
          const numChoices = json.completions.length;
          if (numChoices > 0) {
            // Use first one for now lol
            let choice = json.completions[0];
            choice = choice.trim();

            if (json.prependSpace) {
              choice = " " + choice;
            }
            
            // if it turns out the ai is dumb and tries to add two spaces
            // as in, the character before the cursor is a space, and the suggestion starts with a space, remove it
            let charBeforeCursor = '';
            if (cursorCol > 0) {
              charBeforeCursor = allLines[cursorLine][cursorCol - 1];
            } else if (cursorLine > 0) {
              // If at the start of a line, check the last char of the previous line
              charBeforeCursor = allLines[cursorLine - 1].slice(-1);
            }
            if (charBeforeCursor === " " && choice.startsWith(" ")) {
              choice = choice.slice(1);
            }

            suggestionCache.current[fullText] = choice;
            resolve(choice);
          } else {
            suggestionCache.current[fullText] = "";
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
      <div className="w-full h-screen mx-auto flex flex-col">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">🎤</span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
              AI Lyric Autocompleter
            </h1>
          </div>
          <Checkbox checked={checked} changeFunc={onCheckboxChange} />
        </div>

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
            placeholder={"Write your banger here..."}
          />
        </div>
      </div>
    </div>
  );
}
