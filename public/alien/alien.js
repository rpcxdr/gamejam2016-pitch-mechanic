"use strict";
var playbackPitchesAray;
var isPlaying = false;
var BOX_SIZE = 500;
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

function hideElement(id) {
    document.getElementById(id).style.display = "none";
}
function showElement(id) {
    document.getElementById(id).style.display = "block";
}

var stories = ['story zero', 'story 1'];
stateRecord.subscribe('state', function(gameState) {
  console.log(gameState);
  if (gameState.player === 'alien') {
    pitches = gameState.pitches;
    showElement('game');
    hideElement('story');
  } else {
    hideElement('game');
    showElement('story');
    clearStage();
  }
});

document.getElementById('finishedGame').addEventListener('click', function(e) {

  console.log("derpnado");
  var gameState = stateRecord.get('state');
  gameState.player='human';
  gameState.round++;
  loadPixelsFromUrl("/levels/L" + gameState.round + "goal.png", "scoring-canvas", function(pixels) {
    var drawnPixels = loadPixelsFromPitchData(sd.exportPitches());
    //var drawnPixels = loadPixelsFromCanvas("play-canvas");
    //console.log(drawnPixels);
    var score = getScore(drawnPixels, pixels);
    console.log(score);
    if(!gameState.score) gameState.score = 0;
    gameState.score += score;
    gameState.latestRoundScore = score;
    $("#total_score").html(gameState.score);
    $("#round_score").html(score);
    stateRecord.set('state', gameState);
  });


});

function loadPixelsFromCanvas(targetCanvasName) {
  console.log("loadPixelsFromCanvas targetCanvasName: "+targetCanvasName);
  var context = getCanvasContext(targetCanvasName);
  if(!context) {
    return false;
  }
  var p1d = context.getImageData(0, 0, BOX_SIZE, BOX_SIZE).data;
  var h = BOX_SIZE;
  var w = BOX_SIZE;
  var p2d = new Array(w);
  for (var x=0; x<w; x++) {
      p2d[x] = new Array(h);
      for (var y=0; y<h; y++) {
          var i = (x+y*w)*4;
          p2d[x][y] = [ p1d[i], p1d[i+1], p1d[i+2], p1d[i+3] ];
      }
  }
  //console.log("woooah", p2d);
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

function loadPixelsFromPitchData(pitchData){
    var p2d = new Array(BOX_SIZE);
    for(var x = 0; x < BOX_SIZE; x++){
        p2d[x] = new Array(BOX_SIZE);
        //console.log("placing ", x, pitchData[x]);
        p2d[x][pitchData[x]] = (pitchData[x] ? true : false);
    }
    return p2d;
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
    var visualScoreCanvas = document.getElementById("drawn")
  /*loadPixels("test-alien-drawing.png", "goal", function (drawnPixels) {
    //console.log("loadCanvas.onload sfssss got: ",drawnPixels);
    loadPixels("test-goal-drawing.png", "drawn",function (goalPixels) {
        //console.log("loadCanvas.onload sfssss2 got: ",goalPixels);*/
    var h = BOX_SIZE;
    var w = BOX_SIZE;
    var p2d = new Array(w);
    var scoreMax = 0;
    var scoreTotal = 0;
    for (var x=0; x<w; x++) {
        p2d[x] = new Array(h);
        var goalInColumn = false;
        var drawnInColumn = false;
        var drawnCountInColumn = 0;
        var isScored = false;
        for (var y=0; y<h; y++) {
            //console.log(x,y);
            var drawn = drawnPixels[x][y];
            var goal = (!goalPixels[x][y][0] && !goalPixels[x][y][3]);
            if (drawn) {
                drawnCountInColumn++;
                console.log("there's a pixel drawn at:", x , y);
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
    console.log("You scored "+scoreTotal+"/"+scoreMax+": %"+(scoreTotal/scoreMax)*100 )
    return (scoreTotal/scoreMax)*100;
}


/*function loadPixels(dataURL, targetCanvasName, handlePixels) {
  console.log("loadCanvas got: "+dataURL);
//        var canvas = document.getElementById('myCanvas');

    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function() {
//        console.log("loadCanvas.onload got: ",context.getImageData(0, 0, 200, 200));
        if(targetCanvasName){
            var targetElement = document.getElementById(targetCanvasName);
            if (!targetElement) {
                return;
            }
            var context = targetElement.getContext('2d');
            context.drawImage(this, 0, 0);
            visualScoreCanvas = targetElement;
        }
        var p1d = context.getImageData(0, 0, BOX_SIZE, BOX_SIZE).data
        var h = BOX_SIZE;
        var w = BOX_SIZE;
        var p2d = new Array(w);
        for (var x=0; x<w; x++) {
            p2d[x] = new Array(h);
            for (var y=0; y<h; y++) {
                var i = (x+y*w)*4;
                p2d[x][y] = [ p1d[i], p1d[i+1], p1d[i+2], p1d[i+3] ];
            }
        }
//        handlePixels(context.getImageData(0, 0, 200, 200).data);
        handlePixels(p2d);
    };

    imageObj.src = dataURL;
}*/
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
