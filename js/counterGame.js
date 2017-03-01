//score to check. default is 501
var startNumber = 501;
//doubleOut or singleOut. default is doubleOut
var doubleOut = true;
//name of the players
var players = new Array();
//current Player
var currentPlayer = 0;
//number of winners
var numberOfWinners = 0;
//number of exchange buttons
var numberOfExchangeButtons = 0;
//number of rounds
var playedRounds = 1;
//old score for undo
var oldScore = 0;
//old average for undo
var oldAvg = 0;
//times of undo
var timesOfUndo = 0;

var numberOfPlayers = 0;

/*
* Javascript for Counter
*/

//Pressing enter is the same as clicking "Next Player"
document.getElementById('score')
    .addEventListener('keyup', function (event) {
        event.preventDefault();
        if (event.keyCode == 13) {
            document.getElementById('next').click();
        }
    });
//Better support for touch devices as there is a numblock
$('.number').on('click', function() {
    //Append pressed number to score input
    var score = ($(this)[0].firstChild.nodeValue);
    document.getElementById('score').value+=score;
})
//remove last number from score input
$('#rmv').on('click', function() {
    var string = document.getElementById('score').value;
    document.getElementById('score').value=string.substring(0, string.length-1)
})
//reset all settings and switch to the settings-page to configure a new game
$('#quit').on('click', function() {
  //clear session Storage
  clearSessionStorage();
  //switch to the settings for a new game
  window.location.href = "./counterSettings.html";
})

//restart game with the chosen settings
$('#restart').on('click', function() {
  //set currentPlayer = first Player
  currentPlayer = 0;
  //set numberOfWinners = 0
  numberOfWinners = 0;
  //set numberOfExchangeButtons = 0
  numberOfExchangeButtons = 0;
  //set number of played rounds = 0
  playedRounds = 1;
  //reset for undo
  oldScore = 0;
  oldAvg = 0;
  timesOfUndo = 0;

  numberOfPlayers = players.length;

  //clear score input field
  document.getElementById('score').value = "";
  //if the game is restarted before it's finished clear the remaining player fields
  clearRemainingPlayerList();
  //create a new List of the players
  createPlayerList();
  //fill the list with data: names and score to start with
  fillNamesInList();
  //return startnumber of each to set startnumber
  for(var i = 0; i < players.length; i++) {
    //remove latest scores
    document.getElementsByName('avg')[i].innerHTML = "";
    //document.getElementsByName('avg')[i].style.display = "none";
    //set score to start with
    document.getElementsByName('playerScore')[i].innerHTML = startNumber;
    //deactivate all players
    document.getElementsByName('player')[i].style.opacity = 0.5;
    //remove names from table
    document.getElementsByName('nameWinner')[i].innerHTML = "";
    //remove average from table
    document.getElementsByName('average')[i].innerHTML = "";
  }
  //show first player as active
  document.getElementsByName('player')[0].style.opacity = 1;
  document.getElementsByName('avg')[0].style.display = "initial";
  //set cursor in input field
  document.getElementById('score').focus();
  //print current round
  document.getElementById('currentRound').innerText = playedRounds;
})

//handle the entered score and move on to next player
$('#next').on('click', function() {
  timesOfUndo = 0;
  //get the score from input
  var score = document.getElementById('score').value;
  //if score input is empty set score to 0
  if(score == "") {
      score = 0;
  }
  //if score is not an integer print a message to the user
  if (!isInt(score)) {
      alert('Please enter a natural number.');
  //if score is higher than 180 print a message to the user
  } else if (score > 180) {
      alert('Please enter a score of 180 or less.');
  //If there are no more Players left
  } else if (document.getElementsByName('player').length === 0) {
      alert('Please start a new Game!');
  //if score is fine
  } else {
    try {
        //reset score input field
        document.getElementById('score').value = '';
        //get the currentScore of the player
        var currentScore = document.getElementsByName('playerScore')[currentPlayer].innerHTML;

        //get old avg and score for undo
        oldAvg = document.getElementsByName('avg')[currentPlayer].innerHTML;
        oldScore = currentScore;

        //get the new score
        var newScore = currentScore - score;
        if (newScore < 0) {
            var average = roundToTwo((startNumber - currentScore)/playedRounds);
            document.getElementsByName('avg')[currentPlayer].innerHTML = average;
            nextPlayer();
        } else if (newScore === 1 && doubleOut) {
            var average = roundToTwo((startNumber - currentScore)/playedRounds);
            document.getElementsByName('avg')[currentPlayer].innerHTML = average;
            nextPlayer();
        //if newScore is 0 the player is the Winner.
        } else if (newScore === 0) {
          var avg = roundToTwo(startNumber/playedRounds);
          //add the player to the table and remove player from the player list
          addPlayerToTable(avg);
          removePlayer();
          numberOfPlayers = numberOfPlayers - 1;
        //set the newScore as currentScore and add the score to latest scores. Then move on to next player
        } else {
            document.getElementsByName('playerScore')[currentPlayer].innerHTML = newScore;
            var average = roundToTwo((startNumber - newScore)/playedRounds);
            document.getElementsByName('avg')[currentPlayer].innerHTML = average;
            removeExchangeButtons();
            nextPlayer();
        }
    //catch all errors if something went wrong. Print a message to the user and set the first Player as current Player. Log the error.
    } catch (err) {
        alert('An error occured. Player 1 to throw now. Sorry for any inconvenience caused.');
        console.log(err);
        //sets opacity of current Player to 0.5
        document.getElementsByName('player')[currentPlayer].style.opacity = 0.5;
        //document.getElementsByName('avg')[currentPlayer].style.display = "none";
        //set first player as active player
        currentPlayer = 0;
        document.getElementsByName('player')[currentPlayer].style.opacity = 1;
        document.getElementsByName('avg')[currentPlayer].style.display = "initial";
    }
  }
})

$('#undo').on('click', function() {
  if (timesOfUndo != 0) {
    alert("Only one time 'Undo' allowed!");
  } else {
    undo();
    timesOfUndo = 1;
  }
});

/*
* Functions
*/

//parses an Item from session Storage
function parseFromSessionStorage(key) {
  return JSON.parse(window.sessionStorage.getItem(key));
}

//clears session Storage
function clearSessionStorage() {
  return window.sessionStorage.clear();
}

//onload function: prints the settings the player has chosen before
function init() {
  //if there are no parameters in sessionStorage redirect to settings page
  if(sessionStorage.length === 0) {
    //switch to the settings for a new game
    window.location.href = "./counterSettings.html";
  }

  //will be the String "double out" or "single out"
  var out;
  //get startNumber - this could be 301 or 501
  startNumber = parseFromSessionStorage('startNumber');
  //get doubleOut - this could be true (double) or false(single)
  doubleOut = parseFromSessionStorage('doubleOut');
  //get players - delivers an array of names
  players = parseFromSessionStorage('players');

  //Check whether one of them is not set
  if(startNumber == null && doubleOut == null) {
    startNumber = 501;
    doubleOut = true;
  } else if (doubleOut == null) {
    doubleOut = true;
  } else if (startNumber == null) {
    startNumber = 501;
  }

  //if doubleOut is true set "Double Out" as String for var out else set "Single Out"
  if(doubleOut == true) {
    out = "Double Out";
  } else {
    out = "Single Out";
  }

  numberOfPlayers = players.length;

  //print the chosen settings
  document.getElementById('startnumber').innerText = startNumber;
  document.getElementById('out').innerText = out;
  //print current round
  document.getElementById('currentRound').innerText = playedRounds;

  //create the list for all of the players
  createPlayerList();
  //fill initial data in the created list
  fillNamesInList();
  //create table for final statistic
  createTable();
  //set first player as active
  document.getElementsByName('player')[0].style.opacity = 1;
  //set cursor in input field
  document.getElementById('score').focus();
}

//creates the list of all players
function createPlayerList() {
  //get div for players
  var parent = document.getElementById('players');
  for(var i = 0; i < players.length; i++){
    //create a new panel
    var div = document.createElement('div');
    div.className = "panel panel-default";
    div.setAttribute("name", "player");
    //create a new panel heading with name=playerName
    var playerName = document.createElement('div');
    playerName.className = "panel-heading";
    playerName.setAttribute("name", "playerName");
    //create a new panel body
    var panelBody = document.createElement('div');
    panelBody.className = "panel-body";
    //create current Score
    var playerScore = document.createElement('p');
    playerScore.setAttribute("name", "playerScore");
    //create latest Scores
    var averageText = document.createElement('p');
    averageText.innerHTML = "Average: ";
    var averageNumber = document.createElement('p');
    averageNumber.setAttribute("name", "avg");
    averageText.appendChild(averageNumber);
    //append current Score to panel body
    panelBody.appendChild(playerScore);
    //append latest scores to panel body
    panelBody.appendChild(averageText);
    //add panel heading and body to the created div
    div.appendChild(playerName);
    div.appendChild(panelBody);
    //add created div to parent div
    parent.appendChild(div);

    //add exchangeButtons if there are more than 1 players
    if((i + 1) !== players.length) {
      createExchangeButtons(parent);
    }
  }
}

//fills the names and the startNumber in the created player list
function fillNamesInList() {
  for(var i = 0; i < players.length; i++) {
    document.getElementsByName('playerName')[i].innerHTML = players[i];
    document.getElementsByName('playerScore')[i].innerHTML = startNumber;
    document.getElementsByName('player')[i].style.opacity = 0.5;
  }
}

//checks whether attribute is an integer
function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10)) && value >= 0;
}

//sets next Player
function nextPlayer() {
  //sets opacity of current Player to 0.5
  document.getElementsByName('player')[currentPlayer].style.opacity = 0.5;
  //document.getElementsByName('avg')[currentPlayer].style.display = "none";
  //set currentPlayer to next player. If there is no other player left set currentPlayer to first player. Set opacity of the next Player to 1
  if(currentPlayer < document.getElementsByName('player').length - 1) {
    currentPlayer = currentPlayer + 1;
    document.getElementsByName('player')[currentPlayer].style.opacity = 1;
    document.getElementsByName('avg')[currentPlayer].style.display = "initial";
  } else {
    currentPlayer = 0;
    playedRounds = playedRounds + 1;
    document.getElementById('currentRound').innerText = playedRounds;
    document.getElementsByName('player')[currentPlayer].style.opacity = 1;
    document.getElementsByName('avg')[currentPlayer].style.display = "initial";
  }
}

function undo() {
  if (currentPlayer == 0) {
    if((playedRounds - 1) <= 0) {
      alert("Don't abuse the Undo Button!");
    } else {
      //reduce number of played Rounds
      playedRounds = playedRounds - 1;

      //sets opacity of current Player to 0.5
      document.getElementsByName('player')[currentPlayer].style.opacity = 0.5;
      currentPlayer = (numberOfPlayers - 1);

      document.getElementById('currentRound').innerText = playedRounds;
      console.log(currentPlayer);
      //set old Player as active
      document.getElementsByName('player')[currentPlayer].style.opacity = 1;
      document.getElementsByName('avg')[currentPlayer].style.display = "initial";
      //reset old score of the player
      document.getElementsByName('playerScore')[currentPlayer].innerHTML = oldScore;
      document.getElementsByName('avg')[currentPlayer].innerHTML = oldAvg;

      document.getElementById('score').focus();
    }

  } else {
    //sets opacity of current Player to 0.5
    document.getElementsByName('player')[currentPlayer].style.opacity = 0.5;

    //get the player before
    currentPlayer = currentPlayer - 1;

    //set old Player as active
    document.getElementsByName('player')[currentPlayer].style.opacity = 1;
    document.getElementsByName('avg')[currentPlayer].style.display = "initial";
    //reset old score of the player
    document.getElementsByName('playerScore')[currentPlayer].innerHTML = oldScore;
    document.getElementsByName('avg')[currentPlayer].innerHTML = oldAvg;

    document.getElementById('score').focus();

  }
}

//remove player from the list
function removePlayer() {
  //remove winning player from the list
  var elem = document.getElementsByName('player')[currentPlayer];
  elem.parentNode.removeChild(elem);
  //if it was the last player who won set the first player as next player to throw
  if(currentPlayer === document.getElementsByName('player').length) {
    currentPlayer = 0;
    playedRounds = playedRounds + 1;
    document.getElementById('currentRound').innerText = playedRounds;
  }
  //if there are more than one players left set the next player as active
  if(document.getElementsByName('player').length > 1) {
    document.getElementsByName('player')[currentPlayer].style.opacity = 1;
    document.getElementsByName('avg')[currentPlayer].style.display = "initial";
  }
  //if there is only one player left, add him to the table and remove the player from the list
  if(document.getElementsByName('player').length === 1) {
    var avg = document.getElementsByName('avg')[currentPlayer].innerHTML;
    addPlayerToTable(avg);
    elem = document.getElementsByName('player')[currentPlayer];
    elem.parentNode.removeChild(elem);
  }

}
//adds current player to the table
function addPlayerToTable(avg) {
  //get name of the winner
  var winner = document.getElementsByName('playerName')[currentPlayer].innerHTML;
  //add this name to the table
  document.getElementsByName('nameWinner')[numberOfWinners].innerHTML = winner;
  //add average of the player to the table
  document.getElementsByName('average')[numberOfWinners].innerHTML = avg;
  //increase the numberOfWinners
  numberOfWinners = numberOfWinners + 1;
}
//create the table for statistic
function createTable() {
  var parent = document.getElementById('table');
  //add a row for each player
  for (var i = 1; i <= players.length; i++) {
    var tableRow = document.createElement('tr');

    var place = document.createElement('td');
    var text = document.createTextNode(i);
    place.appendChild(text);

    var name = document.createElement('td');
    name.setAttribute('name', 'nameWinner');

    var average = document.createElement('td');
    average.setAttribute('name', 'average');

    tableRow.appendChild(place);
    tableRow.appendChild(name);
    tableRow.appendChild(average);

    parent.appendChild(tableRow);
  }
}
//clear the remaining players from the list
function clearRemainingPlayerList() {
  //if there is a player left in the list
  if(document.contains(document.getElementsByName('player')[0])) {
    //remove all remaining players
    document.getElementById('players').innerHTML = "";
  }
}
//create exchange buttons
function createExchangeButtons(parent) {
  numberOfExchangeButtons = numberOfExchangeButtons + 1;
  //create a new row
  var row = document.createElement('div');
  row.setAttribute("class", "row");
  //create the button
  var exchangeButton = document.createElement('button');
  exchangeButton.setAttribute("type", "button");
  exchangeButton.setAttribute("class", "btn btn-default exchange");
  exchangeButton.setAttribute("name", numberOfExchangeButtons);
  //add event listener for clicking
  exchangeButton.addEventListener('click', function () {
    //get the name of the clicked button
    var number = this.name;
    //call exchangePlayer with the number of the exchangeButton
    exchangePlayer(number);
  })
  //create the exchange Sign
  var exchangeSign = document.createElement('span');
  exchangeSign.setAttribute("class", "glyphicon glyphicon-sort");
  exchangeSign.setAttribute("aria-hidden", "true");
  //create a new line
  var br = document.createElement('br');
  //append sign to button
  exchangeButton.appendChild(exchangeSign);
  //append button to row
  row.appendChild(exchangeButton);
  //append row to div
  parent.appendChild(row);
  //append new line to div
  parent.appendChild(br);
}

//remove all exchange buttons
function removeExchangeButtons() {
  //get the number of line breaks
  var numberBr = document.getElementsByTagName('br').length;
  //as there are 4 line breaks in HTML remove the 5th line break as long as there are any left
  for(var i = 4; i < numberBr; i++) {
    var br = document.getElementsByTagName('br')[4];
    br.parentNode.removeChild(br);
  }
  //get the number of exchange buttons
  var numberExchangeButtons = document.getElementsByClassName('exchange').length;
  //remove each exchange button
  for(var i = 0; i < numberExchangeButtons; i++) {
    var elem = document.getElementsByClassName('exchange')[0];
    elem.parentNode.removeChild(elem);
  }
}
//exchange two players
function exchangePlayer(n) {
  var playerOne = "";
  var playerTwo = "";
  //get name of the first player
  playerOne = document.getElementsByName('playerName')[(n - 1)].innerHTML;
  //get name of the second player
  playerTwo = document.getElementsByName('playerName')[n].innerHTML;
  //exchange names
  document.getElementsByName('playerName')[(n - 1)].innerHTML = playerTwo;
  document.getElementsByName('playerName')[n].innerHTML = playerOne;
}

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}
