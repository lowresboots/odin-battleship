import './styles.css';
import Game from './game';
import Ship from './ship';

// Global variables
let game;
let currentShipIndex = 0;
let isRotated = false;

// Ship definitions
const SHIPS = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 }
];

document.addEventListener('DOMContentLoaded', () => {
  // Create a new game
  game = Game();
  
  // Initialize the placement screen
  initPlacementScreen();
});

function initPlacementScreen() {
  // Show placement screen, hide game screen
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('placement-screen').classList.remove('hidden');
  
  // Reset game and current ship index
  game = Game();
  currentShipIndex = 0;
  isRotated = false;
  
  // Set initial instructions
  updatePlacementInstructions();
  
  // Setup the placement board
  setupPlacementBoard();
  
  // Rotate button
  const rotateBtn = document.getElementById('rotate-btn');
  rotateBtn.addEventListener('click', () => {
    isRotated = !isRotated;
    
    // Re-trigger hover effect on the current hovered cell
    const hoveredCell = document.querySelector('.placement-hover');
    if (hoveredCell) {
      const x = parseInt(hoveredCell.dataset.x);
      const y = parseInt(hoveredCell.dataset.y);
      const cell = document.querySelector(`#placement-board .cell[data-x="${x}"][data-y="${y}"]`);
      if (cell) {
        showPlacementPreview(cell);
      }
    }
  });
  
  // Random placement button
  const randomBtn = document.getElementById('random-placement-btn');
  randomBtn.addEventListener('click', () => {
    randomPlacement();
  });
  
  // Start game button - initially hidden until all ships are placed
  const startBtn = document.getElementById('start-game-btn');
  startBtn.classList.add('hidden');
  startBtn.addEventListener('click', startGame);
  
  // Add confirm yes/no buttons
  const confirmYesBtn = document.getElementById('confirm-yes-btn');
  confirmYesBtn.classList.add('hidden');
  confirmYesBtn.addEventListener('click', startGame);
  
  const confirmNoBtn = document.getElementById('confirm-no-btn');
  confirmNoBtn.classList.add('hidden');
  confirmNoBtn.addEventListener('click', () => {
    // Reset the game for new placement
    game = Game();
    currentShipIndex = 0;
    isRotated = false;
    updatePlacementInstructions();
    renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
  });
}

function updatePlacementInstructions() {
  const instructionsElement = document.getElementById('placement-instructions');
  
  if (currentShipIndex < SHIPS.length) {
    const currentShip = SHIPS[currentShipIndex];
    instructionsElement.textContent = `Place your ${currentShip.name}`;
    
    // Show standard placement buttons
    document.getElementById('rotate-btn').textContent = 'Rotate Ship';
    document.getElementById('random-placement-btn').textContent = 'Random Placement';
    document.getElementById('rotate-btn').classList.remove('hidden');
    document.getElementById('random-placement-btn').classList.remove('hidden');
    document.getElementById('confirm-yes-btn').classList.add('hidden');
    document.getElementById('confirm-no-btn').classList.add('hidden');
  } else {
    // All ships placed, ask for confirmation
    instructionsElement.textContent = 'Is this okay?';
    
    // Hide placement buttons, show confirmation buttons
    document.getElementById('rotate-btn').classList.add('hidden');
    document.getElementById('random-placement-btn').classList.add('hidden');
    document.getElementById('confirm-yes-btn').classList.remove('hidden');
    document.getElementById('confirm-no-btn').classList.remove('hidden');
  }
}

function setupPlacementBoard() {
  const placementBoard = document.getElementById('placement-board');
  
  // Clear the board
  placementBoard.innerHTML = '';
  
  // Create cells for the board
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      // Add hover event to show ship placement preview
      cell.addEventListener('mouseover', () => {
        if (currentShipIndex < SHIPS.length) {
          showPlacementPreview(cell);
        }
      });
      
      // Add mouseout event to clear preview when leaving the board
      cell.addEventListener('mouseout', () => {
        // Only clear if we're not hovering another cell on the board
        const hoveredElements = document.querySelectorAll(':hover');
        const isHoveringBoard = Array.from(hoveredElements).some(el => 
          el.id === 'placement-board' || el.classList.contains('cell')
        );
        
        if (!isHoveringBoard) {
          clearHoverEffects();
        }
      });
      
      // Add click event to place the current ship
      cell.addEventListener('click', () => {
        if (currentShipIndex < SHIPS.length) {
          placeShipAtCell(cell);
        }
      });
      
      placementBoard.appendChild(cell);
    }
  }
}

function showPlacementPreview(cell) {
  // Clear any existing hover effects
  clearHoverEffects();
  
  if (currentShipIndex >= SHIPS.length) return;
  
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const currentShip = SHIPS[currentShipIndex];
  const length = currentShip.length;
  const direction = isRotated ? 'vertical' : 'horizontal';
  
  // Check if placement would be valid
  let isValid = true;
  
  // Check boundaries
  const outOfBounds = (direction === 'horizontal' && x + length > 10) || 
                      (direction === 'vertical' && y + length > 10);
  
  if (outOfBounds) {
    isValid = false;
  }
  
  // Check for overlapping ships
  if (isValid) {
    for (let i = 0; i < length; i++) {
      const checkX = direction === 'horizontal' ? x + i : x;
      const checkY = direction === 'vertical' ? y + i : y;
      
      if (checkX < 10 && checkY < 10) {
        const ship = game.getHumanPlayer().gameboard.getShipAt([checkX, checkY]);
        if (ship) {
          isValid = false;
          break;
        }
      }
    }
  }
  
  // Show placement preview only for cells that are within the board
  for (let i = 0; i < length; i++) {
    const cellX = direction === 'horizontal' ? x + i : x;
    const cellY = direction === 'vertical' ? y + i : y;
    
    // Only show cells that are within the board
    if (cellX >= 0 && cellX < 10 && cellY >= 0 && cellY < 10) {
      const targetCell = document.querySelector(`#placement-board .cell[data-x="${cellX}"][data-y="${cellY}"]`);
      if (targetCell) {
        targetCell.classList.add('placement-hover');
        if (!isValid) {
          targetCell.classList.add('invalid-placement');
        }
      }
    }
  }
}

function clearHoverEffects() {
  document.querySelectorAll('.placement-hover').forEach(cell => {
    cell.classList.remove('placement-hover');
    cell.classList.remove('invalid-placement');
  });
}

function placeShipAtCell(cell) {
  if (currentShipIndex >= SHIPS.length) return;
  
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const currentShip = SHIPS[currentShipIndex];
  const length = currentShip.length;
  const direction = isRotated ? 'vertical' : 'horizontal';
  
  try {
    // Create a new ship and place it on the board
    const ship = Ship(length);
    game.getHumanPlayer().gameboard.placeShip(ship, [x, y], direction);
    
    // Move to the next ship
    currentShipIndex++;
    
    // Update instructions for the next ship
    updatePlacementInstructions();
    
    // Update the board display
    renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
    
    // Clear hover effects
    clearHoverEffects();
  } catch (error) {
    alert('Invalid placement! Ships cannot overlap or extend beyond the board.');
  }
}

function randomPlacement() {
  // Clear existing ships
  game = Game();
  currentShipIndex = SHIPS.length; // Set to all ships placed
  
  // Place ships randomly
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getHumanPlayer().gameboard, ship);
  });
  
  // Update instructions and buttons
  updatePlacementInstructions();
  renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
}

function placeShipRandomly(gameboard, ship) {
  let placed = false;
  let attempts = 0;
  
  while (!placed && attempts < 100) {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
    
    try {
      gameboard.placeShip(ship, [x, y], direction);
      placed = true;
    } catch (error) {
      // Try again
    }
    
    attempts++;
  }
  
  return placed;
}

function startGame() {
  // Hide placement screen, show game screen
  document.getElementById('placement-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  // Place ships for computer
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getComputerPlayer().gameboard, ship);
  });
  
  // Render the game boards
  const playerBoardElement = document.getElementById('player-board');
  const enemyBoardElement = document.getElementById('enemy-board');
  
  renderBoard(playerBoardElement, game.getHumanPlayer().gameboard, false);
  renderBoard(enemyBoardElement, game.getComputerPlayer().gameboard, true);
  
  // Setup attack handlers
  setupEnemyBoardHandlers(enemyBoardElement, playerBoardElement);
}

function renderBoard(boardElement, gameboard, isEnemy) {
  // We only want to create new cells if this isn't the placement board
  if (boardElement.id !== 'placement-board') {
    boardElement.innerHTML = '';
    
    // Create cells for the board
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;
        boardElement.appendChild(cell);
      }
    }
  }
  
  // Update cell styles based on ships and hits
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
      if (!cell) continue;
      
      // Clear existing classes
      cell.classList.remove('ship-cell', 'hit', 'miss');
      
      const ship = gameboard.getShipAt([x, y]);
      
      // Show ships on player's board
      if (ship && !isEnemy) {
        cell.classList.add('ship-cell');
      }
      
      // Show hits and misses
      const missedShots = gameboard.getMissedShots();
      if (missedShots.some(shot => shot[0] === x && shot[1] === y)) {
        cell.classList.add('miss');
      } else if (ship && ship.hits > 0) {
        cell.classList.add('hit');
      }
    }
  }
}

function setupEnemyBoardHandlers(enemyBoardElement, playerBoardElement) {
  enemyBoardElement.addEventListener('click', (e) => {
    if (!e.target.classList.contains('cell')) return;
    
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    
    try {
      game.playTurn([x, y]);
      
      renderBoard(playerBoardElement, game.getHumanPlayer().gameboard, false);
      renderBoard(enemyBoardElement, game.getComputerPlayer().gameboard, true);
      
      if (game.isGameOver()) {
        if (game.getComputerPlayer().gameboard.allShipsSunk()) {
          alert('You win! All enemy ships have been sunk!');
        } else {
          alert('Computer wins! Your fleet has been destroyed!');
        }
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  });
}