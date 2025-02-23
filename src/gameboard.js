const Gameboard = () => {
    const board = Array(10).fill().map(() => Array(10).fill(null));
    const ships = [];
    const missedShots = [];

    const placeShip = (ship, [x, y], direction) => {
        ships.push(ship);

        if (direction === 'horizontal') {
            for (let i = 0; i < ship.length; i++) {
                board[y][x + i] = ship;
            }
        } else {
            for (let i = 0; i < ship.length; i++) {
                board[y + i][x] = ship;
            }
        }
    };

    const getShipAt = ([x, y]) => {
        return board [y][x];
    };

    const receiveAttack = ([x, y]) => {
        const ship = board[y][x];
        if (ship) {
            ship.hit();
        } else {
            missedShots.push([x, y]);
        }
    };

    const getMissedShots = () => {
        return [...missedShots];
    };

    const allShipsSunk = () => {
        return ships.every(ship => ship.isSunk());
    };

    return {
        placeShip,
        getShipAt,
        receiveAttack,
        getMissedShots,
        allShipsSunk
    };
};

module.exports = Gameboard;