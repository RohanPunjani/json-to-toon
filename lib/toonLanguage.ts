import { StreamLanguage } from "@codemirror/language";

// Define TOON syntax highlighting using regex patterns
// Using StreamLanguage which returns token names that will be styled via CSS classes
export const toonLanguage = StreamLanguage.define({
  name: "toon",
  token: (stream) => {
    // Single character tokens first (these always advance)
    if (stream.eat("{")) return "toon-brace";
    if (stream.eat("}")) return "toon-brace";
    if (stream.eat(";")) return "toon-semicolon";
    if (stream.eat(":")) return "toon-colon";
    if (stream.eat(",")) return "toon-comma";
    if (stream.eat("[")) return "toon-bracket";
    if (stream.eat("]")) return "toon-bracket";

    // Numbers - must match and advance
    if (stream.match(/^-?\d+\.?\d*([eE][+-]?\d+)?/)) {
      return "toon-number";
    }

    // Boolean and null literals
    if (stream.match(/^true\b/)) {
      return "toon-boolean";
    }
    if (stream.match(/^false\b/)) {
      return "toon-boolean";
    }
    if (stream.match(/^null\b/)) {
      return "toon-null";
    }

    // Array declaration pattern: [count]{
    if (stream.match(/^\[\d+\]\s*\{/)) {
      return "toon-array-decl";
    }

    // Identifiers (keys, column headers, or strings)
    if (stream.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
      // Get the current line to check for column headers
      const line = stream.string;
      const isColumnHeader = line.trim().endsWith(";");
      
      // After matching, stream.pos has advanced past the identifier
      // Look ahead to determine type (without advancing further)
      let lookAheadPos = stream.pos;
      while (lookAheadPos < stream.string.length && /\s/.test(stream.string[lookAheadPos])) {
        lookAheadPos++;
      }
      
      const nextChar = lookAheadPos < stream.string.length ? stream.string[lookAheadPos] : null;
      const isKey = nextChar === ":";
      const isColHeader = isColumnHeader && (nextChar === null || nextChar === "," || nextChar === ";");
      
      if (isKey) {
        return "toon-key";
      } else if (isColHeader) {
        return "toon-column-header";
      } else {
        return "toon-string";
      }
    }

    // Unquoted strings (catch-all for other non-whitespace sequences)
    if (stream.match(/^[^\s{}\[\]:,;]+/)) {
      return "toon-string";
    }

    // Whitespace - must advance
    if (stream.eatSpace()) {
      return null;
    }

    // If we get here, advance by one character to avoid infinite loop
    stream.next();
    return null;
  },
});

