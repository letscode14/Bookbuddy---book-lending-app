export function getShuffledIndexes(length) {
  if (length < 2) {
    return [1, null]
  }

  const indexes = Array.from({ length: length - 1 }, (_, index) => index + 1)

  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }

  if (length > 20) {
    return [indexes[0], indexes[1]]
  } else {
    return [indexes[0], null]
  }
}
