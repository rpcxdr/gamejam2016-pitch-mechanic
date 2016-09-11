"use strict";
$(document).ready(function() {
  const gameState = {
    round: 0,
    player: 'human'
  };
  stateRecord.set('state', gameState);
})

const client = deepstream('104.236.166.136:6020', {
    mergeStrategy: deepstream.MERGE_STRATEGIES.LOCAL_WINS
}).login();
//const statusRecord = client.record.getRecord('room/1/status');
//const countRecord = client.record.getRecord('room/1/count');
var roomName = 'room/' + getParameterByName('room') + '/state';
const stateRecord = client.record.getRecord(roomName);
/*
const statusField = document.getElementById('status');

statusRecord.whenReady(function() {
  statusField.innerHTML = statusRecord.get('human-status');
});

statusRecord.subscribe('alien-status', function(status) {
  console.log(status);
  if(status === 'ready') {
      // the alien is now ready
      statusField.innerHTML = 'playing';
      statusRecord.set('human-status', 'playing');
  } else {
      // the alien started playing
  }
});

function done() {
  console.log('done');
  statusRecord.set('human-status', 'ready');
  statusField.innerHTML = 'ready';
}

document.getElementById('start').addEventListener('click', function(e) {
    e.preventDefault();

    countRecord.set('round-count', 1);
});
*/

document.getElementById('startRecording').addEventListener('click', function(e) {
  startPdStream();
});

document.getElementById('finishedGame').addEventListener('click', function(e) {
  var gameState = stateRecord.get('state');
  gameState.player='alien';
  gameState.pitches = window.pd.exportPitches();
  stateRecord.set('state', gameState);
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function hideElement(id) {
    document.getElementById(id).style.display = "none";
}
function showElement(id) {
    document.getElementById(id).style.display = "block";
}

var stories = ['human story zero', 'human  story juan!'];
stateRecord.subscribe('state', function(gameState) {
  console.log(gameState);
  if (gameState.player === 'alien') {
    //show the story
    hideElement('game');
    showElement('story');
  } else {
    showElement('game');
    hideElement('story');
    // show game[gameState.round]
    $("#total_score").html((gameState.score ? gameState.score : 0));
    $("#round_score").html((gameState.latestRoundScore ? gameState.latestRoundScore : 0));
    loadLevel(gameState.round + 1);
  }
});
