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
function setElementHtml(id, html) {
    document.getElementById(id).innerHTML = html;
}

var htmlStory = [
    '<img src="../images/human waiting (game).png"></img> Waiting for confirmation from aliens...', 
    '<img src="../images/aliens landing (game).png"></img>Hopefully they get the signal in time. I don\'t want them destroying cities or landing on people.',
    '<img src="../images/human waiting (game).png"></img> We hope the aliens don\'t get hit!', 
    'The End'];
var htmlGame = [
    'I think the pitch of the noise is what shaped the clouds.  I\'m gonna try to send a simple image back. Try to send this shape using the sound of your voice.', 
    'Wait, what!?! The aliens have entered our atmosphere and are quickly making their way to the surface. The ships are unarmed, so we will let them land, but I can\'t just let them land anywhere! There is a nearby hill that would make a good landing pad. Try to send a hill shape to the aliens.',
    'Well that\'s not what we expected.  The aliens have landed on every mountain top on earth.  At least their ships didn\'t crush anyone there.  We need to tell them to watch out for our roads so that we don\'t crush them!',
    'The End'];

var stories = ['human story zero', 'human  story juan!'];
stateRecord.subscribe('state', function(gameState) {
  console.log(gameState);

  if (gameState.round === 3) {
      window.location.href = "story-end.html?score="+gameState.score;
  }

  if (gameState.player === 'alien') {
    //show the story
    hideElement('game');
    showElement('story');
    setElementHtml('story', htmlStory[gameState.round]);
  } else {
    showElement('game');
    hideElement('story');
    setElementHtml('game-story', htmlGame[gameState.round]);

    // show game[gameState.round]
    $("#total_score").html(Math.floor(gameState.score ? gameState.score : 0));
    $("#round_score").html(Math.floor(gameState.latestRoundScore ? gameState.latestRoundScore : 0));
    loadLevel(gameState.round + 1);
  }
});
