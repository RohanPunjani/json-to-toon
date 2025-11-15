export function highlightJson(json: string): string {
  if (!json.trim()) return "";

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  // Use regex to tokenize JSON
  const tokens: Array<{ type: string; value: string; isKey?: boolean }> = [];
  let i = 0;
  const len = json.length;

  while (i < len) {
    const char = json[i];

    // String (could be key or value)
    if (char === '"') {
      let str = '"';
      i++;
      while (i < len && json[i] !== '"') {
        if (json[i] === "\\" && i + 1 < len) {
          str += json[i] + json[i + 1];
          i += 2;
        } else {
          str += json[i];
          i++;
        }
      }
      if (i < len) {
        str += '"';
        i++;
      }
      
      // Check if this is a key (look ahead for colon)
      let j = i;
      while (j < len && /\s/.test(json[j])) j++;
      const isKey = j < len && json[j] === ":";
      
      tokens.push({ type: isKey ? "key" : "string", value: str });
      continue;
    }

    // Numbers
    if ((char >= "0" && char <= "9") || (char === "-" && i + 1 < len && /[0-9]/.test(json[i + 1]))) {
      let num = char;
      i++;
      while (i < len && /[0-9.eE+-]/.test(json[i]) && !(json[i] === "-" && json[i - 1] !== "e" && json[i - 1] !== "E")) {
        num += json[i];
        i++;
      }
      tokens.push({ type: "number", value: num });
      continue;
    }

    // Boolean and null
    if (json.substr(i, 4) === "true" && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(json[i + 4]))) {
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }
    if (json.substr(i, 5) === "false" && (i + 5 >= len || !/[a-zA-Z0-9_]/.test(json[i + 5]))) {
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }
    if (json.substr(i, 4) === "null" && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(json[i + 4]))) {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    // Punctuation
    if (char === "{" || char === "}") {
      tokens.push({ type: "brace", value: char });
      i++;
      continue;
    }
    if (char === "[" || char === "]") {
      tokens.push({ type: "bracket", value: char });
      i++;
      continue;
    }
    if (char === ":") {
      tokens.push({ type: "punctuation", value: ":" });
      i++;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "punctuation", value: "," });
      i++;
      continue;
    }

    // Whitespace and other characters
    tokens.push({ type: "text", value: char });
    i++;
  }

  // Convert tokens to HTML
  return tokens.map(token => {
    const escaped = escapeHtml(token.value);
    switch (token.type) {
      case "key":
        return `<span class="json-key">${escaped}</span>`;
      case "string":
        return `<span class="json-string">${escaped}</span>`;
      case "number":
        return `<span class="json-number">${escaped}</span>`;
      case "boolean":
        return `<span class="json-boolean">${escaped}</span>`;
      case "null":
        return `<span class="json-null">${escaped}</span>`;
      case "brace":
        return `<span class="json-brace">${escaped}</span>`;
      case "bracket":
        return `<span class="json-bracket">${escaped}</span>`;
      case "punctuation":
        return `<span class="json-punctuation">${escaped}</span>`;
      default:
        return escaped;
    }
  }).join("");
}

