import { ViewPlugin, Decoration, DecorationSet, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

// Create a ViewPlugin that applies syntax highlighting to TOON format
export function toonHighlighter(theme: "light" | "dark") {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: { state: EditorState }) {
        this.decorations = this.buildDecorations(view.state, theme);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.state, theme);
        }
      }

      buildDecorations(state: EditorState, theme: "light" | "dark"): DecorationSet {
        const decorations: any[] = [];
        const doc = state.doc;
        const text = doc.toString();

        // Color definitions based on theme
        const colors = {
          key: theme === "dark" ? "#38bdf8" : "#0ea5e9",
          string: theme === "dark" ? "#34d399" : "#10b981",
          number: theme === "dark" ? "#fbbf24" : "#f59e0b",
          boolean: theme === "dark" ? "#a78bfa" : "#8b5cf6",
          null: theme === "dark" ? "#f87171" : "#ef4444",
          brace: theme === "dark" ? "#818cf8" : "#6366f1",
          bracket: theme === "dark" ? "#818cf8" : "#6366f1",
          semicolon: theme === "dark" ? "#a78bfa" : "#8b5cf6",
          colon: theme === "dark" ? "#94a3b8" : "#64748b",
          comma: theme === "dark" ? "#94a3b8" : "#64748b",
          arrayDecl: theme === "dark" ? "#818cf8" : "#6366f1",
          columnHeader: theme === "dark" ? "#a78bfa" : "#8b5cf6",
        };

        const lines = text.split("\n");
        let offset = 0;

        lines.forEach((line, lineIndex) => {
          const isColumnHeader = line.trim().endsWith(";");
          let i = 0;
          const len = line.length;

          while (i < len) {
            const char = line[i];
            const pos = offset + i;

            // Array declaration: [count]{
            const arrayMatch = line.substring(i).match(/^\[\d+\]\s*\{/);
            if (arrayMatch) {
              const matchLength = arrayMatch[0].length;
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-array-decl",
                  attributes: { style: `color: ${colors.arrayDecl}; font-weight: 600;` },
                }).range(pos, pos + matchLength)
              );
              i += matchLength;
              continue;
            }

            // Braces
            if (char === "{" || char === "}") {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-brace",
                  attributes: { style: `color: ${colors.brace}; font-weight: 600;` },
                }).range(pos, pos + 1)
              );
              i++;
              continue;
            }

            // Brackets
            if (char === "[" || char === "]") {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-bracket",
                  attributes: { style: `color: ${colors.bracket}; font-weight: 600;` },
                }).range(pos, pos + 1)
              );
              i++;
              continue;
            }

            // Semicolon
            if (char === ";") {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-semicolon",
                  attributes: { style: `color: ${colors.semicolon}; font-weight: 600;` },
                }).range(pos, pos + 1)
              );
              i++;
              continue;
            }

            // Colon
            if (char === ":") {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-colon",
                  attributes: { style: `color: ${colors.colon};` },
                }).range(pos, pos + 1)
              );
              i++;
              continue;
            }

            // Comma
            if (char === ",") {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-comma",
                  attributes: { style: `color: ${colors.comma};` },
                }).range(pos, pos + 1)
              );
              i++;
              continue;
            }

            // Numbers
            const numberMatch = line.substring(i).match(/^-?\d+\.?\d*([eE][+-]?\d+)?/);
            if (numberMatch) {
              const matchLength = numberMatch[0].length;
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-number",
                  attributes: { style: `color: ${colors.number}; font-weight: 500;` },
                }).range(pos, pos + matchLength)
              );
              i += matchLength;
              continue;
            }

            // Boolean and null
            if (line.substring(i).startsWith("true") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(line[i + 4]))) {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-boolean",
                  attributes: { style: `color: ${colors.boolean}; font-weight: 500;` },
                }).range(pos, pos + 4)
              );
              i += 4;
              continue;
            }
            if (line.substring(i).startsWith("false") && (i + 5 >= len || !/[a-zA-Z0-9_]/.test(line[i + 5]))) {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-boolean",
                  attributes: { style: `color: ${colors.boolean}; font-weight: 500;` },
                }).range(pos, pos + 5)
              );
              i += 5;
              continue;
            }
            if (line.substring(i).startsWith("null") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(line[i + 4]))) {
              decorations.push(
                Decoration.mark({
                  class: "cm-toon-null",
                  attributes: { style: `color: ${colors.null}; font-weight: 500;` },
                }).range(pos, pos + 4)
              );
              i += 4;
              continue;
            }

            // Identifiers (keys, column headers, or strings)
            const identifierMatch = line.substring(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
            if (identifierMatch) {
              const identifier = identifierMatch[0];
              const matchLength = identifier.length;
              
              // Look ahead to determine type
              let j = i + matchLength;
              while (j < len && /\s/.test(line[j])) j++;
              
              const nextChar = j < len ? line[j] : null;
              const isKey = nextChar === ":";
              const isColHeader = isColumnHeader && (nextChar === null || nextChar === "," || nextChar === ";");
              
              if (isKey) {
                decorations.push(
                  Decoration.mark({
                    class: "cm-toon-key",
                    attributes: { style: `color: ${colors.key}; font-weight: 500;` },
                  }).range(pos, pos + matchLength)
                );
              } else if (isColHeader) {
                decorations.push(
                  Decoration.mark({
                    class: "cm-toon-column-header",
                    attributes: { style: `color: ${colors.columnHeader}; font-weight: 600;` },
                  }).range(pos, pos + matchLength)
                );
              } else {
                decorations.push(
                  Decoration.mark({
                    class: "cm-toon-string",
                    attributes: { style: `color: ${colors.string};` },
                  }).range(pos, pos + matchLength)
                );
              }
              i += matchLength;
              continue;
            }

            // Unquoted strings (catch-all)
            const stringMatch = line.substring(i).match(/^[^\s{}\[\]:,;]+/);
            if (stringMatch) {
              const matchLength = stringMatch[0].length;
              // Only treat as string if it's not a number (already handled)
              if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(stringMatch[0])) {
                decorations.push(
                  Decoration.mark({
                    class: "cm-toon-string",
                    attributes: { style: `color: ${colors.string};` },
                  }).range(pos, pos + matchLength)
                );
              }
              i += matchLength;
              continue;
            }

            // Whitespace - skip
            if (/\s/.test(char)) {
              i++;
              continue;
            }

            // Default - advance
            i++;
          }

          offset += line.length + 1; // +1 for newline
        });

        return Decoration.set(decorations);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

