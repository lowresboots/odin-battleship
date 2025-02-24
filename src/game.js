const Player = require('./player');

const Game = () => {
    const humanPlayer = Player('human');
    const computerPlayer = Player('computer');
    let currentPlayer = humanPlayer;

    const playTurn = (coordinates) => {
        if (currentPlayer === humanPlayer) {
            humanPlayer.attack(coordinates, computerPlayer.gameboard);
            currentPlayer = computerPlayer;

            if (!isGameOver()) {
                const computerMove = computerPlayer.getComputerMove();
                computerPlayer.attack(computerMove, humanPlayer.gameboard);
                currentPlayer = humanPlayer;
            }
        }
    };

    const isGameOver = () => {
        return humanPlayer.gameboard.allShipsSunk() ||
        computerPlayer.gameboard.allShipsSunk();
    };

    const getWinner = () => {
        return humanPlayer.gameboard.allShipsSunk() ||
        computerPlayer.gameboard.allShipsSunk();
    };

    const getCurrentPlayer = () => currentPlayer;
    const getHumanPlayer = () => humanPlayer;
    const getComputerPlayer = () => computerPlayer;

    return {
        playTurn,
        isGameOver,
        getWinner,
        getCurrentPlayer,
        getHumanPlayer,
        getComputerPlayer
    };
};

module.exports = Game;