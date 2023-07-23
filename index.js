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
    const { step, xIsNext, history } = state;
    const current = history[step];
    state.history = history.slice(0, step + 1);
  
    const noMoreMoves = state.isWon || current.get(pos);
    if (noMoreMoves) return;
  
    const currentPlayer1 = xIsNext ? 'X' : 'O';
    const grid = Grid(current.cells);
    grid.set(pos, currentPlayer1);
  
    const winner = grid.findWinner();
  
    Object.assign(state, {
      xIsNext: !xIsNext,
      history: state.history.concat([grid]),
      isWon: winner !== null,
      winner,
      isFinished: grid.isOccupied() || !!winner,
      step: step + 1,
    });
  
    reload();
  }
  

  function updateStatus() {
    const { winner, xIsNext, isWon, isFinished } = state;
    let innerText;
    if (isWon) {
      const winnerColor = winner === 'X' ? 'var(--x-color)' : 'var(--o-color)';
      innerText = `Player <span class="blink-text" style="color: ${winnerColor}; font-family: 'sabo2', sans-serif;">${winner}</span> won the game!`;
    } else if (isFinished) {
      innerText = 'DRAW';
    } else {
      // Wrap the "X" and "O" in spans with the x-cell and o-cell classes and add the blink-text class for blinking effect
      const currentPlayerColor = xIsNext
        ? `<span class="x-cell blink-text-x" style="--blink-color: var(--x-blink-color); color: var(--x-color); font-family: 'sabo2', sans-serif;">X</span>`
        : `<span class="o-cell blink-text-o" style="--blink-color: var(--o-blink-color); color: var(--o-color); font-family: 'sabo2', sans-serif;">O</span>`;
      innerText = `Next player: ${currentPlayerColor}`;
    }
  
    status.innerHTML = innerText;
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

  // Add an event listener to the container element
// Add an event listener to the container element
const container = document.getElementById('container');
container.addEventListener('click', handleGridClick);

// Function to handle grid click
function handleGridClick() {
  // Show the buttons
  const buttons = document.getElementById('buttons');
  buttons.style.display = 'flex';

  // Remove the event listener on the container, so the buttons won't disappear again
  container.removeEventListener('click', handleGridClick);
}

// Function to handle reset button click
const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', handleResetClick);

// Function to handle reset button click event
function handleResetClick() {
  // Hide the buttons
  const buttons = document.getElementById('buttons');
  buttons.style.display = 'none';

  // Add back the event listener on the container, so the buttons will be hidden again when the user clicks on the grid
  container.addEventListener('click', handleGridClick);
}



  function render(handleClickCell) {
    const table = document.createElement('table')
    table.classList.add('grid');
    for (let y = 0; y < size.y; y++) {
      const row = table.insertRow()
      for (let x = 0; x < size.x; x++) {
        const cell = row.insertCell()
        const cellValue = get({ x, y });
  
        cell.innerText = cellValue;
        cell.classList.add(cellValue === 'X' ? 'x-cell' : cellValue === 'O' ? 'o-cell' : 'empty-cell');
        
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
