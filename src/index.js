import './styles.css';
import Game from './game';
import Ship from './ship';

let game;
let currentShip = null;
let isRotated = false;

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
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('placement-screen').classList.remove('hidden');
  
  const shipDock = document.getElementById('ship-dock');
  const placementBoard = document.getElementById('placement-board');
  const rotateBtn = document.getElementById('rotate-btn');
  const randomBtn = document.getElementById('random-placement-btn');
  const startBtn = document.getElementById('start-game-btn');
  
  shipDock.innerHTML = '';
  game = Game();
  
  SHIPS.forEach(shipConfig => {
    const shipItem = document.createElement('div');
    shipItem.classList.add('ship-item');
    shipItem.dataset.length = shipConfig.length;
    shipItem.dataset.name = shipConfig.name;
    
    for (let i = 0; i < shipConfig.length; i++) {
      const segment = document.createElement('div');
      segment.classList.add('ship-segment');
      shipItem.appendChild(segment);
    }
    
    shipItem.draggable = true;
    shipItem.addEventListener('dragstart', handleDragStart);
    
    shipDock.appendChild(shipItem);
  });
  
  renderBoard(placementBoard, game.getHumanPlayer().gameboard, false);
  
  setupDropTargets(placementBoard);
  
  rotateBtn.addEventListener('click', () => {
    isRotated = !isRotated;
    document.querySelectorAll('.ship-item').forEach(ship => {
      ship.classList.toggle('vertical', isRotated);
    });
  });
  
  randomBtn.addEventListener('click', () => {
    randomPlacement();
    renderBoard(placementBoard, game.getHumanPlayer().gameboard, false);
    updateStartButtonState();
  });
  
  startBtn.disabled = true;
  startBtn.addEventListener('click', startGame);
  
  placementBoard.addEventListener('mouseover', handlePlacementHover);
  placementBoard.addEventListener('mouseout', clearPlacementHover);
}

function handleDragStart(e) {
  currentShip = e.target;
  
  e.dataTransfer.setData('text/plain', '');
  e.dataTransfer.effectAllowed = 'move';
}

function setupDropTargets(boardElement) {
  boardElement.innerHTML = '';
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      cell.addEventListener('dragover', e => {
        e.preventDefault();
      });
      
      cell.addEventListener('drop', handleDrop);
      
      boardElement.appendChild(cell);
    }
  }
}

function handleDrop(e) {
  e.preventDefault();
  
  if (!currentShip) return;
  
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  const length = parseInt(currentShip.dataset.length);
  const direction = isRotated ? 'vertical' : 'horizontal';
  
  try {
    const ship = Ship(length);
    game.getHumanPlayer().gameboard.placeShip(ship, [x, y], direction);
    
    currentShip.remove();
    currentShip = null;
    
    renderBoard(document.getElementById('placement-board'), game.getHumanPlayer().gameboard, false);
    
    updateStartButtonState();
    
    clearPlacementHover();
  } catch (error) {
    alert('Invalid placement! Ships cannot overlap or extend beyond the board.');
  }
}

function handlePlacementHover(e) {
  if (!e.target.classList.contains('cell') || !currentShip) return;
  
  clearPlacementHover();
  
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  const length = parseInt(currentShip.dataset.length);
  const direction = isRotated ? 'vertical' : 'horizontal';
  
  let isValid = true;
  
  if ((direction === 'horizontal' && x + length > 10) || 
      (direction === 'vertical' && y + length > 10)) {
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
    
    if (cellX < 10 && cellY < 10) {
      const cell = document.querySelector(`#placement-board .cell[data-x="${cellX}"][data-y="${cellY}"]`);
      if (cell) {
        cell.classList.add('placement-hover');
        if (!isValid) {
          cell.classList.add('invalid-placement');
        }
      }
    }
  }
}

function clearPlacementHover() {
  document.querySelectorAll('.placement-hover').forEach(cell => {
    cell.classList.remove('placement-hover');
    cell.classList.remove('invalid-placement');
  });
}

function updateStartButtonState() {
  const startBtn = document.getElementById('start-game-btn');
  const shipDock = document.getElementById('ship-dock');
  startBtn.disabled = shipDock.children.length > 0;
}

function randomPlacement() {
  game = Game();
  
  const shipDock = document.getElementById('ship-dock');
  shipDock.innerHTML = '';
  
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getHumanPlayer().gameboard, ship);
  });
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
    }
    
    attempts++;
  }
  
  return placed;
}

function startGame() {
  document.getElementById('placement-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  SHIPS.forEach(shipConfig => {
    const ship = Ship(shipConfig.length);
    placeShipRandomly(game.getComputerPlayer().gameboard, ship);
  });
  
  const playerBoardElement = document.getElementById('player-board');
  const enemyBoardElement = document.getElementById('enemy-board');
  
  renderBoard(playerBoardElement, game.getHumanPlayer().gameboard, false);
  renderBoard(enemyBoardElement, game.getComputerPlayer().gameboard, true);
  
  setupEnemyBoardHandlers(enemyBoardElement, playerBoardElement);
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
        boardElement.appendChild(cell);
      }
    }
  }
  
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
      if (!cell) continue;
      
      cell.classList.remove('ship-cell', 'hit', 'miss');
      
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