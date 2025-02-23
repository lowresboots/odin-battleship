const Ship = require('../src/ship');

describe('Ship', () => {
    let ship;

    beforeEach(() => {
        ship = Ship(3);
    });

    test('creates a ship with the given length', () => {
        expect(ship.length).toBe(3);
    });

    test('ship starts with 0 hits', () => {
        expect(ship.hits).toBe(0);
    });

    test('hit() increases number of hits', () => {
        ship.hit();
        expect(ship.hits).toBe(1);
    });

    test('ship is not sunk with fewer hits than length', () => {
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(false);
    });

    test('ship is sunk when hits equal length', () => {
        ship.hit();
        ship.hit();
        ship.hit();
        expect(ship.isSunk()).toBe(true);
    });
});