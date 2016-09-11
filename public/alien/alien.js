"use strict";
var playbackPitchesAray;
var isPlaying = false;
$(document).ready(function() {
    console.log("Hello Nerf");
    playbackPitchesAray = T("sin");//.play();
    playbackPitchesAray.pause();
});
var msPerFrame = 60;
const client = deepstream('104.236.166.136:6020', {
    mergeStrategy: deepstream.MERGE_STRATEGIES.LOCAL_WINS
}).login();
//const statusRecord = client.record.getRecord('room/1/status');
//const countRecord = client.record.getRecord('room/1/count');
const stateRecord = client.record.getRecord('room/1/state');

/*
const statusField = document.getElementById('status');
*/
document.getElementById('start').addEventListener('click', function(e) {
    e.preventDefault();
    console.log('test');
    const gameState = {
      round: 0,
      player: 'human'
    };
    stateRecord.set('state', gameState);
});



setInterval(function () {
  var playbackCurrentTime = new Date().getTime();
  var timeSinceStart = playbackCurrentTime - playbackStartTime;
  var pitchIndex = Math.floor(timeSinceStart/msPerFrame);
  //    pitchIndex = pitchIndex % pitches.length;
  if (pitches && pitchIndex>pitches.length) {
    playbackPitchesAray.pause();
    return;
  }
    if (isPlaying) {
    console.log("playing index: "+pitchIndex );
        var pitch = parseInt(pitches[pitchIndex]);
        playbackPitchesAray.set({freq:pitch});
        console.log("playing pitch: "+pitch);
    }
}, msPerFrame);

var playbackStartTime;
function play() {
    isPlaying = !isPlaying;
    if (isPlaying) {
       playbackStartTime = new Date().getTime();
       playbackPitchesAray.play();
       console.log("Starting playback ");
    } else {
        playbackPitchesAray.pause();
    }
    console.log("isPlaying "+isPlaying);
}
var pitches;

var stories = ['story zero', 'story 1'];
stateRecord.subscribe('state', function(gameState) {
  console.log(gameState);
  if (gameState.player === 'alien') {
    // show game[gameState.round]
    document.getElementById('story').innerText = "GAME MODE ROUND " + gameState.round;
    console.log("pitcvhes",     gameState.pitches);
    pitches = gameState.pitches;
  } else {
    // show stories[gameState.round]
    document.getElementById('story').innerText = stories[gameState.round];
  }
});

document.getElementById('finishedGame').addEventListener('click', function(e) {
  var gameState = stateRecord.get('state');
  gameState.player='human';
  gameState.round++;
  stateRecord.set('state', gameState);
});

/*
statusRecord.whenReady(function() {
  statusField.innerHTML = statusRecord.get('alien-status');
});

statusRecord.subscribe('human-status', function(status) {
  if(status === 'ready') {
      // the human is now ready for you to play
      statusField.innerHTML = 'playing';
      statusRecord.set('alien-status', 'playing');
  } else {
      // the human started playing
  }
});

function done() {
  statusRecord.set('alien-status', 'ready');

  let round = countRecord.get('round-count');
  round++;
  if(!round) countRecord.set('round-count', 1);
  else countRecord.set('round-count', round);

  statusField.innerHTML = 'ready ' + round;
}
*/

