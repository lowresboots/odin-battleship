import './styles.css';
import Game from './game';
import Ship from './ship';

// Global variables
let game;
let currentShipIndex = 0;
let isRotated = false;
let gameOver = false; // Flag to track game over state

// Track hit positions for traditional Battleship experience
const humanHits = new Set();
const computerHits = new Set();

// Store direct references to ships by name
let humanFleet = {};
let computerFleet = {};

// Ship definitions
const SHIPS = [
  { name: 'Carrier', length: 5 },
  { name: 'Battleship', length: 4 },
  { name: 'Cruiser', length: 3 },
  { name: 'Submarine', length: 3 },
  { name: 'Destroyer', length: 2 }
];

document.addEventListener('DOMContentLoaded', () => {
  game = Game();
  
  initPlacementScreen();
});

function initPlacementScreen() {
  // Ensure placement screen is visible and game screen is hidden
  document.getElementById('placement-screen').classList.remove('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  
  // Reset game state
  game = Game();
  currentShipIndex = 0;
  isRotated = false;
  gameOver = false;
  humanHits.clear();
  computerHits.clear();
  humanFleet = {};
  computerFleet = {};
  
  updatePlacementInstructions();
  setupPlacementBoard();
  
  // Rotate button functionality
  const rotateBtn = document.getElementById('rotate-btn');
  rotateBtn.addEventListener('click', () => {
    isRotated = !isRotated;
    
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
  
  // Confirmation buttons
  const confirmYesBtn = document.getElementById('confirm-yes-btn');
  confirmYesBtn.classList.add('hidden');
  confirmYesBtn.addEventListener('click', startGame);
  
  const confirmNoBtn = document.getElementById('confirm-no-btn');
  confirmNoBtn.classList.add('hidden');
  confirmNoBtn.addEventListener('click', () => {
    game = Game();
    currentShipIndex = 0;
    isRotated = false;
    humanFleet = {};
    updatePlacementInstructions();
    renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
  });
}

function updatePlacementInstructions() {
  const instructionsElement = document.getElementById('placement-instructions');
  
  if (currentShipIndex < SHIPS.length) {
    const currentShip = SHIPS[currentShipIndex];
    instructionsElement.textContent = `Place your ${currentShip.name}`;
    
    document.getElementById('rotate-btn').classList.remove('hidden');
    document.getElementById('random-placement-btn').classList.remove('hidden');
    document.getElementById('confirm-yes-btn').classList.add('hidden');
    document.getElementById('confirm-no-btn').classList.add('hidden');
  } else {
    instructionsElement.textContent = 'Is this okay?';
    
    document.getElementById('rotate-btn').classList.add('hidden');
    document.getElementById('random-placement-btn').classList.add('hidden');
    document.getElementById('confirm-yes-btn').classList.remove('hidden');
    document.getElementById('confirm-no-btn').classList.remove('hidden');
  }
}

function setupPlacementBoard() {
  const placementBoard = document.getElementById('placement-board');
  
  placementBoard.innerHTML = '';
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      cell.addEventListener('mouseover', () => {
        if (currentShipIndex < SHIPS.length) {
          showPlacementPreview(cell);
        }
      });
      
      cell.addEventListener('mouseout', () => {
        const hoveredElements = document.querySelectorAll(':hover');
        const isHoveringBoard = Array.from(hoveredElements).some(el => 
          el.id === 'placement-board' || el.classList.contains('cell')
        );
        
        if (!isHoveringBoard) {
          clearHoverEffects();
        }
      });
      
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
  clearHoverEffects();
  
  if (currentShipIndex >= SHIPS.length) return;
  
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const currentShip = SHIPS[currentShipIndex];
  const length = currentShip.length;
  const direction = isRotated ? 'vertical' : 'horizontal';
  
  let isValid = true;
  
  const outOfBounds = (direction === 'horizontal' && x + length > 10) || 
                      (direction === 'vertical' && y + length > 10);
  
  if (outOfBounds) {
    isValid = false;
  }
  
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
  
  for (let i = 0; i < length; i++) {
    const cellX = direction === 'horizontal' ? x + i : x;
    const cellY = direction === 'vertical' ? y + i : y;
    
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
    const ship = Ship(length);
    game.getHumanPlayer().gameboard.placeShip(ship, [x, y], direction);
    
    // Store the ship directly in humanFleet for consistent tracking
    humanFleet[currentShip.name] = ship;
    
    currentShipIndex++;
    
    updatePlacementInstructions();
    
    renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
    
    clearHoverEffects();
  } catch (error) {
    alert('Invalid placement! Ships cannot overlap or extend beyond the board.');
  }
}

function randomPlacement() {
  game = Game();
  currentShipIndex = SHIPS.length;
  humanFleet = {};
  
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getHumanPlayer().gameboard, ship);
    // Store each ship directly in humanFleet
    humanFleet[shipConfig.name] = ship;
  });
  
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
  // Hide placement screen and show game screen
  document.getElementById('placement-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  // Reset game over state
  gameOver = false;
  
  // Place ships for computer and store them directly
  computerFleet = {};
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getComputerPlayer().gameboard, ship);
    // Store each ship in computerFleet
    computerFleet[shipConfig.name] = ship;
  });
  
  // Render the game boards
  const playerBoardElement = document.getElementById('player-board');
  const enemyBoardElement = document.getElementById('enemy-board');
  
  renderBoard(playerBoardElement, game.getHumanPlayer().gameboard, false);
  renderBoard(enemyBoardElement, game.getComputerPlayer().gameboard, true);
  
  // Setup attack handlers
  setupEnemyBoardHandlers(enemyBoardElement, playerBoardElement);
  
  // Initialize fleet status
  updateFleetStatus();
}

function renderBoard(boardElement, gameboard, isEnemy) {
  if (boardElement.id !== 'placement-board') {
    boardElement.innerHTML = '';
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;
        
        // For enemy board, add data attribute to track if it's been attacked
        if (isEnemy) {
          const coordKey = `${x},${y}`;
          if (humanHits.has(coordKey) || gameboard.getMissedShots().some(shot => shot[0] === x && shot[1] === y)) {
            cell.dataset.attacked = 'true';
          }
        }
        
        boardElement.appendChild(cell);
      }
    }
  }
  
  // First pass: find all ships and their coordinates
  const shipMap = new Map(); // Maps ships to all their coordinates
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const ship = gameboard.getShipAt([x, y]);
      if (ship) {
        if (!shipMap.has(ship)) {
          shipMap.set(ship, []);
        }
        shipMap.get(ship).push([x, y]);
      }
    }
  }
  
  // Second pass: render cells
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
      if (!cell) continue;
      
      cell.classList.remove('ship-cell', 'hit', 'miss', 'sunk');
      
      const ship = gameboard.getShipAt([x, y]);
      
      // Handle missed shots
      const missedShots = gameboard.getMissedShots();
      const hasBeenMissed = missedShots.some(shot => shot[0] === x && shot[1] === y);
      
      if (hasBeenMissed) {
        cell.classList.add('miss');
      } else if (ship) {
        if (isEnemy) {
          // For enemy board in traditional Battleship:
          // Check if this specific coordinate has been hit by the human player
          const coordKey = `${x},${y}`;
          const hasBeenHit = humanHits.has(coordKey);
          
          if (ship.isSunk()) {
            // If ship is sunk, show all its cells as sunk
            cell.classList.add('sunk');
          } else if (hasBeenHit) {
            // If just hit but not sunk, show as hit
            cell.classList.add('hit');
          }
          // Otherwise show nothing (just water)
        } else {
          // For player's board, show all ships
          cell.classList.add('ship-cell');
          
          // If ship has any hits at all
          if (ship.hits > 0) {
            // Make the whole ship red (hit) if not sunk
            if (!ship.isSunk()) {
              cell.classList.add('hit');
              
              // If this specific cell was hit, make it dark red
              const coordKey = `${x},${y}`;
              if (computerHits.has(coordKey)) {
                cell.classList.remove('hit');
                cell.classList.add('sunk');
              }
            } else {
              // If ship is fully sunk, all cells are dark red
              cell.classList.add('sunk');
            }
          }
        }
      }
    }
  }
}

function updateFleetStatus() {
  const playerFleetList = document.getElementById('player-fleet-list');
  const enemyFleetList = document.getElementById('enemy-fleet-list');
  
  playerFleetList.innerHTML = '';
  enemyFleetList.innerHTML = '';
  
  // Create fleet items directly using our stored ship references
  SHIPS.forEach((shipConfig) => {
    // Create player fleet item
    const playerItem = document.createElement('li');
    playerItem.classList.add('fleet-item');
    playerItem.textContent = shipConfig.name;
    
    // Get the ship directly from humanFleet
    const playerShip = humanFleet[shipConfig.name];
    if (playerShip) {
      if (playerShip.isSunk()) {
        playerItem.classList.add('sunk');
      } else if (playerShip.hits > 0) {
        playerItem.classList.add('hit');
      } else {
        playerItem.classList.add('active');
      }
    }
    
    // Create enemy fleet item
    const enemyItem = document.createElement('li');
    enemyItem.classList.add('fleet-item');
    enemyItem.textContent = shipConfig.name;
    
    // Get the ship directly from computerFleet
    const enemyShip = computerFleet[shipConfig.name];
    if (enemyShip) {
      if (enemyShip.isSunk()) {
        enemyItem.classList.add('sunk');
      } else if (enemyShip.hits > 0) {
        enemyItem.classList.add('hit');
      } else {
        enemyItem.classList.add('active');
      }
    }
    
    playerFleetList.appendChild(playerItem);
    enemyFleetList.appendChild(enemyItem);
  });
}

function setupEnemyBoardHandlers(enemyBoardElement, playerBoardElement) {
  enemyBoardElement.addEventListener('click', (e) => {
    // Check if game is over - prevent any moves after game ends
    if (gameOver) return;
    
    if (!e.target.classList.contains('cell')) return;
    
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    
    // Check if this cell has already been attacked
    if (e.target.dataset.attacked === 'true') {
      // Cell already attacked, do nothing
      return;
    }
    
    try {
      // Check if there's a ship at this location before making the move
      const enemyGameboard = game.getComputerPlayer().gameboard;
      const humanGameboard = game.getHumanPlayer().gameboard;
      const shipBefore = enemyGameboard.getShipAt([x, y]);
      
      // Mark this cell as attacked
      e.target.dataset.attacked = 'true';
      
      // Save current state of computerHits for comparison after the move
      const computerHitsBefore = new Set(computerHits);
      
      // Make the move (which also triggers computer's move)
      game.playTurn([x, y]);
      
      // Check if a ship was hit after the move
      const shipAfter = enemyGameboard.getShipAt([x, y]);
      
      // If this was a successful hit, record it for traditional rendering
      if (shipAfter && shipAfter.hits > 0) {
        humanHits.add(`${x},${y}`);
      }
      
      // Find the computer's exact new hit - with improved tracking
      let computerHitAdded = false;
      for (let cy = 0; cy < 10 && !computerHitAdded; cy++) {
        for (let cx = 0; cx < 10 && !computerHitAdded; cx++) {
          const coordKey = `${cx},${cy}`;
          if (computerHitsBefore.has(coordKey)) continue;
          
          const ship = humanGameboard.getShipAt([cx, cy]);
          if (ship && ship.hits > countHitsOnShip(ship, computerHitsBefore)) {
            computerHits.add(coordKey);
            computerHitAdded = true; // Ensure we only add one hit per turn
          }
        }
      }
      
      // Update both boards
      renderBoard(playerBoardElement, game.getHumanPlayer().gameboard, false);
      renderBoard(enemyBoardElement, game.getComputerPlayer().gameboard, true);
      
      // Update fleet status
      updateFleetStatus();
      
      // Check for game over
      if (game.isGameOver()) {
        gameOver = true; // Set game over flag to prevent further moves
        
        if (game.getComputerPlayer().gameboard.allShipsSunk()) {
          alert('You win! All enemy ships have been sunk!');
        } else {
          alert('Computer wins! Your fleet has been destroyed!');
        }
        
        // Optional: Add a "Play Again" button
        const playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = 'Play Again';
        playAgainBtn.style.margin = '20px auto';
        playAgainBtn.style.display = 'block';
        playAgainBtn.addEventListener('click', initPlacementScreen);
        document.getElementById('game-screen').appendChild(playAgainBtn);
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
  });
}

// Helper function to count hits on a specific ship based on our tracking
function countHitsOnShip(targetShip, hitSet) {
  let count = 0;
  
  // Loop through all cells to find hits on this specific ship
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const coordKey = `${x},${y}`;
      if (hitSet.has(coordKey)) {
        const ship = game.getHumanPlayer().gameboard.getShipAt([x, y]);
        if (ship === targetShip) {
          count++;
        }
      }
    }
  }
  
  return count;
}