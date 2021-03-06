// Code your JavaScript / jQuery solution here

var WINNING_COMBOS = [[0,1,2], [0,3,6], [0,4,8], [1,4,7], [2,5,8], [2,4,6], [3,4,5], [6,7,8]];

var turn = 0;
currentGame = 0;

$(document).ready(function() {
  attachListeners();
});

function player () {
  if (turn % 2 == 0) {
    return 'X'
  } else if (turn % 2 !== 0){
    return 'O'
  };
};

function updateState (square) {
  let token = player()
  $(square).text(token)
}

function setMessage (string) {
  $('#message').text(string)

}

function checkWinner () {
  var board = {};
  var winner = false;

  $('td').text((index, square) => board[index] = square);

  WINNING_COMBOS.some(function(combination) {
    if (board[combination[0]] !== "" && board[combination[0]] === board[combination[1]] && board[combination[1]] === board[combination[2]]) {
      setMessage(`Player ${board[combination[0]]} Won!`);
      return winner = true;
    };
  });
 return winner;
}

function doTurn (square) {
  updateState(square);
  turn++;
  if (checkWinner()) {
  saveGame();
  clearGame();
} else if (turn === 9) {
  setMessage("Tie game.");
  saveGame();
  clearGame();
}
}

function attachListeners () {
  $('td').on('click', function() {
    if (!$.text(this) && !checkWinner()) {
      doTurn(this);
    }
  });

$('#save').on('click', () => saveGame());
$('#previous').on('click', () => previousGames());
$('#clear').on('click', () => clearGame());
}

function clearGame() {
  $('td').empty();
  turn = 0;
  currentGame = 0;
}

function saveGame() {
  var state = [];
  var gameData;

  $('td').text((index, square) => {
    state.push(square);
  });

  gameData = { state: state };

  if (currentGame) {
    $.ajax({
      type: 'PATCH',
      url: `/games/${currentGame}`,
      data: gameData
    });
  } else {
    $.post('/games', gameData, function(game) {
      currentGame = game.data.id;
      $('#games').append(`<button id="gameid-${game.data.id}">${game.data.id}</button><br>`);
      $("#gameid-" + game.data.id).on('click', () => reloadGame(game.data.id));
    });
  }
}

function previousGames(){
  $('#games').empty();
  $.get('/games', (savedGames) => {
    if(savedGames.data.length) {
      savedGames.data.forEach(buttonPreviousGame);
    }
  });
}

function buttonPreviousGame(game) {
  $('#games').append(`<button id="gameid-${game.id}">${game.id}</button><br>`);
  $(`#gameid-${game.id}`).on('click', () => reloadGame(game.id));
}

function reloadGame(gameId) {
  document.getElementById('message').innerHTML = '';

  const resp = new XMLHttpRequest;
  resp.overrideMimeType('application/json');
  resp.open('GET', `/games/${gameId}`, true);
  resp.onload = () => {
    const data = JSON.parse(resp.responseText).data;
    const id = data.id;
    const state = data.attributes.state;

    let i = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        document.querySelector(`[data-x="${x}"][data-y="${y}"]`).innerHTML = state[i];
        i++;
      }
    }

turn = state.join('').length;
currentGame = id;

if (!checkWinner() && turn === 9) {
  setMessage('Tie game.');
}
};

}
