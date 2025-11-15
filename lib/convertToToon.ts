export function convertToToon(jsonString: string): { result: string; error: string | null } {
    // Handle empty input
    if (!jsonString.trim()) {
        return { result: "", error: null };
    }

    try {
        const parsed = JSON.parse(jsonString);

        if (typeof parsed !== "object" || parsed === null) {
            return { result: "", error: "JSON must be an object" };
        }

        return { result: convertObject(parsed), error: null };
    } catch (error) {
        return { result: "", error: "Invalid JSON" };
    }
}

function convertObject(obj: any): string {
    if (Array.isArray(obj)) {
        return convertArray("", obj);
    }

    if (obj === null) {
        return "null";
    }

    if (typeof obj === "object") {
        return convertPlainObject(obj);
    }

    // Primitive values
    return formatValue(obj);
}

function convertArray(keyName: string, arr: any[]): string {
    if (arr.length === 0) {
        return keyName ? `${keyName}[0]{}` : "[]";
    }

    // Check if array contains objects
    const firstItem = arr[0];
    const isObjectArray = typeof firstItem === "object" && firstItem !== null && !Array.isArray(firstItem);

    if (!isObjectArray) {
        // Array of primitives
        const values = arr.map((item) => formatValue(item)).join(", ");
        return keyName ? `${keyName}[${arr.length}]{ ${values} }` : `[${arr.length}]{ ${values} }`;
    }

    // Get all keys from all objects in the array, preserving order from first item
    const allKeys: string[] = [];
    const keySet = new Set<string>();

    // First, collect all unique keys
    for (const item of arr) {
        if (typeof item === "object" && item !== null && !Array.isArray(item)) {
            Object.keys(item).forEach((k) => keySet.add(k));
        }
    }

    // Preserve order from first item
    if (firstItem) {
        Object.keys(firstItem).forEach((k) => {
            if (keySet.has(k)) {
                allKeys.push(k);
                keySet.delete(k);
            }
        });
        // Add any remaining keys
        keySet.forEach((k) => allKeys.push(k));
    }

    // Build the TOON format
    const prefix = keyName ? `${keyName}[${arr.length}]{` : `[${arr.length}]{`;
    let result = `${prefix}\n`;
    result += `  ${allKeys.join(", ")};\n`;

    // Add each item's values on separate lines
    for (const item of arr) {
        const values: string[] = [];
        for (const key of allKeys) {
            const value = item?.[key];
            values.push(formatValue(value));
        }
        result += `  ${values.join(", ")}\n`;
    }

    result += `}`;
    return result;
}

function convertPlainObject(obj: Record<string, any>): string {
    const entries = Object.entries(obj);
    const lines: string[] = [];

    for (const [key, value] of entries) {
        if (Array.isArray(value)) {
            lines.push(convertArray(key, value));
            continue;
        }

        if (value !== null && typeof value === "object") {
            // Nested object → recurse properly
            const inner = convertPlainObject(value)
                .split("\n")
                .map(line => "  " + line)
                .join("\n");

            lines.push(`${key} {\n${inner}\n}`);
            continue;
        }

        // primitive
        lines.push(`${key}: ${formatValue(value)}`);
    }

    return lines.join("\n");
}


function formatValue(value: any): string {
    if (value === null) {
        return "null";
    }

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    if (typeof value === "string") {
        // Remove quotes from string values
        return value;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return convertArray("", value);
    }

    if (typeof value === "object") {
        return convertPlainObject(value);
    }

    return String(value);
}

