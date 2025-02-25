const Gameboard = require('./gameboard');

const Player = (type) => {
    const gameboard = Gameboard();
    const previousMoves = new Set();
    const successfulHits = [];
    let lastHit = null;

    const attack = (coordinates, enemyGameboard) => {
        const [x, y] = coordinates;
        previousMoves.add(`${x},${y}`);

        const beforeHits = enemyGameboard.getShipAt([x, y])?.hits || 0;
        
        enemyGameboard.receiveAttack([x, y]);

        const afterHits = enemyGameboard.getShipAt([x, y])?.hits || 0;
        if (afterHits > beforeHits) {
            lastHit = [x, y];
            successfulHits.push([x, y]);
        }
    };

    const isValidMove = ([x, y]) => {
        return x >= 0 && x < 10 && y >= 0 && y < 10 && !previousMoves.has(`${x},${y}`);
    };

    const getAdjacentCoordinates = ([x, y]) => {
        return [
            [x + 1, y],
            [x - 1, y],
            [x, y + 1],
            [x, y - 1]
        ].filter(coord => isValidMove(coord));
    };

    const getComputerMove = () => {
        if (type !== 'computer') return null;

        if (lastHit) {
            const adjacentMoves = getAdjacentCoordinates(lastHit);
            if (adjacentMoves.length > 0) {
                const moveIndex = Math.floor(Math.random() * adjacentMoves.length);
                return adjacentMoves[moveIndex];
            }

            lastHit = null;
        }

        for (let i = successfulHits.length - 1; i >= 0; i--) {
            const adjacentMoves = getAdjacentCoordinates(successfulHits[i]);
            if (adjacentMoves.length > 0) {
                const moveIndex = Math.floor(Math.random() * adjacentMoves.length);
                return adjacentMoves[moveIndex];
            }
        }

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