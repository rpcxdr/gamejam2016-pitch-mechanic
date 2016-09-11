"use strict";
const REFRESH_RATE_MS = 60;
const RECORDING_DURATION = 3000; //3 seconds
const BOX_SIDE_SIZE = 500;
const MAX_PITCH = 1000;
const MIN_PITCH = 0;
const PITCH_FACTOR = BOX_SIDE_SIZE / MAX_PITCH;
const TIME_FACTOR = BOX_SIDE_SIZE / RECORDING_DURATION;
const TWEAK_FACTOR = 0.5;

$(document).ready(function() {

    var time = 0;
    //Create the renderer
    window.renderer = PIXI.autoDetectRenderer(BOX_SIDE_SIZE, BOX_SIDE_SIZE);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    //Create a container object called the `stage`
    window.stage = new PIXI.Container();

    PIXI.loader
    .add("../levels/L2.png")
    .load(setup);

    //Tell the `renderer` to `render` the `stage`
   // var texture = PIXI.utils.TextureCache["../levels/L2.png"];
    //window.level = new PIXI.Sprite(texture);
    /*
    var line = new PIXI.Graphics();
    line.lineStyle(4, 0xFFFFFF, 1);
    line.moveTo(100, 100);
    line.lineTo(80, 50);
    //line.x = 32;
    //line.y = 32;
    stage.addChild(line);
    renderer.render(stage);
    */

    getUserMedia(
    {
        "audio": {
            "mandatory": {
                "googEchoCancellation": "false",
                "googAutoGainControl": "false",
                "googNoiseSuppression": "false",
                "googHighpassFilter": "false"
            },
            "optional": []
        },
    }, gotStream);

});

//This `setup` function will run when the image has loaded
function setup() {

  //Create the `cat` sprite from the texture
  var level = new PIXI.Sprite(
    PIXI.loader.resources["../levels/L2.png"].texture
  );

  //Add the cat to the stage
  stage.addChild(level);

  //Render the stage   
  renderer.render(stage);
}

function error() {
    alert('Stream generation failed.');
}

var handlePitch = function(lastTime, lastPitch, time, pitch){
    console.log("hello?", lastPitch, lastTime, pitch, time);
    if(lastPitch !== BOX_SIDE_SIZE && pitch !== BOX_SIDE_SIZE && lastPitch > 0 && pitch > 0) {
        var line = new PIXI.Graphics();
        line.lineStyle(4, 0xFFFFFF, 1);
        line.moveTo(lastTime, lastPitch);
        line.lineTo(time, pitch);
        stage.addChild(level);
        stage.addChild(line);
        renderer.render(stage);
    }
}


function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e + " " + e.stack);
    }
}

window.pd = null;

function gotStream(stream) {
    //var pd = new PitchDetect(stream, RECORDING_DURATION, BOX_SIDE_SIZE, REFRESH_RATE_MS, handlePitch);
    pd = new PitchDetect(stream, RECORDING_DURATION, TIME_FACTOR,/*BOX_SIDE_SIZE/Math.log10(MAX_PITCH-MIN_PITCH)*/BOX_SIDE_SIZE/(MAX_PITCH-MIN_PITCH), BOX_SIDE_SIZE, REFRESH_RATE_MS, handlePitch);
    pd.start();
}
function startPdStream() {
    if (pd) {
        pd.start();
    } else {
        console.log("No pd initialized yet!");
    }
}