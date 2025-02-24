const Gameboard = require('./gameboard');

const Player = (type) => {
    const gameboard = Gameboard();
    const previousMoves = new Set();

    const attack = (coordinates, enemyGameboard) => {
        enemyGameboard.receiveAttack(coordinates);
        if (type === 'computer') {
            previousMoves.add(`${coordinates[0]},${coordinates[1]}`);
        }
    };

    const getComputerMove = () => {
        if (type !== 'computer') return null;

        let x, y;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
        } while (previousMoves.has(`${x},${y}`));

        return [x, y];
    };

    return {
        type,
        gameboard,
        attack,
        getComputerMove
    };
};

module.exports = Player;