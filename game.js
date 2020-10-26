const gameboard = (() => {
    const state = [0,0,0,0,0,0,0,0,0];
    const placeSymbol = (value, square) => {
        state[square] = value;
    }
    return {state, placeSymbol};
})();

const createPlayer = (name, symbol, value, ai=false) => {
    return {name, symbol, value, ai};
}

const gameController = (() => {
    const _player1 = createPlayer('Player 1', 'x', 1);
    const _player2 = createPlayer('Player 2', 'o', -1);
    const _players = [];
    _players.push(_player1, _player2)
    let _currentPlayer = _players[0];
    let _gameEnded = false;
    let _availableSquares = [0,1,2,3,4,5,6,7,8];

    const renamePlayers = () => {
        if (!_gameEnded) {
            const player1Name = displayController.getPlayerName(1);
            _player1.name = player1Name? player1Name : _player1.name;
            const player2Name = displayController.getPlayerName(2);
            _player2.name = player2Name? player2Name : _player2.name;
            displayController.showMessage(`${_currentPlayer.name}'s turn`);
        };
    };
    
    const getCurrentPlayer = () => {
        return _currentPlayer;
    }
    
    const _changePlayer = () => {
        if (_currentPlayer === _player1) {
            _currentPlayer = _player2;
        }
        else _currentPlayer = _player1;
    };
    
    const _checkGameEnded = (board, index) => {
        const row = Math.floor(index/3);
        const col = index % 3;
        let gameEnded;
        let winningSquares = [];
        let winningPlayer = null;
        //Check row
        if (board[row*3]==board[row*3+1] && board[row*3]==board[row*3+2]) {
            winningSquares.push(3*row, 3*row+1, 3*row+2);
            gameEnded = true;
            winningPlayer = _players.filter(player => player.value==board[row*3])[0];
        }
        //Check column
        else if (board[col]==board[col+3] && board[col]==board[col+6]) {
            winningSquares.push(col, col+3, col+6);
            gameEnded = true;
            winningPlayer = _players.filter(player => player.value==board[col])[0];
        }
        //Check diagonals
        else if ((row==col) && (board[0] && board[0]==board[4] && board[0]==board[8])) {
            winningSquares.push(0, 4, 8);
            gameEnded = true;
            winningPlayer = _players.filter(player => player.value==board[0])[0];
        }
        else if ((col==2-row) && (board[2] && board[2]==board[4] && board[2]==board[6])) {
            winningSquares.push(2, 4 ,6);
            gameEnded = true;
            winningPlayer = _players.filter(player => player.value==board[2])[0];
        }
        //Check if tie
        else if (!board.includes(0)) {
            gameEnded = 'tie';
        }
        else gameEnded = false;
        return {gameEnded, winningSquares, winningPlayer};
    }
    
    const playTurn = (index) => {
        if (!_gameEnded) {
            displayController.markBoard(index);
            _availableSquares.splice(_availableSquares.indexOf(index), 1);
            outcome = _checkGameEnded(gameboard.state, index);
            _gameEnded = outcome.gameEnded;
            winningSquares = outcome.winningSquares;
        }
        switch (_gameEnded) {
            case 'tie':
                displayController.showMessage('It\'s a tie!');
                break;
            case true:
                const winningPlayer = outcome.winningPlayer;
                if (winningPlayer) displayController.showMessage(`${winningPlayer.name} Wins!`);
                winningSquares.forEach(index => {
                    displayController.colorSquare(index, 'red');
                });
        }
        if (_gameEnded) {
            _currentPlayer = _players[0];
        }
        else {
            _changePlayer();
            displayController.showMessage(`${_currentPlayer.name}'s turn`);
            if (_currentPlayer.ai) {
                if (displayController.getAIDifficulty()==1) {
                    playTurn(_getBestMove(gameboard.state));
                }
                else {
                    playTurn(_availableSquares[_getRandomSquare()]);
                }
            }
        }
    }

    const _getRandomSquare = () => {
        return Math.floor(_availableSquares.length*Math.random());
    }
    
    const newGame = (reset=false) => {
        _availableSquares = [0,1,2,3,4,5,6,7,8];
        _gameEnded = false;
        displayController.renderGameboard(reset);
        if (reset) {
            for (let i=0; i<9; i++) {
                displayController.colorSquare(i, 'white');
                gameboard.state[i] = 0;
            }
        }

        _players[0].ai = displayController.getCheckBoxValue(1);
        _players[1].ai = displayController.getCheckBoxValue(2);

        displayController.showMessage(`${_players[0].name}'s turn`);

        if (_players[0].ai) {
            if (displayController.getAIDifficulty()==1) {
                playTurn(_getBestMove(gameboard.state));
            }
            else {
                playTurn(_availableSquares[_getRandomSquare()]);
            }
        }
    }

    const _getBestMove = (board) => {
        let bestMove, worstMove;
        let bestScore = -99;
        let worstScore = 99;
        const maxOrMin = _currentPlayer.value;

        for (let i=0; i<9; i++) {
            if (!board[i]) {
                nextBoard = [...board];
                nextBoard[i] = maxOrMin;
                let currentScore = _minimax(nextBoard, -maxOrMin, i);
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestMove = i;
                }
                if (currentScore < worstScore) {
                    worstScore = currentScore;
                    worstMove = i;
                }
            }
        }
        if (maxOrMin === 1) {
            return bestMove;
        }
        else if (maxOrMin === -1) {
            return worstMove;
        }
    }

    const _minimax = (board, value, index) => {
        const outcome = _checkGameEnded(board, index);
        switch(outcome.gameEnded) {
            case true:
                return outcome.winningPlayer.value;
            case 'tie':
                return 0;
        }
        
        const scores = [];
        const nextValue = -value;
        const maxOrMin = value;

        for(let i=0; i<9; i++) {
            if(!board[i]){
                nextBoard = [...board];
                nextBoard[i] = value;
                scores.push(_minimax(nextBoard, nextValue, i));
            }
        }
        if (maxOrMin === 1) {
            return Math.max(...scores);
        }
        else if (maxOrMin === -1) {
            return Math.min(...scores);
        }
    }

    return {getCurrentPlayer, newGame, playTurn, renamePlayers};
})();

const displayController = (() => {
    const _resetBtn = document.getElementById("reset-btn");
    _resetBtn.addEventListener("click", () => gameController.newGame(true));

    const _nameSubmit = document.getElementById("name-submit");
    _nameSubmit.addEventListener("click", () => {
        gameController.renamePlayers();
    });

    const renderGameboard = (reset) => {
        for (let i=0; i<9; i++) {
            const square = reset ? 
                document.getElementsByClassName('square')[i] : 
                document.createElement('div');
            if (!reset) {
                square.setAttribute('class', 'square');
                square.setAttribute('id', 'square-'+i);
                square.index = i;
                square.addEventListener("click", (event) => {
                    if (event.target.innerHTML === '-') {
                        gameController.playTurn(event.target.index);
                    }
                });
                document.getElementById('gameboard-container').appendChild(square);
            }
            square.innerHTML = '-';
        }
    }

    const markBoard = (index) => {
        const square = document.getElementById('square-'+index);
        const currentPlayer = gameController.getCurrentPlayer();
        if (!gameboard.state[index]) {
            gameboard.placeSymbol(currentPlayer.value, index);
            square.innerHTML = currentPlayer.symbol;
        }
    };

    const colorSquare = (index, color) => {
        const square = document.getElementById('square-'+index);
        square.style.backgroundColor = color;
    }

    const showMessage = (message) => {
        messageBox = document.getElementById('message-box');
        messageBox.innerHTML = message;
    };

    const getPlayerName = (playerNumber) => {
        return document.getElementById('input-'+playerNumber).value;
    };

    const getCheckBoxValue = (playerNumber) => {
        return document.getElementById('ai-'+playerNumber).checked;
    }

    const getAIDifficulty = () => {
        return document.getElementById('ai-difficulty').value;
    }

    return {renderGameboard, markBoard, colorSquare, showMessage, getPlayerName, getCheckBoxValue, getAIDifficulty};
})();

gameController.newGame(false);