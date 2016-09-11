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
  loadPixelsFromUrl("/levels/L" + gameState.round + "goal.png", "scoring-canvas", function(pixels) {
    var drawnPixels = loadPixelsFromCanvas("play-canvas");
    console.log(drawnPixels);
    var score = getScore(drawnPixels, pixels);
    gameState.score += score;  
    //stateRecord.set('state', gameState);
  });
  
  
});

function loadPixelsFromCanvas(targetCanvasName) {
  console.log("loadPixelsFromCanvas targetCanvasName: "+targetCanvasName);
  var context = getCanvasContext(targetCanvasName);
  if(!context) {
    return false;
  }
  var p1d = context.getImageData(0, 0, 200, 200).data;
  var h = 500;
  var w = 500;
  var p2d = new Array(w);
  for (var x=0; x<w; x++) {
      p2d[x] = new Array(h);
      for (var y=0; y<h; y++) {
          var i = (x+y*w)*4;
          p2d[x][y] = [ p1d[i], p1d[i+1], p1d[i+2], p1d[i+3] ];
      }
  }
  return p2d;
}

function loadPixelsFromUrl(dataURL, targetCanvasName, handlePixels) {
  console.log("loadPixels got url: "+dataURL);
    var imageObj = new Image();
    imageObj.onload = function() {
      console.log("loadPixels got image "+imageObj);
      var context = getCanvasContext(targetCanvasName);
      if(context) {
        context.drawImage(this, 0, 0);
      }
      handlePixels(loadPixelsFromCanvas(targetCanvasName));
    };

    imageObj.src = dataURL;
}

function getCanvasContext(targetCanvasName) {
  if(targetCanvasName){
          var targetElement = document.getElementById(targetCanvasName);
          if (!targetElement) {
              return;
          }
          var context = targetElement.getContext('2d');
          return context;
      }  
}

function getScore(drawnPixels, goalPixels) {
  /*loadPixels("test-alien-drawing.png", "goal", function (drawnPixels) {
    //console.log("loadCanvas.onload sfssss got: ",drawnPixels);
    loadPixels("test-goal-drawing.png", "drawn",function (goalPixels) {
        //console.log("loadCanvas.onload sfssss2 got: ",goalPixels);*/
    var h = 500;
    var w = 500;
    var p2d = new Array(w);
    var scoreMax = 0;
    var scoreTotal = 0;
    for (var x=0; x<w; x++) {
        p2d[x] = new Array(h);
        var goalInColumn = false;
        var drawnInColumn = false;
        var isScored = false;
        for (var y=0; y<h; y++) {
            //console.log(x,y);
            var drawn = drawnPixels[x][y][0];
            var goal = !goalPixels[x][y][0];
            if (drawn) {
                drawnInColumn = true;
                if(goal){
                    scoreTotal++;
                }
            }
            if(!isScored && goal){
                isScored = true;
                scoreMax++;
                goalInColumn = true;
            }
            if(isScored && !goal){
                isScored = false;
            }
            
            var r=(drawn && !goal)?255:0;
            var g=(drawn && goal)?255:0;;
            var b=0;
            var a=255;
            /*
            var visualScoreContext = visualScoreCanvas.getContext('2d');
            visualScoreContext.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
            visualScoreContext.fillRect( x, y, 1, 1 );
            */

        }
        if(!goalInColumn && drawnInColumn){
                scoreMax++;
            }
        if(!goalInColumn && !drawnInColumn){
            scoreMax++;
            scoreTotal++;
        }
    }
    scoreTotal /= 2;
    console.log("You scored "+scoreTotal+"/"+scoreMax+": %"+(scoreTotal/scoreMax)*100 )
        /*
    });
});
  */
}
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

