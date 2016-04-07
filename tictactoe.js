var currentPlayer = 1;
var AIPlayer = -1;
var pieceClasses = {
  "1": "cross",
  "2": "circle"
}
var solvedGameTree;
var currentGameTree;
var gameOver = false;
var startBoard = [0,0,0,
                  0,0,0,
                  0,0,0];

// Board Helper Functions
function fullBoard(board) {
  if (Math.min(...board) != 0) {
    return true;
  }
  return false;
}

function wonBoardForPlayer(board, player) {
  for (var i = 0; i < 3; i++) { // Horizontal
    var j = i * 3;
    if (board[j] == player && board[j+1] == player && board[j+2] == player) {
      return true;
    }
  }
  for (var i = 0; i < 3; i++) { // Vertical
    if (board[i] == player && board[i+3] == player && board[i+6] == player) {
      return true;
    }
  }
  
  if ((board[0] == player && board[4] == player && board[8] == player) || (board[2] == player && board[4] == player && board[6] == player)) {
    return true;
  }
  return false;
}

// Solved Game Tree Generator Function
function buildTree(initialTree) {
  var inputTreeStack = [initialTree]; // We can't use recursion since TicTacToe has ~300,000 board states which exceeds the stack call limit of all browsers.
  var finishedTreeStack = []; // To solve this we implment our own stack frames by using iteration over 2 stacks to track history.

  var currentTree;
  /*
    Trees are objects with possible attributes {
      board: 9-length array containing the board state,
      playerToMove: the number corresponding to the player who is to move next,
      moves: a hash mapping the possible move indexes (0-9) to the trees that correspond to the state of the game after that move is made,
      winner: the player who has a path to victory at this state and beyond. 0 for draw. (We know that the root node will have a winner of 0),
      bestMove: one of the moves that playerToMove should make to continue being the "winner" of the future states.
    }
  */
  while(currentTree = inputTreeStack.pop()) {

    // Base Case we have a finished board (Won or tied)
    if (wonBoardForPlayer(currentTree.board, otherPlayer(currentTree.playerToMove))) {
      currentTree.winner = otherPlayer(currentTree.playerToMove);
      finishedTreeStack.push(currentTree);
    } else if (fullBoard(currentTree.board)) { // Tied board
      currentTree.winner = 0;
      finishedTreeStack.push(currentTree);
    } else if ('moves' in currentTree) { // Tree that has been waiting for its n move children to be created
      // It's finished children are on the finishedTreeStack in order
      var orderedMoveIndexes = Object.keys(currentTree.moves).map(function(x) { // Note: we cant pass parseInt directly cause it can take 2 args and we dont want to change the radix.
        return parseInt(x);
      }).sort(function(a,b) {
        return a - b;
      });

      // Calculate winner from moves and add move them from the finished stack to the parent moves hash.
      currentTree.winner = otherPlayer(currentTree.playerToMove); // Assume worst case
      currentTree.bestMove = -1; // Surrender
      orderedMoveIndexes.forEach(function(moveIndex) {
        currentTree.moves[moveIndex] = finishedTreeStack.pop();
        var move = currentTree.moves[moveIndex];
        if (move.winner == currentTree.playerToMove) {
          currentTree.winner = move.winner;
          currentTree.bestMove = moveIndex;
        } else if (move.winner == 0 && currentTree.winner != currentTree.playerToMove) {
          currentTree.winner = move.winner;
          currentTree.bestMove = moveIndex;
        }
      });

      finishedTreeStack.push(currentTree); // Now that currentTree has all of its completed children, it is finished.
    } else {
      // This tree has not had its children created yet, push back on input stack and add it's possible children.
      inputTreeStack.push(currentTree); // We still have a reference to this tree so we can add the moves later.

      // Generate moves and add to the input stack
      currentTree.moves = {};
      for(var i = 0; i < currentTree.board.length; i++) {
        if (currentTree.board[i] == 0) {
          currentTree.moves[i] = null; // To indicate that we expect a move tree to be filled in here.

          var newBoard = currentTree.board.slice(0); // Value copy not reference copy
          newBoard[i] = currentTree.playerToMove;
          inputTreeStack.push({ board: newBoard, playerToMove: otherPlayer(currentTree.playerToMove) }); // Add unfinished child to the input stack
        }
      }
    }
  }
  return finishedTreeStack.pop(); // finishedTreeStack will contain one tree at the end (the rootTree).
}

// Gameplay Helpers
function processMove(squareId) {
  var currentBoard = currentGameTree.board;
  if (currentBoard[squareId] == 0 && !gameOver) { // Human player
    placePiece(squareId);
    traverseMove(squareId);
    changeTurn();
  }
}

function makeAIMove() {
  if (currentPlayer != AIPlayer) {
    return;
  }
  var currentBoard = currentGameTree.board;
  var decidedMove = currentGameTree.bestMove;
  if (decidedMove != -1 && currentBoard[decidedMove] == 0) {
    placePiece(decidedMove); 
    traverseMove(decidedMove);
    changeTurn();
  } else {
    alert("I surrender.");
    gameOver = true;
  }
}

function placePiece(squareId, empty = false) {
  var cell = document.querySelector(".game-cell[id='" + squareId + "']");
  cell.children[0].className = pieceClasses[currentPlayer];
  if (empty) {
    cell.children[0].className = 'empty';
  }
}

function traverseMove(moveIndex) {
  currentGameTree = currentGameTree.moves[moveIndex]; 
}
  
function changeTurn() {
  if (!('moves' in currentGameTree)) { // currentPlayer Won or Tied
    if (fullBoard(currentGameTree.board)) {
      alert("Tie game."); 
    } else {
      alert("Player " + currentPlayer + " wins!");
    }
    gameOver = true;
    return;
  }
  currentPlayer = otherPlayer(currentPlayer);
  printBoard();
  if (currentPlayer == AIPlayer) {
    makeAIMove();
  }
}

function otherPlayer(player) {
  return (player == 1) ? 2 : 1;
}

function printBoard() {
  console.log("Current Board: ");
  console.log(currentGameTree.board[0] + "|" + currentGameTree.board[1] + "|" + currentGameTree.board[2]);
  console.log(currentGameTree.board[3] + "|" + currentGameTree.board[4] + "|" + currentGameTree.board[5]);
  console.log(currentGameTree.board[6] + "|" + currentGameTree.board[7] + "|" + currentGameTree.board[8]);
}

function restartGame() {
  currentGameTree = solvedGameTree;
  for(var i = 0; i < 9; i++) { // Clear board
    placePiece(i, true); 
  } 
  currentPlayer = 1;
  var humanPlayerRole = document.querySelector("#humanPlayer").value;
  switch(humanPlayerRole) {
    case "player1":
      AIPlayer = 2;
      break;
    case "player2":
      AIPlayer = 1;
      break;
    default:
      AIPlayer = -1;
  }
  gameOver = false;
  makeAIMove();
}

// Main Function
function init() {
  console.log("Starting to build solved game tree");
  var startTime = Date.now();
  currentGameTree = solvedGameTree = buildTree({board: startBoard, playerToMove: currentPlayer});
  console.log("Done building tree. Completed in " + (Date.now() - startTime)/1000 + " seconds.");
  console.log(solvedGameTree);
  restartGame();

  // Bind onclick handlers for human player(s)
  var cells = Array.prototype.slice.call(document.querySelectorAll(".game-cell"));
  cells.forEach(function(cell) {
    cell.onclick = function() {
      processMove(cell.id);
    }
  });
  document.querySelector(".restart").onclick = restartGame
}
window.onload = init; // Call main when DOM ready

window.onresize = function() {
  // var gameGrid = document.querySelector(".game-grid");
  // gameGrid.width = window.innerWidth;
  // gameGrid.height = window.innerWidth;
}
