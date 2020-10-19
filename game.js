const gameboard = (() => {
    const state = new Array(9);
    const placeSymbol = (symbol, square) => {
        state[square] = symbol;
    }
    return {state, placeSymbol};
})();

const createPlayer = (name, symbol) => {
    return {name, symbol};
}

const gameController = (() => {
    const _player1 = createPlayer('Player 1', 'x');
    const _player2 = createPlayer('Player 2', 'o');
    const _players = [];
    _players.push(_player1, _player2)
    let _currentPlayer = _players[0];
    let _gameEnded = false;
    
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
        //Check row
        if ((board[row*3]==board[row*3+1] && board[row*3]==board[row*3+2])
        //Check column
        || (board[col]==board[col+3] && board[col]==board[col+6])
        //Check diagonals
        || ((row==col) && (board[0] && board[0]==board[4] && board[0]==board[8]))
        || ((col==2-row) && (board[2] && board[2]==board[4] && board[2]==board[6]))) {
            _gameEnded = true;
        }
        //Check if tie
        else if (!board.includes(undefined)) {
            _gameEnded = 'tie';
        }
    }
    
    const playTurn = (index) => {
        if (!_gameEnded) displayController.markBoard(index);
        _checkGameEnded(gameboard.state, index)
        switch (_gameEnded) {
            case 'tie':
                displayController.showMessage('It\'s a tie!');
                break;
            case true:
                const winningSymbol = gameboard.state[index];
                const winningPlayer = _players.filter(player => winningSymbol == player.symbol)[0];
                displayController.showMessage(`${winningPlayer.name} Wins!`);
        }
        if (_gameEnded) {
            _currentPlayer = _players[0];
        }
        else {
            _changePlayer();
            displayController.showMessage(`${_currentPlayer.name}'s turn`);
        }
    }
    
    const newGame = (reset=false) => {
        _gameEnded = false;
        displayController.renderGameboard(reset);
        if (reset) {
            for (i=0; i<9; i++) {
                gameboard.state[i] = undefined;
            }
        }
        displayController.showMessage(`${_players[0].name}'s turn`);
    }

    return {getCurrentPlayer, newGame, playTurn};
})();

const displayController = (() => {
    const renderGameboard = (reset) => {
        for (i=0; i<9; i++) {
            const square = reset ? 
                document.getElementsByClassName('square')[i] : 
                document.createElement('div');
            if (!reset) {
                square.setAttribute('class', 'square');
                square.setAttribute('id', 'square-'+i);
                square.index = i;
                square.addEventListener("click", (event) => {
                    gameController.playTurn(event.target.index);
                });
                document.getElementById('gameboard-container').appendChild(square);
            }
            square.innerHTML = '-';
        }
        resetBtn = document.getElementById("reset-btn");
        resetBtn.addEventListener("click", () => gameController.newGame(true));
    }

    const markBoard = (index) => {
        const square = document.getElementById('square-'+index);
        const currentPlayer = gameController.getCurrentPlayer();
        if (!gameboard.state[index]) {
            gameboard.placeSymbol(currentPlayer.symbol, index);
            square.innerHTML = currentPlayer.symbol;
        }
    };

    const showMessage = (message) => {
        messageBox = document.getElementById('message-box');
        messageBox.innerHTML = message;
    };

    return {renderGameboard, markBoard, showMessage};
})();

gameController.newGame(false);