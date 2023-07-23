(Game(
  document.getElementById('container'),
  document.getElementById('status'),
  {
    prev: document.getElementById('prev'),
    next: document.getElementById('next'),
    reset: document.getElementById('reset')
  }
)).setup()

function Game(container, status, buttons) {
  const state = {
    history: [ Grid() ],
    step: 0,
    xIsNext: true,
    isWon: false,
    isFinished: false,
    winner: null
  }

  function reset() {
    state.history = [Grid()]; // Reset the history to a new grid
    state.step = 0; // Reset the step
    state.xIsNext = true; // Reset the player's turn
    state.isWon = false; // Reset the game won status
    state.isFinished = false; // Reset the game finished status
    state.winner = null; // Reset the winner
    reload(); // Reload the game
  }

  function previous() {
    const firstMove = state.step === 0
    if (firstMove) return
    jumpTo(--state.step);
  }

  function next() {
    const lastMove = state.step >= state.history.length - 1
    if (lastMove) return
    jumpTo(++state.step)
  }

  function jumpTo(step) {
    const current = state.history[ step ]
    const winner = current.findWinner()

    Object.assign(state, {
      step,
      xIsNext: (step % 2) === 0,
      isWon: !!winner,
      winner,
      isFinished: current.isOccupied() || !!winner
    })

    reload()
  }

  function reload() {
    clear()
    setup()
  }

  function clear() {
    const table = container.querySelector('table')
    container.removeChild(table)
  }

  function setup() {
    const { step, history } = state
    const current = history[ step ]
    const gridElement = current.render(handleClickCell)

    container.appendChild(gridElement)
    updateStatus()
  }

  function handleClickCell(cell, pos) {
    const { step, xIsNext, history } = state
    const current = history[ step ]
    state.history = history.slice(0, step + 1)

    const noMoreMoves = state.isWon || current.get(pos)
    if (noMoreMoves) return
    
    const currentPlayer1 = xIsNext ? 'X' : 'O';
    const grid = Grid(current.cells)
    grid.set(pos, cell.innerText = xIsNext ? 'X' : 'O')

    const winner = grid.findWinner()

    Object.assign(state, {
      xIsNext: !xIsNext,
      history: state.history.concat([ grid ]),
      isWon: winner !== null,
      winner,
      isFinished: grid.isOccupied() || !!winner,
      step: step + 1
    })

    updateStatus();

    cell.style.backgroundColor = currentPlayer1 === 'X' ? 'rgba(255, 0, 0, 0.4)' : 'rgba(227, 207, 28, 0.5)';
  }

  function updateStatus() {
    const { winner, xIsNext, isWon, isFinished } = state
    const innerText = isWon ? `Player ${winner} won the game!` :
                      (isFinished ? `Game finished` :
                      `Next player: ${xIsNext ? 'X' : 'O'}`)
    status.innerText = innerText
  }

  buttons.prev.addEventListener('click', previous)
  buttons.next.addEventListener('click', next)
  buttons.reset.addEventListener('click', reset);

  return {
    setup,
    reset
  }
}

function Grid(cells) {
  const size = { x: 3, y: 3 }
  cells = cells?.slice() || Array(
    size.x * size.y
  ).fill(null)

  function get({ x, y }) {
    return cells[ x + y * size.x ]
  }

  function set({ x, y }, value) {
    cells[ x + y * size.x ] = value
  }

  function isOccupied() {
    const area = size.x * size.y
    for (let i = 0; i < area; i++) {
      if (cells[ i ] === null) return false
    }
    return true
  }

  function findWinner() {
    const possibleCombinations = [
      [ 0, 1, 2 ],
      [ 3, 4, 5 ],
      [ 6, 7, 8 ],
      [ 0, 3, 6 ],
      [ 1, 4, 7 ],
      [ 2, 5, 8 ],
      [ 0, 4, 8 ],
      [ 2, 4, 6 ]
    ]

    for (const line of possibleCombinations) {
      const [ a, b, c ] = line
      if (cells[ a ] && cells[ a ] === cells[ b ] &&
          cells[ a ] === cells[ c ]) {
        return cells[ a ]
      }
    }
    return null
  }

  function render(handleClickCell) {
    const table = document.createElement('table')
    for (let y = 0; y < size.y; y++) {
      const row = table.insertRow()
      for (let x = 0; x < size.x; x++) {
        const cell = row.insertCell()
        cell.innerText = get({ x, y })
        cell.addEventListener('click', () => handleClickCell(cell, { x, y }))
      }
    }
    return table
  }

  return {
    cells,
    get,
    set,
    isOccupied,
    findWinner,
    render
  }

}
