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
    let _currentPlayer = _player1;
    
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
        //Check if tie
        if (!board.includes(undefined)) {
            return 'tie';
        }
        const row = Math.floor(index/3);
        const col = index % 3;
        //Check row
        if (board[row*3]==board[row*3+1] && board[row*3]==board[row*3+2]) {
            return true;
        }
        //Check column
        if (board[col]==board[col+3] && board[col]==board[col+6]) {
            return true;
        }
        //Check diagonals
        if (row==col) {
            if (board[0] && board[0]==board[4] && board[0]==board[8]) {
                return true;
            }
        }
        if (col==2-row) {
            if (board[2] && board[2]==board[4] && board[2]==board[6]) {
                return true;
            }
        }
        return false;
    }
    
    const playTurn = (index) => {
        displayController.markBoard(index);
        console.log(gameboard.state);
        const outcome = _checkGameEnded(gameboard.state, index)
        switch (outcome) {
            case 'tie':
                displayController.showMessage('It\'s a tie!');
                break;
            case true:
                const winningSymbol = gameboard.state[index];
                const winningPlayer = _players.filter(player => winningSymbol == player.symbol)[0];
                displayController.showMessage(`${winningPlayer.name} Wins!`);
        }
        _changePlayer();
    }
    
    const newGame = (reset=false) => {
        displayController.renderGameboard(reset);
        if (reset) {
            for (i=0; i<9; i++) {
                gameboard.state[i] = undefined;
            }
        }
        displayController.showMessage('');
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
            console.log('before:',gameboard.state)
            gameboard.placeSymbol(currentPlayer.symbol, index);
            console.log('after:',gameboard.state)
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