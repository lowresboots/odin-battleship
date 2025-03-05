import './styles.css';
import Game from './game';
import Ship from './ship';

document.addEventListener('DOMContentLoaded', () => {
    const game = Game();
    
    placeTestShips(game);
    
    const playerBoardElement = document.getElementById('player-board');
    const enemyBoardElement = document.getElementById('enemy-board');

    renderPlayerBoard(game, playerBoardElement);
    renderEnemyBoard(game, enemyBoardElement);

    setupEnemyBoardHandlers(game, enemyBoardElement, playerBoardElement);
});

function placeTestShips(game) {
    const playerBoard = game.getHumanPlayer().gameboard;
    const computerBoard = game.getComputerPlayer().gameboard;

    const carrier = Ship(5);
    const battleship = Ship(4);
    const cruiser = Ship(3);
    const submarine = Ship(3);
    const destroyer = Ship(2);
    
    try {
        playerBoard.placeShip(carrier, [0, 0], 'horizontal');
        playerBoard.placeShip(battleship, [0, 2], 'horizontal');
        playerBoard.placeShip(cruiser, [0, 4], 'horizontal');
        playerBoard.placeShip(submarine, [0, 6], 'horizontal');
        playerBoard.placeShip(destroyer, [0, 8], 'horizontal');
    } catch (error) {
        console.error('Error placing ships:', error);
    }

    computerBoard.placeShipRandomly(Ship(5));
    computerBoard.placeShipRandomly(Ship(4));
    computerBoard.placeShipRandomly(Ship(3));
    computerBoard.placeShipRandomly(Ship(3));
    computerBoard.placeShipRandomly(Ship(2));
}

function renderPlayerBoard(game, boardElement) {
    const playerGameboard = game.getHumanPlayer().gameboard;
    renderBoard(boardElement, playerGameboard, false);
}

function renderEnemyBoard(game, boardElement) {
    const enemyGameboard = game.getComputerPlayer().gameboard;
    renderBoard(boardElement, enemyGameboard, true);
}

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

function setupEnemyBoardHandlers(game, enemyBoardElement, playerBoardElement) {
    enemyBoardElement.addEventListener('click', (e) => {
        if (!e.target.classList.contains('cell')) return;
        
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        
        try {
            game.playTurn([x, y]);

            renderPlayerBoard(game, playerBoardElement);
            renderEnemyBoard(game, enemyBoardElement);

            if (game.isGameOver()) {
                // Fix: Check specifically which condition triggered game over
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