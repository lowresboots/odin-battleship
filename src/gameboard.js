const Gameboard = () => {
    const board = Array(10).fill().map(() => Array(10).fill(null));
    const ships = [];
    const missedShots = [];

    const isValidPlacement = (ship, [x, y], direction) => {
        if (direction === 'horizontal') {
            if (x + ship.length > 10) return false;
        } else {
            if (y + ship.length > 10) return false;
        }

        for (let i = 0; i < ship.length; i++) {
            if (direction === 'horizontal') {
                if (board[y][x + i] !== null) return false;
            } else {
                if (board[y + i][x] !== null) return false;
            }
        }

        return true;
    }

    const placeShip = (ship, [x, y], direction) => {
        if (!isValidPlacement(ship, [x, y], direction)) {
            throw new Error('Invalid ship placement');
        }
        
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

    const placeShipRandomly = (ship) => {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

            if (isValidPlacement(ship, [x, y], direction)) {
                placeShip(ship, [x, y], direction);
                placed = true;
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
        placeShipRandomly,
        isValidPlacement,
        getShipAt,
        receiveAttack,
        getMissedShots,
        allShipsSunk
    };
};

module.exports = Gameboard;