"use strict";
var sin;
var playbackT;
var isPlaying = false;
var isRecording = false;
var pitchFrames = new Array(100);
var msPerFrame = 60;
for (var i=0;i<pitchFrames.length;i++) {
    pitchFrames[i] = 0;
}
$(document).ready(function() {
    console.log("Hello Nerf");
    sin =T("sin");//.play();
    playbackT = T("sin");//.play();
});

function setPitch() {
    var pitch = $("#pitch").val();
    console.log("pitch: "+pitch);
    sin.set({freq:parseInt(pitch)});
}

setInterval(function () {
    var t = new Date().getTime();
    var epocFrame = Math.floor(t/msPerFrame);
    var frameIndex = epocFrame % pitchFrames.length;
    //console.log("playing index: "+frameIndex );
    if (isRecording) {
        var pitch = $("#pitch").val();
        pitchFrames[frameIndex] = pitch;
        console.log("recording pitch: "+pitch);
    }
    if (isPlaying) {
        var pitch = parseInt(pitchFrames[frameIndex]);
        playbackT.set({freq:pitch});
        console.log("playing pitch: "+pitch);
    }
}, msPerFrame);

function play() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        sin.pause();
        playbackT.play();
    } else {
        sin.play();
        playbackT.pause();
        
    }
    console.log("isPlaying "+isPlaying);
}
function recordPitches() {
    isRecording = !isRecording;
    console.log("isRecording "+isRecording);
}

const client = deepstream('104.236.166.136:6020').login();
const record = client.record.getRecord('room/1');

function sendDrawing() {
  console.log("sendDrawing: "+pitchFrames);
    record.set('humanPitches', pitchFrames);
}

record.whenReady(function() {
  var f = record.get('humanPitches');
  if (f) {
      pitchFrames = f;
      console.log("whenReady:"+pitchFrames);
  }
});

record.subscribe("humanPitches", function (foo) {
  pitchFrames = record.get('humanPitches');
  console.log("subscribe got: "+pitchFrames);
});

loadPixels("test-alien-drawing.png", "goal", function (drawnPixels) {
    //console.log("loadCanvas.onload sfssss got: ",drawnPixels);
    loadPixels("test-goal-drawing.png", "drawn",function (goalPixels) {
        //console.log("loadCanvas.onload sfssss2 got: ",goalPixels);
        var h = 200;
        var w = 200;
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
               var visualScoreContext = visualScoreCanvas.getContext('2d');
               visualScoreContext.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
               visualScoreContext.fillRect( x, y, 1, 1 );

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
    });
});

var visualScoreCanvas;
function loadPixels(dataURL, targetCanvasName, handlePixels) {
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
        var p1d = context.getImageData(0, 0, 200, 200).data
        var h = 200;
        var w = 200;
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
}
/*
var texture = PIXI.Texture.fromImage('test-alien-drawing.png');
var bunny = new PIXI.Sprite(texture);
// create the root of the scene graph
var stage = new PIXI.Container();
var renderer = PIXI.autoDetectRenderer(800, 600,{backgroundColor : 0x1099bb});
var goalElement = document.getElementById("goal");
if (goalElement) {
    document.body.appendChild(renderer.view);
}
*/
/*
var loader = new PIXI.ImageLoader("test-alien-drawing.png");
loader.onLoaded = makeSprites.bind(this);
loader.load();
function makeSprites() { 
    copnsole.log("imge loaded");
    var goalElement = document.getElementById("goal");
    if (goalElement) {
        var texture = PIXI.TextureCache["images/anyImage.png"];
           renderer = PIXI.autoDetectRenderer(BOX_SIDE_SIZE, BOX_SIDE_SIZE);
        goalElement.appendChild();
            //Add the canvas to the HTML document
            document.body.appendChild(renderer.view);

    }

    //var d = document.getElementById("drawn");
        document.body.appendChild(renderer.view);

}*/