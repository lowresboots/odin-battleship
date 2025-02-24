const Game = require('../src/game');
const Player = require('../src/player');

describe('Game', () => {
    let game;

    beforeEach(() => {
        game = Game();
    });

    test('initializes with human and computer player', () => {
        expect(game.getHumanPlayer().type).toBe('human');
        expect(game.getComputerPlayer().type).toBe('computer');
    });

    test('starts with human player turn', () => {
        expect(game.getCurrentPlayer().type).toBe('human');
    });

    test('switches turns after attack', () => {
        const computerBoard = game.getComputerPlayer().gameboard;
        game.playTurn([0, 0]);
        expect(game.getCurrentPlayer().type).toBe('computer');
    });

    test('identifies when game is over', () => {
        const computerBoard = game.getComputerPlayer().gameboard;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                game.playTurn([i, j]);
            }
        }
        expect(game.isGameOver()).toBe(true);
    });
});