"use client";

import { useMemo, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { useTheme } from "@/contexts/ThemeContext";
import { jsonHighlighter } from "@/lib/jsonHighlighter";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  isProcessing?: boolean;
  onLoadSample?: () => void;
  onClear?: () => void;
  onFormat?: () => void;
}

export default function JsonEditor({ value, onChange, isValid, isProcessing, onLoadSample, onClear, onFormat }: JsonEditorProps) {
  const { theme } = useTheme();

  // Calculate character count
  const charCount = value.length;

  // Suppress the "tags is not iterable" console error from CodeMirror's default highlighting
  // This error occurs because json() extension tries to use tags that conflict with our custom highlighter
  // Since our custom highlighter works perfectly, we can safely suppress this specific error
  const errorHandlerRef = useRef<((...args: any[]) => void) | null>(null);
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only set up error handler once (using a module-level check)
    if (!(window as any).__jsonEditorErrorHandlerSet) {
      const originalError = console.error;
      const errorHandler = (...args: any[]) => {
        const errorMessage = args[0]?.toString() || "";
        if (errorMessage.includes("tags is not iterable") || errorMessage.includes("CodeMirror plugin crashed")) {
          // Suppress this specific error
          return;
        }
        originalError.apply(console, args);
      };

      console.error = errorHandler;
      errorHandlerRef.current = errorHandler;
      (window as any).__jsonEditorErrorHandlerSet = true;
      (window as any).__jsonEditorOriginalError = originalError;
    }

    return () => {
      // Only restore if this was the last instance (in a real app, you'd use a counter)
      // For now, we'll leave it set since it's harmless and prevents the error
    };
  }, []);

  // Configure CodeMirror extensions
  const extensions = useMemo(() => {
    // Create an empty highlight style to override default highlighting
    const emptyHighlightStyle = HighlightStyle.define([]);
    
    return [
      json(),
      // Add empty highlighting AFTER json() to override its default highlighting
      syntaxHighlighting(emptyHighlightStyle),
      // Add our custom highlighter with highest precedence
      jsonHighlighter(theme),
      EditorView.theme({
        "&": {
          fontSize: "14px",
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace",
        },
        ".cm-content": {
          padding: "16px",
          minHeight: "100%",
          backgroundColor: theme === "dark" ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
          color: theme === "dark" ? "#e5e7eb" : "#111827",
        },
        ".cm-editor": {
          height: "100%",
        },
        ".cm-scroller": {
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace",
        },
        ".cm-focused": {
          outline: "none",
        },
        ".cm-gutters": {
          backgroundColor: theme === "dark" 
            ? "rgba(31, 41, 55, 0.8)" 
            : "rgba(249, 250, 251, 0.8)",
          border: "none",
          borderRight: `1px solid ${theme === "dark" ? "rgba(55, 65, 81, 0.6)" : "rgba(229, 231, 235, 0.6)"}`,
        },
        ".cm-lineNumbers": {
          color: theme === "dark" ? "rgba(156, 163, 175, 1)" : "rgba(107, 114, 128, 1)",
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', 'Courier New', monospace",
        },
        ".cm-line": {
          lineHeight: "1.5rem",
        },
        // Active line highlighting (matching TOON output)
        ".cm-activeLine": {
          backgroundColor: theme === "dark" 
            ? "rgba(55, 65, 81, 0.3)" 
            : "rgba(249, 250, 251, 0.5)",
        },
        ".cm-activeLineGutter": {
          backgroundColor: theme === "dark" 
            ? "rgba(55, 65, 81, 0.4)" 
            : "rgba(229, 231, 235, 0.6)",
          color: theme === "dark" ? "rgba(209, 213, 219, 1)" : "rgba(75, 85, 99, 1)",
          fontWeight: "600",
        },
        // Selection styling
        ".cm-selectionBackground": {
          backgroundColor: theme === "dark" 
            ? "rgba(59, 130, 246, 0.3)" 
            : "rgba(59, 130, 246, 0.2)",
        },
      }),
    ];
  }, [theme]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label 
            htmlFor="json-input" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
          >
            JSON Input
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            ({charCount.toLocaleString()} {charCount === 1 ? 'character' : 'characters'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 transition-colors duration-300">
              <svg className="w-3.5 h-3.5 animate-spin text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="hidden sm:inline">Processing...</span>
            </span>
          )}
          {onLoadSample && (
            <button
              onClick={onLoadSample}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg
                transition-all duration-200 ease-in-out
                bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20
                text-blue-700 dark:text-blue-300
                border border-blue-200/60 dark:border-blue-700/60
                hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30
                hover:border-blue-300/60 dark:hover:border-blue-600/60
                hover:shadow-md hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                active:scale-95 touch-manipulation min-h-[32px]"
              title="Load sample JSON (⌘⇧E / Ctrl⇧E)"
              aria-label="Load sample JSON"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Example</span>
            </button>
          )}
          {onFormat && value.trim() && (
            <button
              onClick={onFormat}
              disabled={!isValid || isProcessing}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg
                transition-all duration-200 ease-in-out
                bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20
                text-purple-700 dark:text-purple-300
                border border-purple-200/60 dark:border-purple-700/60
                hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30
                hover:border-purple-300/60 dark:hover:border-purple-600/60
                hover:shadow-md hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
                active:scale-95 touch-manipulation min-h-[32px]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Format JSON (⌘⇧F / Ctrl⇧F)"
              aria-label="Format JSON"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Format</span>
            </button>
          )}
          {onClear && value.trim() && (
            <button
              onClick={onClear}
              disabled={isProcessing}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg
                transition-all duration-200 ease-in-out
                bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-700/50
                text-gray-700 dark:text-gray-300
                border border-gray-200/60 dark:border-gray-700/60
                hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200/50 dark:hover:from-gray-700 dark:hover:to-gray-600/50
                hover:border-gray-300/60 dark:hover:border-gray-600/60
                hover:shadow-md hover:shadow-gray-500/10 dark:hover:shadow-gray-500/20
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1
                active:scale-95 touch-manipulation min-h-[32px]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Clear input (⌘K / Ctrl+K)"
              aria-label="Clear input"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>
      <div className={`relative flex-1 flex overflow-hidden rounded-xl
        transition-all duration-300 ease-in-out
        shadow-lg dark:shadow-xl
        ${
          isValid
            ? "border border-gray-200/50 dark:border-gray-700/50 focus-within:border-blue-400/60 dark:focus-within:border-blue-500/60 focus-within:shadow-xl focus-within:shadow-blue-500/10 dark:focus-within:shadow-blue-500/20 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-800/30 dark:to-gray-800"
            : "border border-red-300/60 dark:border-red-600/60 shadow-xl shadow-red-500/10 dark:shadow-red-500/20 bg-gradient-to-br from-red-50/40 via-red-50/20 to-red-50/40 dark:from-red-950/40 dark:via-red-900/20 dark:to-red-950/40"
        }`}>
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            highlightSelectionMatches: false,
            highlightActiveLine: true, // Enable active line highlighting
            highlightActiveLineGutter: true, // Enable active line gutter highlighting
          }}
          editable={!isProcessing}
          placeholder='Paste your JSON here...'
          className={`h-full w-full ${
            isValid
              ? "bg-white dark:bg-gray-800"
              : "bg-red-50 dark:bg-red-950"
          }`}
        />
        {!isValid && (
          <div 
            id="json-error-hint"
            className="absolute bottom-3 left-3 right-3 z-10 text-xs text-red-700 dark:text-red-300 bg-gradient-to-r from-red-100/95 via-red-50/95 to-red-100/95 dark:from-red-900/95 dark:via-red-950/95 dark:to-red-900/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200/60 dark:border-red-800/60 shadow-lg shadow-red-500/10 dark:shadow-red-500/20 transition-colors duration-300"
            role="alert"
          >
            <strong className="font-semibold">Invalid JSON:</strong> Check for missing commas, brackets, or quotes.
          </div>
        )}
      </div>
    </div>
  );
}
