const Player = require('../src/player');
const Gameboard = require('../src/gameboard');
const Ship = require('../src/ship')

describe('Player', () => {
    let player;
    let enemyGameboard;

    beforeEach(() => {
        player = Player('human');
        enemyGameboard = Gameboard();
    });

    test('player has their own gameboard', () => {
        expect(player.gameboard).toBeDefined();
    });

    test('player can attack enemy gameboard', () => {
        player.attack([0, 0], enemyGameboard);
        expect(enemyGameboard.getMissedShots()).toContainEqual([0, 0]);
    });

    test('computer player makes random but legal moves', () => {
        const computer = Player('computer');
        const gameBoard = Gameboard();

        const moves = new Set();
        for (let i = 0; i < 20; i++) {
            const [x, y] = computer.getComputerMove();
            moves.add(`${x},${y}`);
            computer.attack([x, y], gameBoard);
        }

        expect(moves.size).toBe(20);
    });
});

describe('Smart computer moves', () => {
    let computer;
    let enemyBoard;

    beforeEach(() => {
        computer = Player('computer');
        enemyBoard = Gameboard();
        const ship = Ship(3);
        enemyBoard.placeShip(ship, [5, 5], 'horizontal');
    });

    test('computer targets adjacent slots after a hit', () => {
        computer.attack([5, 5], enemyBoard);

        const [x, y] = computer.getComputerMove();
        expect(
            [[4, 5], [6, 5], [5, 4], [5,6]].some(
                ([adjX, adjY]) => x === adjX && y === adjY
            )
        ).toBe(true);
    });
});