// Very small state store for the puzzle board
// Uses localStorage for persistence so the board state can be retrieved later

const STORAGE_KEY = 'eight-puzzle-board'

export function saveBoard(board) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
  } catch (e) {
    console.warn('saveBoard failed', e)
  }
}

export function loadBoard() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (!v) return null
    return JSON.parse(v)
  } catch (e) {
    console.warn('loadBoard failed', e)
    return null
  }
}

export function clearBoard() {
  try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
}
