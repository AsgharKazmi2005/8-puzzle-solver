import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Puzzle.css'
import { saveBoard, loadBoard, clearBoard } from '../api/stateStore'

const GOAL = [1,2,3,4,5,6,7,8,null]

function isSolved(board) {
  for (let i=0;i<9;i++) {
    if (board[i] !== GOAL[i]) return false
  }
  return true
}

function shuffledBoard() {
  // create a solvable shuffle of 1..8 and one null
  const arr = [1,2,3,4,5,6,7,8,null]
  // Randomizer
  for (let i = arr.length -1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1))
    const t = arr[i]; arr[i]=arr[j]; arr[j]=t
  }
  // if not solvable or already solved, re-shuffle
  if (!isSolvable(arr) || isSolved(arr)) return shuffledBoard()
  return arr
}

function isSolvable(board) {
  // Count inversions ignoring null
  const flat = board.filter(Boolean)
  let inv = 0
  for (let i=0;i<flat.length;i++) for (let j=i+1;j<flat.length;j++) if (flat[i]>flat[j]) inv++
  // For 3x3, the puzzle is solvable if inversions even
  return inv % 2 === 0
}

export default function Puzzle() {
  const [board, setBoard] = useState(() => loadBoard() || shuffledBoard())
  const [won, setWon] = useState(() => isSolved(loadBoard() || board))
  const [showModal, setShowModal] = useState(false)

  const pointerStart = useRef(null)

  useEffect(()=>{
    saveBoard(board)
    const solved = isSolved(board)
    setWon(solved)
    if (solved) setShowModal(true)
  }, [board])

  function idxToPos(i){ return {r: Math.floor(i/3), c: i%3} }

  function canMove(i) {
    const emptyIndex = board.indexOf(null)
    const a = idxToPos(i), b = idxToPos(emptyIndex)
    const dr = Math.abs(a.r - b.r), dc = Math.abs(a.c - b.c)
    return (dr+dc) === 1
  }

  function move(i) {
    if (!canMove(i)) return
    const emptyIndex = board.indexOf(null)
    const copy = board.slice()
    copy[emptyIndex] = copy[i]
    copy[i] = null
    setBoard(copy)
  }

  function handleTileClick(i){ move(i) }

  function handleShuffle(){
    clearBoard()
    const b = shuffledBoard()
    setBoard(b)
    setShowModal(false)
  }

  // pointer-based swipe moving
  function onPointerDown(e){
    pointerStart.current = {x: e.clientX, y: e.clientY}
  }
  function onPointerUp(e){
    if (!pointerStart.current) return
    const end = {x: e.clientX, y: e.clientY}
    const dx = end.x - pointerStart.current.x
    const dy = end.y - pointerStart.current.y
    const absX = Math.abs(dx), absY = Math.abs(dy)
    const threshold = 24
    if (Math.max(absX, absY) < threshold) { pointerStart.current = null; return }
    // determine direction
    let dir
    if (absX > absY) dir = dx > 0 ? 'right' : 'left'
    else dir = dy > 0 ? 'down' : 'up'
    tryMoveByDirection(dir)
    pointerStart.current = null
  }

  function tryMoveByDirection(dir){
    const empty = board.indexOf(null)
    const {r,c} = idxToPos(empty)
    let target = null
    if (dir === 'up' && r < 2) target = (r+1)*3 + c
    if (dir === 'down' && r > 0) target = (r-1)*3 + c
    if (dir === 'left' && c < 2) target = r*3 + (c+1)
    if (dir === 'right' && c > 0) target = r*3 + (c-1)
    if (target !== null) move(target)
  }

  return (
    <div className="puzzle-root">
      <div className={`board ${won? 'win':''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {board.map((v,i)=> (
          <div
            key={i}
            className={`tile ${v===null? 'empty':''}`}
            onClick={()=> handleTileClick(i)}
            aria-hidden={v===null}
          >
            {v}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={handleShuffle}>Shuffle</button>
        <div className="info">Theme: {won? 'Green (Solved)' : 'Gray'}</div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Nice! You solved it 🎉</h3>
            <p>Play again?</p>
            <div style={{display:'flex', gap:8, justifyContent:'center'}}>
              <button onClick={()=>{ handleShuffle(); setShowModal(false)}}>Play again</button>
              <button onClick={()=> setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
