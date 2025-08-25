// The viewing mode selection is saved in the browser.
if (localStorage.getItem('dark-mode') === 'enabled') {
    document.body.classList.add('dark-mode');
}
const darkModeBtn = document.getElementById('darkmodetoggle');
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle('dark-mode');
    // Set a key-value pair in the local storage i.e. the browser as dark-mode: 'enabled' (or disabled)
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled')
});

const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('gamestatus');
const controlbox = document.getElementById("controlboard");

let gameActive = false;
let currentPlayer = '';
let gameState = ['', '', '', '', '', '', '', '', ''];
let gameMode = null;
let player1Symbol = '';
let player2Symbol = '';
let isVsComputer = false;

// Possible wins -- horizontally, vertically, or along diagonals
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Initially select between 1-player and 2-player modes
controlbox.addEventListener("click", (e) => {
    if (e.target.classList.contains("selectionbtn") && e.target.hasAttribute("mode")) {
        const mode = parseInt(e.target.getAttribute("mode"));
        isVsComputer = (mode === 1);
        showSymbolChoice();
    }
});

// Show the symbol options
function showSymbolChoice() {
    controlbox.innerHTML = `        
            <span class="ctrltxt">Player 1 symbol:</span><br>
            <button class="selectionbtn xbtn" player-symbol="x">X</button>
            <button class="selectionbtn obtn" player-symbol="o">O</button>        
    `;
}

// Obtain chosen symbol
controlbox.addEventListener("click", (e) => {
    if (e.target.classList.contains("selectionbtn") && e.target.hasAttribute("player-symbol")) {
        const symbol = e.target.getAttribute("player-symbol");
        player1Symbol = symbol;
        player2Symbol = (symbol === 'x') ? 'o' : 'x';
        currentPlayer = 'x';        // ensures that player with 'X' starts first
        controlbox.innerHTML = '';  // controls box is made blank
        startGame();
    }
});

// Begin gameplay
function startGame() {
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];

    // Reset all cells
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });

    updateStatus();

    if (isVsComputer && currentPlayer === player2Symbol) {
        setTimeout(computerMove, 1500); // AI only moves after 1s
    }
}

// Have the cells respond to player's mouse clicks
cells.forEach(cell => {
    cell.addEventListener('click', checkCells);
});

function checkCells(event) {
    const cell = event.target;
    const cellIndex = parseInt(cell.getAttribute('cell-index'));
    
    // if the game ended or no empty cells are left, do nothing
    if (!gameActive || gameState[cellIndex] !== '') return;

    // Ignore clicks during AI's turn
    if (isVsComputer && currentPlayer !== player1Symbol) return;

    makeMove(cellIndex);
}

// Add the player's symbol to the cell
function makeMove(index) {
    gameState[index] = currentPlayer;   // Fill the current player's symbol in the given position in the gameState array
    cells[index].textContent = currentPlayer.toUpperCase();
    cells[index].classList.add(currentPlayer.toLowerCase());

    if (checkResult()) return;

    currentPlayer = (currentPlayer === 'x') ? 'o' : 'x';    // Switch from 'X' to 'O' and vice-versa
    updateStatus();     // Update the text below the title

    if (isVsComputer && currentPlayer === player2Symbol && gameActive) {
        setTimeout(computerMove, 1000);
    }
}

function computerMove() {
    if (!gameActive) return;

    // Check the board and find a possible win
    for (let i=0;i<9;i++) {
        if (gameState[i] == '') {
            gameState[i] = currentPlayer;
            if(checkForWinner(gameState, currentPlayer)) {
                gameState[i] = '' // remove data from gameState array
                makeMove(i);
                return;
            }
            gameState[i] = ''   // Even if a win condition wasn't detected, clear the gameState array.
        }
    }

    // If the human player is about to win, block it
    const plOne = player1Symbol;
    for (let i=0;i<9;i++) {
        if (gameState[i] == '') {
            gameState[i] = plOne;
            if(checkForWinner(gameState, plOne)) {
                gameState[i] = '';
                makeMove(i);
                return;
            }
            gameState[i] = '';
        } 
    }

    /*
    Initially, the computer randomly decides whether to fill the corners
    or the center, if no win conditions are detected. Once the center is filled,
    the corners are considered.
    */
    const boardCorners = [0, 2, 6, 8];
    let blankCorners = boardCorners.filter(i => gameState[i] == '');
    let centerAvail = (gameState[4] === '');

    if (centerAvail) {
        let choice = Math.random();
        if (choice <= 0.5 && blankCorners.length > 0) {
            const cornerMoveIndex = blankCorners[Math.floor(Math.random() * blankCorners.length)];
            makeMove(cornerMoveIndex);
            return;
        }
        else if (choice > 0.5) {
            makeMove(4);
            return;
        }
    }    
    else if (blankCorners.length > 0) {
        const cornerMoveIndex = blankCorners[Math.floor(Math.random() * blankCorners.length)];
        makeMove(cornerMoveIndex);
        return;
    }


    // Check gameState array for all its values (x or o) and their respective indices; find which indices contain empty values
    const emptyIndices = gameState
        .map((val, idx) => val === '' ? idx : null) // if value is blank, enter its index, otherwise enter 'null'
        .filter(idx => idx !== null);               // only return the values whose indices are not null from map()

    if (emptyIndices.length === 0) return;          // stop if all cells are filled
    let randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    makeMove(randomIndex);
    /*
    Eg. if random number is 0.5 and there are 3 indices in emptyIndices, result is 0.5 * 3 = 1.5.
    Applying Math.floor() gives the integer result 1.
    */
}

const checkForWinner = (playState, player) => {
    return winningConditions.some(condition => {
        const [a, b, c] = condition;
        // Check whether the filled cells for a win condition are of the same player.
        return playState[a] === player && playState[b] === player && playState[c] === player;
    });
}


// Check if a player won or the match is a draw
function checkResult() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;

        // Check gameState array at the indices a, b and c
        if (gameState[a] && gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
            gameActive = false;

            if(!isVsComputer) {
                statusDisplay.textContent = `Player ${getPlayerName(currentPlayer)} Wins!`;
            }
            else {
                statusDisplay.textContent = `${getPlayerName(currentPlayer)}`;
            }
            
            showPlayAgain();
            return true;
        }
    }

    if (!gameState.includes('')) {
        gameActive = false;
        statusDisplay.textContent = "It's a Draw!";
        showPlayAgain();
        return true;
    }

    return false;
}

// Change the status text below the title
function updateStatus() {
    if (!isVsComputer) {
        statusDisplay.textContent = `Player ${getPlayerName(currentPlayer)}'s Turn`;
    }
    else {
        statusDisplay.textContent = `${getPlayerName(currentPlayer)} Turn`;
    }
}

// Check symbol and accordingly put in the current player
function getPlayerName(symbol) {
    if (!isVsComputer) {
        return (symbol === player1Symbol) ? '1' : '2';
    } else if (isVsComputer && gameActive) {
        return (symbol === player1Symbol) ? 'Your' : 'Computer\'s';
    }
    else if (isVsComputer && !gameActive) {
        return (symbol === player1Symbol) ? 'You win!' : 'Computer wins!';
    }
}

// Show control box for playing again
function showPlayAgain() {
    controlbox.innerHTML = `
            <span class="ctrltxt">Good Game!</span><br>
            <button class="selectionbtn" id="reset-button">Play Again</button>
    `;

    document.getElementById("reset-button").addEventListener("click", resetGame);
}

// Reset all variables
function resetGame() {
    gameActive = false;
    gameState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = '';
    player1Symbol = '';
    player2Symbol = '';
    isVsComputer = false;

    // Reset cell visuals
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });

    statusDisplay.textContent = 'Beginning game';

    controlbox.innerHTML = `
        <span class="ctrltxt">Choose game-mode:</span><br>
        <button class="selectionbtn" mode="1">1-Player</button>
        <button class="selectionbtn" mode="2">2-Player</button>
    `;
}
