"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import JsonEditor from "@/components/JsonEditor";
import ToonOutput from "@/components/ToonOutput";
import ThemeToggle from "@/components/ThemeToggle";
import { convertToToon } from "@/lib/convertToToon";

// Sample JSON data
const SAMPLE_JSON = `{
  "reviews": [
    {
      "id": 101,
      "customer": "Alex Rivera",
      "rating": 5,
      "comment": "Excellent service!",
      "verified": true,
      "date": "2024-01-15"
    },
    {
      "id": 102,
      "customer": "Sarah Chen",
      "rating": 4,
      "comment": "Very good experience",
      "verified": true,
      "date": "2024-01-16"
    }
  ],
  "metadata": {
    "total": 2,
    "averageRating": 4.5
  }
}`;

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [toonOutput, setToonOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsMac(typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleLoadSample = useCallback(() => {
    setJsonInput(SAMPLE_JSON);
  }, []);

  const handleClear = useCallback(() => {
    setJsonInput("");
    setToonOutput("");
    setError(null);
    setIsValid(true);
  }, []);

  const handleFormatJson = useCallback(() => {
    setJsonInput((current) => {
      if (!current.trim()) return current;
      try {
        const parsed = JSON.parse(current);
        return JSON.stringify(parsed, null, 2);
      } catch (err) {
        return current;
      }
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close shortcuts modal
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
        return;
      }
      
      // Don't trigger shortcuts if modal is open or user is typing in an input
      if (showShortcuts || (e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd/Ctrl + K to clear
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !e.shiftKey) {
        e.preventDefault();
        handleClear();
      }
      // Cmd/Ctrl + Shift + F to format
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        handleFormatJson();
      }
      // Cmd/Ctrl + Shift + E to load example
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        handleLoadSample();
      }
      // Cmd/Ctrl + ? to show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear, handleFormatJson, handleLoadSample, showShortcuts]);

  const processJson = useCallback((input: string) => {
    if (!input.trim()) {
      setToonOutput("");
      setError(null);
      setIsValid(true);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    
    // Use requestAnimationFrame to ensure smooth UI updates
    requestAnimationFrame(() => {
      const { result, error: conversionError } = convertToToon(input);
      setToonOutput(result);
      setError(conversionError);
      setIsValid(conversionError === null);
      setIsProcessing(false);
    });
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce for very large inputs (over 10KB) to prevent lag
    const inputSize = new Blob([jsonInput]).size;
    const debounceDelay = inputSize > 10000 ? 150 : 0;

    debounceTimerRef.current = setTimeout(() => {
      processJson(jsonInput);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [jsonInput, processJson]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-gradient-to-r from-white/98 via-white/95 to-white/98 dark:from-gray-900/98 dark:via-gray-800/95 dark:to-gray-900/98 border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm shadow-gray-900/5 dark:shadow-gray-950/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 shadow-lg shadow-blue-500/30 dark:shadow-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 group">
                <span className="text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">J</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent tracking-tight transition-colors duration-300">
                  JSON ➜ TOON Converter
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-600/90 dark:text-gray-400/90 font-medium transition-colors duration-300">
                  Paste JSON — get TOON format instantly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-700/50 transition-all duration-300 hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 group">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Real-time</span>
              </div>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-gray-500/20 shadow-md group active:scale-95"
                aria-label="Show keyboard shortcuts"
                title="Keyboard shortcuts (⌘? / Ctrl?)"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 transition-all duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2v2m6-2v2M9 18v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/60 dark:border-gray-700/60 p-6 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">Clear input</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                  {isMac ? '⌘' : 'Ctrl'}K
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">Format JSON</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                  {isMac ? '⌘' : 'Ctrl'}⇧F
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">Load example</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                  {isMac ? '⌘' : 'Ctrl'}⇧E
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show shortcuts</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                  {isMac ? '⌘' : 'Ctrl'}?
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[calc(100vh-160px)] sm:min-h-[calc(100vh-180px)] lg:min-h-[calc(100vh-200px)]">
          <div className="flex flex-col min-h-[400px] lg:min-h-0">
            <JsonEditor 
              value={jsonInput} 
              onChange={setJsonInput} 
              isValid={isValid}
              isProcessing={isProcessing}
              onLoadSample={handleLoadSample}
              onClear={handleClear}
              onFormat={handleFormatJson}
            />
          </div>
          <div className="flex flex-col min-h-[400px] lg:min-h-0">
            <ToonOutput 
              toonText={toonOutput} 
              error={error}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

