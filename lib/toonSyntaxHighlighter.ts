export function highlightToon(toon: string): string {
  if (!toon.trim()) return "";

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  const lines = toon.split("\n");
  const highlightedLines = lines.map((line, lineIndex) => {
    if (!line.trim()) return escapeHtml(line);

    let result = "";
    let i = 0;
    const len = line.length;

    // Check if this line is a column header (ends with semicolon)
    const isColumnHeader = line.trim().endsWith(";");
    
    // Check if this line contains an array declaration pattern: keyName[count]{
    const arrayDeclMatch = line.match(/^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)?(\[(\d+)\]\s*\{)/);
    
    while (i < len) {
      const char = line[i];
      const remaining = line.substring(i);

      // Array declaration: keyName[count]{ or [count]{
      if (arrayDeclMatch && i === arrayDeclMatch[1].length) {
        if (arrayDeclMatch[2]) {
          // Has key name
          result += `<span class="toon-key">${escapeHtml(arrayDeclMatch[2])}</span>`;
          i += arrayDeclMatch[2].length;
        }
        result += `<span class="toon-array-decl">${escapeHtml(arrayDeclMatch[3])}</span>`;
        i += arrayDeclMatch[3].length;
        continue;
      }

      // Closing brace
      if (char === "}") {
        result += `<span class="toon-brace">${escapeHtml(char)}</span>`;
        i++;
        continue;
      }

      // Opening brace (if not part of array declaration)
      if (char === "{" && !arrayDeclMatch) {
        result += `<span class="toon-brace">${escapeHtml(char)}</span>`;
        i++;
        continue;
      }

      // Semicolon (for column headers)
      if (char === ";") {
        result += `<span class="toon-semicolon">${escapeHtml(char)}</span>`;
        i++;
        continue;
      }

      // Colon (for key-value pairs)
      if (char === ":") {
        result += `<span class="toon-colon">${escapeHtml(char)}</span>`;
        i++;
        continue;
      }

      // Comma
      if (char === ",") {
        result += `<span class="toon-comma">${escapeHtml(char)}</span>`;
        i++;
        continue;
      }

      // Numbers
      if ((char >= "0" && char <= "9") || (char === "-" && i + 1 < len && /[0-9]/.test(line[i + 1]))) {
        let num = char;
        i++;
        while (i < len && /[0-9.eE+-]/.test(line[i]) && !(line[i] === "-" && line[i - 1] !== "e" && line[i - 1] !== "E")) {
          num += line[i];
          i++;
        }
        result += `<span class="toon-number">${escapeHtml(num)}</span>`;
        continue;
      }

      // Boolean and null
      if (remaining.startsWith("true") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(line[i + 4]))) {
        result += `<span class="toon-boolean">${escapeHtml("true")}</span>`;
        i += 4;
        continue;
      }
      if (remaining.startsWith("false") && (i + 5 >= len || !/[a-zA-Z0-9_]/.test(line[i + 5]))) {
        result += `<span class="toon-boolean">${escapeHtml("false")}</span>`;
        i += 5;
        continue;
      }
      if (remaining.startsWith("null") && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(line[i + 4]))) {
        result += `<span class="toon-null">${escapeHtml("null")}</span>`;
        i += 4;
        continue;
      }

      // Identifiers (keys, column headers, or string values)
      if (/[a-zA-Z_$]/.test(char)) {
        let identifier = char;
        i++;
        while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) {
          identifier += line[i];
          i++;
        }
        
        // Determine type based on context
        let j = i;
        while (j < len && /\s/.test(line[j])) j++;
        
        const isKey = j < len && line[j] === ":";
        const isColHeader = isColumnHeader && (j >= len || line[j] === "," || line[j] === ";");
        
        if (isKey) {
          result += `<span class="toon-key">${escapeHtml(identifier)}</span>`;
        } else if (isColHeader) {
          result += `<span class="toon-column-header">${escapeHtml(identifier)}</span>`;
        } else {
          // String value
          result += `<span class="toon-string">${escapeHtml(identifier)}</span>`;
        }
        continue;
      }

      // String values (unquoted text that doesn't match other patterns)
      // This handles unquoted strings in TOON format
      if (!/\s/.test(char) && char !== "[" && char !== "]" && char !== "{" && char !== "}") {
        let str = char;
        i++;
        while (i < len && 
               !/\s/.test(line[i]) && 
               line[i] !== "," && 
               line[i] !== ";" && 
               line[i] !== ":" && 
               line[i] !== "{" && 
               line[i] !== "}" && 
               line[i] !== "[" && 
               line[i] !== "]") {
          str += line[i];
          i++;
        }
        
        // If it's not a number (already handled), treat as string
        if (!/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str)) {
          result += `<span class="toon-string">${escapeHtml(str)}</span>`;
        } else {
          result += escapeHtml(str);
        }
        continue;
      }

      // Whitespace and other characters
      result += escapeHtml(char);
      i++;
    }

    return result;
  });

  return highlightedLines.join("\n");
}
