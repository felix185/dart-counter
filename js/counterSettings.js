//score to begin with
var startNumber = 501;
//doubleOut or singleOut
var doubleOut = true;
//array with playernames
var players = new Array();
//number of players to print as placeholder "Player 1", "Player 2",...
var numberOfPlayer = 1;

/**
* Javascript for Settings
*/

//set start number to 301 and save number in session Storage
$('#301').on('click', function () {
    startNumber = 301;
    document.getElementById('startnumber').innerText = 301;
    storeInSessionStorage("startNumber", startNumber);
})
//set start number to 501 and save number in session Storage
$('#501').on('click', function () {
    startNumber = 501;
    document.getElementById('startnumber').innerText = 501;
    storeInSessionStorage('startNumber', startNumber);
})
//set single out and save it in session Storage
$('#single').on('click', function () {
    doubleOut = false;
    document.getElementById('out').innerText = "Single Out";
    storeInSessionStorage('doubleOut', doubleOut);
})
//set double out and save it in session Storage
$('#double').on('click', function () {
    doubleOut = true;
    document.getElementById('out').innerText = "Double Out";
    storeInSessionStorage('doubleOut', doubleOut);
})
//adds a new input field for a new player
$('#addPlayer').on('click', function() {
    numberOfPlayer = numberOfPlayer + 1;
    var div = document.getElementById('players');
    var br = document.createElement('br');
    var input = document.createElement("input");

    input.type="text";
    input.className="form-control";
    input.placeholder="Player " + numberOfPlayer;
    input.name="player";

    div.appendChild(br);
    div.appendChild(input);
})
//removes the last added player
$('#removePlayer').on('click', function() {
    numberOfPlayer = numberOfPlayer - 1;
    var numberOfPlayers = document.getElementsByName('player').length;
    //must have at least one player
    if(numberOfPlayers-1 == 0) {
      alert('You need at least one Player!');
    } else {
      //remove input field of last player
      var elem = document.getElementsByName('player')[numberOfPlayers-1];
      elem.parentNode.removeChild(elem);
      //remove line break between the input fields
      var numberBr = document.getElementsByTagName('br').length;
      var br = document.getElementsByTagName('br')[numberBr-2];
      br.parentNode.removeChild(br);

      return false;
    }
})

$('#start').on('click', function() {
  if(typeof(Storage) !== "undefined") {
    getPlayers();
  } else {
    alert('Please use a modern Browser like Google Chrome or Mozilla Firefox!');
  }
})

/*
* Functions
*/

//sets an Item to session Storage
function storeInSessionStorage(key, value) {
  return window.sessionStorage.setItem(key, JSON.stringify(value));
}
//parses an Item from session Storage
function parseFromSessionStorage(key) {
  return JSON.parse(window.sessionStorage.getItem(key));
}
//getPlayers: get the names of the players and add them to the array. Then save the array in the local Storage and redirect to the new page
function getPlayers() {
  var correctNames = true;
  var currentName;
  var plr = document.getElementsByName('player');

  //save all names in an array. If any input field is empty set placeholder as name

  for (var j = 0; j < plr.length; j++) {
    currentName = plr[j].value;
    if(currentName == "") {
      currentName = "Player " + (1 + j);
    }
    players.push(currentName);
  }
  //store array in session storage
  storeInSessionStorage("players", players);
  //move to the game page
  window.location.href = "./counter.html";
}

function init() {
  //will be the String "double out" or "single out"
  var out;
  //get startNumber - this could be 301 or 501
  startNumber = parseFromSessionStorage('startNumber');
  //get doubleOut - this could be true (double) or false(single)
  doubleOut = parseFromSessionStorage('doubleOut');

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

  //print the chosen settings
  document.getElementById('startnumber').innerText = startNumber;
  document.getElementById('out').innerText = out;
}
