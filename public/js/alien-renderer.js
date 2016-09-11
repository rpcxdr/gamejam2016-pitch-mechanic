"use strict";
const REFRESH_RATE_MS = 60;
const RECORDING_DURATION = 3000; //3 seconds
const BOX_SIDE_SIZE = 500;
const MAX_PITCH = 1000;
const MIN_PITCH = 1;
const PITCH_FACTOR = BOX_SIDE_SIZE / MAX_PITCH;
const TIME_FACTOR = BOX_SIDE_SIZE / RECORDING_DURATION;
const TWEAK_FACTOR = 0.5;

$(document).ready(function() {

    var time = 0;
    //Create the renderer
    window.renderer = PIXI.autoDetectRenderer(BOX_SIDE_SIZE, BOX_SIDE_SIZE);

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);

    window.playbackT = T("sin");//.play();

    //Create a container object called the `stage`
    window.stage = new PIXI.Container();
    var sd = new SliderDrawer(RECORDING_DURATION, BOX_SIDE_SIZE, TIME_FACTOR, PITCH_FACTOR, REFRESH_RATE_MS, handlePitch)

    $("#pitch").mousedown(function () {
        sd.record();
    });

    $("#pitch").mouseup(function() {
        sd.stopRecording();
    });

    $("body").keypress(function(){
        sd.start();
    });

    playbackT.play();

    setInterval(function () {
        var pitch = sd.getPitch();
        playbackT.set({freq: parseInt(pitch)});
    }, REFRESH_RATE_MS);
});

var handlePitch = function(lastTime, lastPitch, time, pitch){
    console.log("hello?", lastTime, lastPitch, time, pitch);
    if(lastPitch !== BOX_SIDE_SIZE && pitch !== BOX_SIDE_SIZE && lastPitch > 0 && pitch > 0) {
        var line = new PIXI.Graphics();
        line.lineStyle(4, 0xFFFFFF, 1);
        line.moveTo(lastTime, lastPitch);
        line.lineTo(time, pitch);
        stage.addChild(line);
        renderer.render(stage);
    }
}




class SliderDrawer {
  constructor(recordDuration, boxSide, timeFactor, pitchFactor, msDelay, handler) {
    this.msDelay = msDelay;
    this.handler = handler;
    this.pitchArr = [];
    this.currentTime = 0;
    this.isRunning = false;
    this.timeFactor = timeFactor;
    this.recordDuration = recordDuration;
    this.isRecording = false;
    this.pitchFactor = pitchFactor;
    this.boxSide = boxSide;
  }

  record(){
    this.isRecording = true;
    //playbackT.play();
  }

  stopRecording(){
    this.isRecording = false;
    //playbackT.pause();
  }

  /*playSound() {
    var t = new Date().getTime();
    var epocFrame = Math.floor(t/msPerFrame);
    var frameIndex = epocFrame % pitchFrames.length;
    console.log("playing index: "+frameIndex );

    var pitch = parseInt(pitchFrames[frameIndex]);
    playbackT.set({freq:pitch});
    console.log("playing pitch: "+pitch);
}*/

  start(){
    this.currentTime = 0;
    this.pitchArr = [];
    this.pitchArr.push(this.getPitch());
    this.isRunning = true;
    const self = this;
    var interval = setInterval(function() {
        if(self.isRunning){
            
            self.pitchArr.push(self.getPitch());
            self.handler(
                self.currentTime * self.timeFactor,
                self.boxSide - self.pitchArr[self.pitchArr.length - 2] * self.pitchFactor,
                (self.currentTime + self.msDelay) * self.timeFactor,
                self.boxSide -self.pitchArr[self.pitchArr.length - 1] * self.pitchFactor
            );
            self.currentTime = self.currentTime + self.msDelay;
        }
        if(self.currentTime > self.recordDuration){
            this.isRunning = false;
            //playbackT.pause();
            clearInterval(interval);
        }
    }, this.msDelay);
  }

  exportPitches(){
      return this.pitchArr;
  }

  getPitch() {
    return (this.isRecording ? $("#pitch").val() : 0);
  }
}