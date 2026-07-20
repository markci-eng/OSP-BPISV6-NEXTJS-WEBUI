const UPPERCASE_WORDS = ["ID", "NO", "OR", "SI", "LPA"];

/**
 * Turns a camelCase / snake_case field key into a human-readable label with
 * Title Case words, preserving known acronyms in uppercase.
 * e.g. "grossCom" -> "Gross Com", "name" -> "Name", "or_no" -> "OR NO".
 */
export function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/\w\S*/g, (text) => {
      if (UPPERCASE_WORDS.includes(text.toUpperCase())) {
        return text.toUpperCase();
      }

      return text.charAt(0).toUpperCase() + text.slice(1);
    });
}
