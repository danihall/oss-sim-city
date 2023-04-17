const REGEX_OPEN_BRACKET = /{/g;
const REGEX_CLOSE_BRACKET = /}/g;

/**
 * @param {array} accumulated_chunks
 * @param {string} current_chunk
 * @param {number} index
 * @returns {array}
 */
const mergeChunksAsKeyValuePair = (
  accumulated_chunks,
  current_chunk,
  index
) => {
  if (index === 0) {
    return [current_chunk];
  }

  const previousChunk = accumulated_chunks.at(-1);
  const open_brackets_count = previousChunk.match(REGEX_OPEN_BRACKET)?.length;
  const close_brackets_count = previousChunk.match(REGEX_CLOSE_BRACKET)?.length;

  if (open_brackets_count === close_brackets_count) {
    return [...accumulated_chunks, current_chunk];
  }

  return [...accumulated_chunks.slice(0, -1), previousChunk + current_chunk];
};

export { mergeChunksAsKeyValuePair };
