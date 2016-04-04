var currentPlayer = 1;
var pieces = {
  "1": "×",
  "2": "○"
}
var aiTree;

var gameBoard = [0,0,0,
                 0,0,0,
                 0,0,0];

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

function buildTree(board, playerToMove) {
  var tree = {
    board: board,
    playerToMove: playerToMove,
    moves: {}
  };
  
  // Base Case
  if (wonBoardForPlayer(board, otherPlayer(playerToMove))) {
    tree.value = otherPlayer(playerToMove);
    return tree;
  } else if (fullBoard(board)) { // Tied board
    tree.value = 0;
    return tree;
  }
  
  // Generate moves
  for(var i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] == 0) {
      var newBoard = board.slice(0);
      newBoard[i] = playerToMove;
      tree.moves[i] = buildTree(newBoard, otherPlayer(playerToMove));
      console.log(tree.moves[i]);
    }
  }
  
  // Assign Value to tree
  tree.value = 0;
  console.log(Object.keys(tree.moves));
  for (var move in tree.moves) {
    if (tree.moves[move].value != 0) {
      tree.value = tree.moves[move].value;
      tree.bestMove = move;
    }
  }
  return tree;
}

function processMove(squareId) {
  if (gameBoard[squareId] == 0) {
    var cell = document.querySelector(".game-cell[id='" + squareId + "']");
    cell.innerHTML = pieces[currentPlayer];
    gameBoard[squareId] = currentPlayer;
    changeTurn();
  }
}
  
function changeTurn() {
  currentPlayer = otherPlayer(currentPlayer);
  printBoard();
}

function otherPlayer(player) {
  return (player == 1) ? 2 : 1;
}

function init() {
  var cells = Array.prototype.slice.call(document.querySelectorAll(".game-cell"));
  cells.forEach(function(cell) {
    cell.onclick = function() {
      processMove(cell.id);
    }
  });
  console.log("Starting to build tree");
  aiTree = buildTree(gameBoard, currentPlayer);
  console.log("Done building tree");
  console.log(aiTree);
}

function printBoard() {
  console.log("Current Board: ");
  console.log(gameBoard[0] + "|" + gameBoard[1] + "|" + gameBoard[2]);
  console.log(gameBoard[3] + "|" + gameBoard[4] + "|" + gameBoard[5]);
  console.log(gameBoard[6] + "|" + gameBoard[7] + "|" + gameBoard[8]);
}

init();
