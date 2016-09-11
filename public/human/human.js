"use strict";

const client = deepstream('104.236.166.136:6020', {
    mergeStrategy: deepstream.MERGE_STRATEGIES.LOCAL_WINS
}).login();
//const statusRecord = client.record.getRecord('room/1/status');
//const countRecord = client.record.getRecord('room/1/count');
const stateRecord = client.record.getRecord('room/1/state');
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

var stories = ['human story zero', 'human  story juan!'];
stateRecord.subscribe('state', function(gameState) {
  console.log(gameState);
  if (gameState.player === 'alien') {
    // show stories[gameState.round]
    document.getElementById('story').innerText = stories[gameState.round];
  } else {
    // show game[gameState.round]
    document.getElementById('story').innerText = "GAME MODE ROUND "+gameState.round;
    $("#total_score").html((gameState.score ? gameState.score : 0));
    $("#round_score").html((gameState.latestRoundScore ? gameState.latestRoundScore : 0));
    loadLevel(gameState.round + 1);
  }
});
