const Game = require('../models/game')
const Round = require('../models/round')
const ScoreCard = require('./scorecard')

roundData = {};
gameData = {};

gameStartCallback = function () { };
gameEndCallback = function () { };

roundStartCallback = function () { };
roundEndCallback = function () { };

const setCallbacks = function (onGameStart, onGameEnd, onRoundStart, onRoundEnd) {
    gameStartCallback = onGameStart;
    gameEndCallback = onGameEnd;

    roundStartCallback = onRoundStart;
    roundEndCallback = onRoundEnd;
}

const createGame = function (roomName, noOfRounds, timeToGuess) {
    let game = new Game(noOfRounds, timeToGuess);
    gameData[roomName] = game;
    return game;
}

const getGame = function (roomName) {
    return gameData[roomName];
}

const startGame = function (roomName) {
    let game = getGame(roomName);
    gameStartCallback(game, roomName);
    let round = createRound(roomName);
    startRound(round, roomName);
    return round;
}

const createRound = function (roomName) {
    let game = gameData[roomName];
    if (game.currentRound <= game.noOfRounds) {
        game.currentRound++
        let word = 'ball' + game.currentRound;
        let round = new Round(game.currentRound, game.timeToGuess, word);
        roundData[roomName] = round;
        return round;
    }
    return undefined;
}

const startRound = function (round, roomName) {
    roundStartCallback(getGame(roomName), round, roomName);
    console.log('setting time out: ' + round.timeToGuess);
    setTimeout(endRound, round.timeToGuess * 1000, roomName);
}

const endRound = function (roomName) {
    let round = roundData[roomName];
    roundEndCallback(getGame(roomName), round, roomName);
    saveScore(roomName);
    let nextRound = createRound(roomName);
    if (typeof (nextRound) == "undefined") {
        let game = getGame(roomName);
        gameEndCallback(game, roomName);
    }
}

const validateGuess = function (guessedWord, roomName) {
    let round = roundData[roomName];
    if (typeof (round) != "undefined") {
        return round.word == guessedWord;
    }
    return false;
}

const updateScore = function (room, playerName) {
    let round = roundData[room.roomName];
    if (typeof (round) != "undefined") {
        let winners = Object.keys(round.scores).length;
        round.scores[playerName] = (room.players.length - winners) * 10;
        console.log(playerName + ' scored ' + round.scores[playerName] + ' points');
    }
}

const saveScore = function (roomName) {
    console.log('saving scores...');
    let round = roundData[roomName];
    for (var playerName in round.scores) {
        var score = round.scores[playerName];
        console.log(playerName + ': ' + score);
    }
    ScoreCard.updateScoreCard(round, roomName);
}

module.exports = { setCallbacks, createGame, startGame, getGame, createRound, validateGuess, updateScore, saveScore }