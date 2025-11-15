"use client";

import { useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { useTheme } from "@/contexts/ThemeContext";
import { toonHighlighter } from "@/lib/toonHighlighter";

interface ToonOutputProps {
  toonText: string;
  error: string | null;
  isProcessing?: boolean;
}

export default function ToonOutput({ toonText, error, isProcessing }: ToonOutputProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  // Calculate character count
  const charCount = toonText.length;

  const handleCopy = async () => {
    if (toonText && !error) {
      try {
        await navigator.clipboard.writeText(toonText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = toonText;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (e) {
          console.error("Failed to copy:", e);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDownload = () => {
    if (toonText && !error) {
      const blob = new Blob([toonText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'toon.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Configure CodeMirror extensions for read-only TOON output
  const extensions = useMemo(() => {
    return [
      toonHighlighter(theme),
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
        // Active line highlighting
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
        ".cm-cursor": {
          display: "none", // Hide cursor in read-only mode
        },
      }),
      EditorView.editable.of(false), // Make it read-only
    ];
  }, [theme]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label 
            htmlFor="toon-output" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300"
          >
            TOON Output
          </label>
          {toonText && !error && (
            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              ({charCount.toLocaleString()} {charCount === 1 ? 'character' : 'characters'})
            </span>
          )}
        </div>
        {toonText && !error && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDownload();
                }
              }}
              aria-label="Download TOON output"
              className="group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg
                transition-all duration-200 ease-in-out
                bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20
                text-emerald-700 dark:text-emerald-300
                border border-emerald-200/60 dark:border-emerald-700/60
                hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-800/30 dark:hover:to-teal-800/30
                hover:border-emerald-300/60 dark:hover:border-emerald-600/60
                hover:shadow-md hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
                active:scale-95 touch-manipulation min-h-[32px]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isProcessing}
              title="Download TOON file"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={handleCopy}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCopy();
                }
              }}
              aria-label="Copy TOON output to clipboard"
              className={`group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-lg
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-1
                active:scale-95 touch-manipulation min-h-[32px]
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  copied
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 focus:ring-green-500"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500"
                }`}
              disabled={isProcessing}
              title="Copy to clipboard (⌘C / Ctrl+C)"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div
        className={`relative flex-1 flex overflow-hidden rounded-xl
          transition-all duration-300 ease-in-out
          shadow-lg dark:shadow-xl
          ${
            error
              ? "border border-red-300/60 dark:border-red-600/60 shadow-xl shadow-red-500/10 dark:shadow-red-500/20 bg-gradient-to-br from-red-50/40 via-red-50/20 to-red-50/40 dark:from-red-950/40 dark:via-red-900/20 dark:to-red-950/40"
              : "border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-800/30 dark:to-gray-800 hover:shadow-xl dark:hover:shadow-2xl"
          }
          ${isProcessing ? "opacity-70" : "opacity-100"}`}
      >
        {error ? (
          <div
            className="flex-1 w-full h-full p-4 text-sm overflow-auto
              scroll-smooth
              transition-all duration-300 ease-in-out
              bg-gradient-to-br from-red-50/60 via-red-50/40 to-red-50/60 dark:from-red-950/60 dark:via-red-900/40 dark:to-red-950/60 text-red-800 dark:text-red-200"
            role="alert"
          >
            <div className="text-red-800 dark:text-red-200 transition-colors duration-300">
              <div className="font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
              <div className="text-sm text-red-700/90 dark:text-red-300/90 mt-3 bg-red-100/40 dark:bg-red-900/40 backdrop-blur-sm rounded-lg p-3 border border-red-200/40 dark:border-red-800/40 transition-colors duration-300">
                <p className="mb-2 font-medium">Common issues:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-1">
                  <li>Missing commas between items</li>
                  <li>Unclosed brackets or braces</li>
                  <li>Trailing commas</li>
                  <li>Unquoted keys (in strict JSON)</li>
                </ul>
              </div>
            </div>
          </div>
        ) : toonText ? (
          <CodeMirror
            value={toonText}
            extensions={extensions}
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              dropCursor: false,
              allowMultipleSelections: false,
              highlightSelectionMatches: false,
              highlightActiveLine: true, // Enable active line highlighting
              highlightActiveLineGutter: true, // Enable active line gutter highlighting
            }}
            editable={false}
            className="h-full w-full bg-white dark:bg-gray-800"
          />
        ) : (
          <div className="flex-1 w-full h-full p-4 text-sm overflow-auto
            scroll-smooth
            transition-all duration-300 ease-in-out
            bg-gradient-to-br from-white via-gray-50/20 to-white dark:from-gray-800 dark:to-gray-800 text-gray-800 dark:text-gray-200">
            <div className="text-gray-400/70 dark:text-gray-500/70 h-full flex items-center justify-center transition-colors duration-300">
              <div className="text-center max-w-sm px-4">
                <div className="w-20 h-20 mx-auto mb-4 opacity-50 dark:opacity-40 bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all duration-300 hover:scale-105 hover:opacity-60 dark:hover:opacity-50">
                  <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2 text-base">TOON Output</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Your converted TOON format will appear here</p>
                <div className="flex flex-col gap-2 text-xs text-gray-400 dark:text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Real-time conversion</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy or download result</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
