import React, { useEffect, useRef, useState } from 'react'
import './Puzzle.css'
import { saveBoard, loadBoard, clearBoard } from '../api/stateStore'

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, null]

function isSolved(board) {
  for (let i = 0; i < 9; i++) {
    if (board[i] !== GOAL[i]) return false
  }
  return true
}

function shuffledBoard() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, null]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t
  }
  if (!isSolvable(arr) || isSolved(arr)) return shuffledBoard()
  return arr
}

function isSolvable(board) {
  const flat = board.filter(Boolean)
  let inv = 0
  for (let i = 0; i < flat.length; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++
  return inv % 2 === 0
}

export default function Puzzle() {
  const [board, setBoard] = useState(() => loadBoard() || shuffledBoard())
  const [won, setWon] = useState(() => isSolved(loadBoard() || board))
  const [showModal, setShowModal] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const [usedSolver, setUsedSolver] = useState(false)
  const [logs, setLogs] = useState(["> Try to solve the puzzle by clicking a tile to move it into the empty space"])
  const [userMoves, setUserMoves] = useState(0)

  const [heuristics, setHeuristics] = useState({
    manhattan: true,
    correctTiles: false
  })

  const [configInput, setConfigInput] = useState('')
  const pointerStart = useRef(null)

  useEffect(() => {
    saveBoard(board)
    const solved = isSolved(board)
    setWon(solved)
    if (solved) setShowModal(true)
  }, [board])

  useEffect(() => {
    setConfigInput(JSON.stringify(board))
  }, [])

  function idxToPos(i) { return { r: Math.floor(i / 3), c: i % 3 } }

  function canMove(i) {
    const emptyIndex = board.indexOf(null)
    const a = idxToPos(i), b = idxToPos(emptyIndex)
    const dr = Math.abs(a.r - b.r), dc = Math.abs(a.c - b.c)
    return (dr + dc) === 1
  }

  function move(i, fromSolver = false) {
    if (!canMove(i)) return
    const emptyIndex = board.indexOf(null)
    const copy = board.slice()
    copy[emptyIndex] = copy[i]
    copy[i] = null
    setBoard(copy)

    if (!fromSolver && !isSolving) {
      const tile = board[i]
      setUserMoves(prev => prev + 1)
      addLog(`Moved tile ${tile} (Total moves: ${userMoves + 1})`)
    }
  }

  function handleTileClick(i) {
    if (isSolving) return
    move(i)
  }

  function handleShuffle() {
    clearBoard()
    const b = shuffledBoard()
    setBoard(b)
    setShowModal(false)
    setUserMoves(0)
    setUsedSolver(false)
    setLogs(["> Try to solve the puzzle by clicking a tile to move it into the empty space"])
    setConfigInput(JSON.stringify(b))
  }

  function onPointerDown(e) {
    pointerStart.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerUp(e) {
    if (!pointerStart.current) return
    const end = { x: e.clientX, y: e.clientY }
    const dx = end.x - pointerStart.current.x
    const dy = end.y - pointerStart.current.y
    const absX = Math.abs(dx), absY = Math.abs(dy)
    const threshold = 24
    if (Math.max(absX, absY) < threshold) { pointerStart.current = null; return }
    let dir
    if (absX > absY) dir = dx > 0 ? 'right' : 'left'
    else dir = dy > 0 ? 'down' : 'up'
    tryMoveByDirection(dir)
    pointerStart.current = null
  }

  function tryMoveByDirection(dir) {
    const empty = board.indexOf(null)
    const { r, c } = idxToPos(empty)
    let target = null
    if (dir === 'up' && r < 2) target = (r + 1) * 3 + c
    if (dir === 'down' && r > 0) target = (r - 1) * 3 + c
    if (dir === 'left' && c < 2) target = r * 3 + (c + 1)
    if (dir === 'right' && c > 0) target = r * 3 + (c - 1)
    if (target !== null) move(target)
  }

  function addLog(message) {
    setLogs(prev => [...prev, `> ${message}`])
  }

  function findMovedTile(prev, next) {
    for (let i = 0; i < 9; i++) {
      if (prev[i] !== next[i] && next[i] !== null) return next[i]
    }
    return null
  }

  async function handleSolve() {
    setIsSolving(true)
    setUsedSolver(true)
    setLogs([])
    addLog('Sent current state to backend')

    let endpoint = ''
    if (heuristics.manhattan && heuristics.correctTiles) {
      endpoint = '/solve/combined'
    } else if (heuristics.manhattan) {
      endpoint = '/solve/manhattan'
    } else {
      endpoint = '/solve/correct_tiles'
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: board })
      })

      const data = await res.json()
      const steps = data.solution || []
      const expanded = data.expanded || 0

      addLog(`Found solution in ${steps.length - 1} moves`)
      addLog(`This search expanded ${expanded} states`)

      for (let i = 1; i < steps.length; i++) {
        const movedTile = findMovedTile(steps[i - 1], steps[i])
        if (movedTile) addLog(`Moved tile ${movedTile}`)
        await new Promise(r => setTimeout(r, 500))
        setBoard(steps[i])
      }

      addLog('Solved!')
    } catch (err) {
      console.error('Error solving puzzle:', err)
      addLog('❌ Error: Could not solve puzzle')
      alert('Error solving puzzle — check backend logs.')
    } finally {
      setIsSolving(false)
    }
  }

  function toggleHeuristic(type) {
    setHeuristics(prev => {
      const next = { ...prev, [type]: !prev[type] }
      if (!next.manhattan && !next.correctTiles) {
        next[type] = true
      }
      return next
    })
  }

  function handleSetConfiguration() {
    try {
      const parsed = JSON.parse(configInput
        .replace(/None/g, 'null')
        .replace(/'/g, '"'))

      if (!Array.isArray(parsed) || parsed.length !== 9) {
        alert('Configuration must be a 9-element array.')
        return
      }
      if (!parsed.includes(null)) {
        alert('Configuration must include exactly one null (empty tile).')
        return
      }
      setBoard(parsed)
      setShowModal(false)
      setUserMoves(0)
      setUsedSolver(false)
      setLogs(["> Custom configuration loaded successfully."])
    } catch (e) {
      alert('Invalid configuration format. Example: [1,3,null,4,5,7,6,8,2]')
    }
  }

  return (
    <div className="puzzle-root">

      <div className='manual-config'>
        <input
          type="text"
          value={configInput}
          onChange={e => setConfigInput(e.target.value)}
          placeholder='Enter custom configuration (e.g. [1,3,null,4,5,7,6,8,2])'
        />
        <button onClick={handleSetConfiguration}>Set Configuration</button>
      </div>

      <div className="board-console-container">
        <div
          className={`board ${won ? 'win' : ''}`}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {board.map((v, i) => (
            <div
              key={i}
              className={`tile ${v === null ? 'empty' : ''}`}
              onClick={() => handleTileClick(i)}
              aria-hidden={v === null}
            >
              {v}
            </div>
          ))}
        </div>

        <div className="console-window">
          {logs.map((msg, i) => (
            <div key={i} className="console-line">{msg}</div>
          ))}
        </div>
      </div>

      <div className="solver-settings">
        <h4>Solver Settings</h4>
        <div className="heuristics-options">
          <label>
            <input
              type="checkbox"
              checked={heuristics.manhattan}
              onChange={() => toggleHeuristic('manhattan')}
            />
            Manhattan Distance
          </label>
          <label style={{ marginLeft: 24 }}>
            <input
              type="checkbox"
              checked={heuristics.correctTiles}
              onChange={() => toggleHeuristic('correctTiles')}
            />
            Correctly Placed Tile Count
          </label>
        </div>
      </div>

      <div className="controls">
        <button onClick={handleShuffle} disabled={isSolving}>Shuffle</button>
        <button onClick={handleSolve} disabled={isSolving}>A* Solve</button>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{usedSolver ? 'A* Saved the day! 🚀' : 'Nice! You solved it 🎉'}</h3>
            <p>Play again?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => { handleShuffle(); setShowModal(false) }}>Play again</button>
              <button onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
