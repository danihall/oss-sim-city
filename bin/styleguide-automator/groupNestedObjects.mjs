const REGEX_OPEN_BRACKET = /{/g;
const REGEX_CLOSE_BRACKET = /}/g;

/**
 * @param {array} accumulated_chunks
 * @param {string} current_chunk
 * @returns {array}
 */
const groupNestedObjects = (accumulated_chunks, current_chunk) => {
  const previous_chunk = accumulated_chunks.at(-1);

  const open_brackets = previous_chunk?.match(REGEX_OPEN_BRACKET)?.length;
  const close_brackets = previous_chunk?.match(REGEX_CLOSE_BRACKET)?.length;

  if (open_brackets !== close_brackets) {
    return [...accumulated_chunks.slice(0, -1), previous_chunk + current_chunk];
  }

  return [...accumulated_chunks, current_chunk];
};

export { groupNestedObjects };
