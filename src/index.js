import './styles.css';
import Game from './game';
import Ship from './ship';

// Global game variable
let game;

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
  
  // Show placement screen first
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('placement-screen').classList.remove('hidden');
  
  // Setup placement board
  const placementBoard = document.getElementById('placement-board');
  renderBoard(placementBoard, game.getHumanPlayer().gameboard, false);
  
  // Random placement button
  document.getElementById('random-placement-btn').addEventListener('click', () => {
    randomPlacement();
    renderBoard(placementBoard, game.getHumanPlayer().gameboard, false);
  });
  
  // Start game button
  document.getElementById('start-game-btn').addEventListener('click', () => {
    startGame();
  });
});

// Place ships randomly
function randomPlacement() {
  // Clear any existing ships
  game = Game(); // Recreate game to get fresh boards
  
  // Place ships for player
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    try {
      const placed = placeShipRandomly(game.getHumanPlayer().gameboard, ship);
      if (!placed) {
        console.error(`Failed to place ${shipConfig.name}`);
      }
    } catch (error) {
      console.error(`Error placing ${shipConfig.name}:`, error);
    }
  });
}

// Custom random placement function
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

// Start the game
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

// Your existing renderBoard function
function renderBoard(boardElement, gameboard, isEnemy) {
  boardElement.innerHTML = '';
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      const ship = gameboard.getShipAt([x, y]);
      
      if (ship && !isEnemy) {
        cell.classList.add('ship-cell');
      }
      
      const missedShots = gameboard.getMissedShots();
      if (missedShots.some(shot => shot[0] === x && shot[1] === y)) {
        cell.classList.add('miss');
      } else if (ship && ship.hits > 0) {
        cell.classList.add('hit');
      }
      
      boardElement.appendChild(cell);
    }
  }
}

// Your existing attack handlers
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