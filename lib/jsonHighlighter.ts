import { ViewPlugin, Decoration, DecorationSet, ViewUpdate } from "@codemirror/view";
import { EditorState } from "@codemirror/state";

// Create a ViewPlugin that applies syntax highlighting to JSON
export function jsonHighlighter(theme: "light" | "dark") {
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
          bracket: theme === "dark" ? "#818cf8" : "#6366f1",
          punctuation: theme === "dark" ? "#94a3b8" : "#64748b",
        };

        let i = 0;
        const len = text.length;

        while (i < len) {
          const char = text[i];
          const pos = i;

          // Strings (quoted)
          if (char === '"') {
            let str = '"';
            i++;
            while (i < len && text[i] !== '"') {
              if (text[i] === "\\" && i + 1 < len) {
                str += text[i] + text[i + 1];
                i += 2;
              } else {
                str += text[i];
                i++;
              }
            }
            if (i < len) {
              str += '"';
              i++;
            }
            
            // Check if this is a key (look ahead for colon)
            let j = i;
            while (j < len && /\s/.test(text[j])) j++;
            const isKey = j < len && text[j] === ":";
            
            decorations.push(
              Decoration.mark({
                class: "cm-json-string",
                attributes: { 
                  style: `color: ${isKey ? colors.key : colors.string}; font-weight: ${isKey ? "500" : "normal"};` 
                },
              }).range(pos, pos + str.length)
            );
            continue;
          }

          // Braces and brackets
          if (char === "{" || char === "}") {
            decorations.push(
              Decoration.mark({
                class: "cm-json-brace",
                attributes: { style: `color: ${colors.bracket}; font-weight: 600;` },
              }).range(pos, pos + 1)
            );
            i++;
            continue;
          }

          if (char === "[" || char === "]") {
            decorations.push(
              Decoration.mark({
                class: "cm-json-bracket",
                attributes: { style: `color: ${colors.bracket}; font-weight: 600;` },
              }).range(pos, pos + 1)
            );
            i++;
            continue;
          }

          // Colon and comma
          if (char === ":" || char === ",") {
            decorations.push(
              Decoration.mark({
                class: "cm-json-punctuation",
                attributes: { style: `color: ${colors.punctuation};` },
              }).range(pos, pos + 1)
            );
            i++;
            continue;
          }

          // Numbers
          const numberMatch = text.substring(i).match(/^-?\d+\.?\d*([eE][+-]?\d+)?/);
          if (numberMatch) {
            const matchLength = numberMatch[0].length;
            decorations.push(
              Decoration.mark({
                class: "cm-json-number",
                attributes: { style: `color: ${colors.number}; font-weight: 500;` },
              }).range(pos, pos + matchLength)
            );
            i += matchLength;
            continue;
          }

          // Boolean and null
          if (text.substring(i).startsWith("true") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(text[i + 4]))) {
            decorations.push(
              Decoration.mark({
                class: "cm-json-boolean",
                attributes: { style: `color: ${colors.boolean}; font-weight: 500;` },
              }).range(pos, pos + 4)
            );
            i += 4;
            continue;
          }
          if (text.substring(i).startsWith("false") && (i + 5 >= len || !/[a-zA-Z0-9_]/.test(text[i + 5]))) {
            decorations.push(
              Decoration.mark({
                class: "cm-json-boolean",
                attributes: { style: `color: ${colors.boolean}; font-weight: 500;` },
              }).range(pos, pos + 5)
            );
            i += 5;
            continue;
          }
          if (text.substring(i).startsWith("null") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(text[i + 4]))) {
            decorations.push(
              Decoration.mark({
                class: "cm-json-null",
                attributes: { style: `color: ${colors.null}; font-weight: 500;` },
              }).range(pos, pos + 4)
            );
            i += 4;
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

        return Decoration.set(decorations);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

