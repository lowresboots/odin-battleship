const Gameboard = require('../src/gameboard');
const Ship = require('../src/ship');

describe ('Gameboard', () => {
    let gameboard;

    beforeEach(() => {
        gameboard = Gameboard();
    });

    test('can place ship at specific coordinates', () => {
        const ship = Ship(3);
        gameboard.placeShip(ship, [0, 0], 'horizontal');
        expect(gameboard.getShipAt([0, 0])).toBe(ship);
        expect(gameboard.getShipAt([1, 0])).toBe(ship);
        expect(gameboard.getShipAt([2, 0])).toBe(ship);
    });

    test('receiveAttack() records missed shots', () => {
        const ship = Ship(3);
        gameboard.placeShip(ship, [0, 0], 'horizontal');
        gameboard.receiveAttack([0, 0]);
        expect(ship.hits).toBe(1);
    });

    test('reports when all ships are sunk', () => {
        const ship1 = Ship(2);
        const ship2 = Ship(1);
        gameboard.placeShip(ship1, [0, 0], 'horizontal');
        gameboard.placeShip(ship2, [0, 1], 'horizontal');

        gameboard.receiveAttack([0, 0]);
        gameboard.receiveAttack([1, 0]);
        gameboard.receiveAttack([0, 1]);

        expect(gameboard.allShipsSunk()).toBe(true);
    });
});

describe('Ship placement validation', () => {
    let gameboard;

    beforeEach(() => {
        gameboard = Gameboard();
    });

    test('prevents placing ship out of bounds horizontally', () => {
        const ship = Ship(4);
        expect(gameboard.isValidPlacement(ship, [7, 0], 'horizontal')).toBe(false);
    });

    test('prevents placing ship out of bounds vertically', () => {
        const ship = Ship(4);
        expect(gameboard.isValidPlacement(ship, [0, 7], 'vertical')).toBe(false);
    });

    test('prevents placing ships on top of each other', () => {
        const ship1 = Ship(3);
        const ship2 = Ship(3);
        gameboard.placeShip(ship1, [0, 0], 'horizontal');
        expect(gameboard.isValidPlacement(ship2, [1, 0], 'horizontal')).toBe(false);
    });

    test('allows valid ship placement', () => {
        const ship = Ship(3);
        expect(gameboard.isValidPlacement(ship, [0, 0], 'horizontal')).toBe(true);
    });
});