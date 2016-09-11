"use strict";
const REFRESH_RATE_MS = 6;
const RECORDING_DURATION = 3000; //3 seconds
const BOX_SIDE_SIZE = 500;
const MAX_PITCH = 1000;
const MIN_PITCH = 1;
const PITCH_FACTOR = BOX_SIDE_SIZE / MAX_PITCH;
const TIME_FACTOR = BOX_SIDE_SIZE / RECORDING_DURATION;
const TWEAK_FACTOR = 0.5;

var graphics;

$(document).ready(function() {
    var time = 0;
    //Create the renderer
    window.renderer = new PIXI.autoDetectRenderer(BOX_SIDE_SIZE, BOX_SIDE_SIZE);
    window.renderer.backgroundColor = 0xFFFFFF;
    //Add the canvas to the HTML document
    document.getElementById('play-canvas').appendChild(renderer.view);

    window.playbackT = T("sin");//.play();

    //Create a container object called the `stage`
    window.stage = new PIXI.Container();
    renderer.render(stage);
    window.sd = new SliderDrawer(RECORDING_DURATION, BOX_SIDE_SIZE, TIME_FACTOR, PITCH_FACTOR, REFRESH_RATE_MS, handlePitch)

    graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    $("#pitch").mousedown(function () {
        sd.record();
    });

    $("#pitch").mouseup(function() {
        sd.stopRecording();
    });

    $("body").keypress(function(){
        sd.start();
        play();
    });

    playbackT.play();

    setInterval(function () {
        var pitch = sd.getPitch();
        playbackT.set({freq: parseInt(pitch)});
    }, REFRESH_RATE_MS);
});

function clearStage() {
  graphics.clear();
  renderer.render(stage);
}
window.clearStage = clearStage;


var handlePitch = function(lastTime, lastPitch, time, pitch){
    console.log("hello?", lastTime, lastPitch, time, pitch);
    graphics.lineStyle(1, 0xFFFFFF, 1);
    graphics.beginFill(0xFFFFFF);
    graphics.drawRect(0, BOX_SIDE_SIZE, BOX_SIDE_SIZE, -10);
    graphics.endFill();

    graphics.beginFill(0x9966FF);
    graphics.drawCircle(time, BOX_SIDE_SIZE - 5, 5);
    graphics.endFill();

    if(lastPitch !== BOX_SIDE_SIZE && pitch !== BOX_SIDE_SIZE && lastPitch > 0 && pitch > 0) {
        graphics.lineStyle(6, 0x000000, 1);
        graphics.moveTo(lastTime, lastPitch);
        graphics.lineTo(time, pitch);
    }
    renderer.render(stage);
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
    this.i = 0;
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
    this.pitchArr.push(this.getPitch() * this.pitchFactor);
    this.isRunning = true;
    const self = this;
    var interval = setInterval(function() {
        if(self.isRunning){
            self.i++;
            self.pitchArr.push(self.getPitch() * self.pitchFactor);
            if(self.i % 10 === 0){
                self.handler(
                    (self.currentTime - 10 * self.msDelay) * self.timeFactor,
                    self.boxSide - self.pitchArr[self.pitchArr.length - 11],
                    (self.currentTime + self.msDelay) * self.timeFactor,
                    self.boxSide -self.pitchArr[self.pitchArr.length - 1]
                );
            }
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
      console.log("wubalubadubdub", this.pitchArr.length, this.pitchArr);
      return this.pitchArr;
  }

  getPitch() {
    return (this.isRecording ? $("#pitch").val() : 0);
  }
}
