/**
 * Convert an arbitrary field value to a readable string.
 * Handles plain strings, DatoCMS Structured Text objects, and anything else.
 *
 * @param {*} value
 * @returns {string}
 */
export const getDisplayValue = (value) => {
  if (!value) return "-";
  if (typeof value === "string") return value;

  if (typeof value === "object" && value.document?.children) {
    try {
      return value.document.children
        .map((child) => child.children?.map((c) => c.value || "").join(""))
        .join(" ");
    } catch {
      return "[Structured Text]";
    }
  }

  return JSON.stringify(value);
};

/**
 * Capitalise the first letter of a string.
 * Returns "" for falsy input.
 *
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

/**
 * Split an array into chunks of `size`.
 *
 * @param {any[]} arr
 * @param {number} size
 * @returns {any[][]}
 */
export const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
};
