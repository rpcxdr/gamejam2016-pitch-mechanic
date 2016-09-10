
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
    renderer = PIXI.autoDetectRenderer(BOX_SIDE_SIZE, BOX_SIDE_SIZE);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    //Create a container object called the `stage`
    stage = new PIXI.Container();

    //Tell the `renderer` to `render` the `stage`
    
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

function gotStream(stream) {
    //var pd = new PitchDetect(stream, RECORDING_DURATION, BOX_SIDE_SIZE, REFRESH_RATE_MS, handlePitch);
    var pd = new PitchDetect(stream, RECORDING_DURATION, TIME_FACTOR,/*BOX_SIDE_SIZE/Math.log10(MAX_PITCH-MIN_PITCH)*/BOX_SIDE_SIZE/(MAX_PITCH-MIN_PITCH), BOX_SIDE_SIZE, REFRESH_RATE_MS, handlePitch);
    pd.start();
}