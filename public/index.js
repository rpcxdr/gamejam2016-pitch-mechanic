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
    console.log("playing index: "+frameIndex );
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
function play2() {
    sin.pause();
    timbre.rec(function(output) {
        var midis = [69, 71, 72, 76, 69, 71, 72, 76];
        var msec  = timbre.timevalue("bpm120 l8");
        var synth = T("OscGen", {env:T("perc", {r:msec, ar:true})});

        T("interval", {interval:msec}, function(count) {
            if (count < midis.length) {
            synth.noteOn(midis[count], 100);
            } else {
            output.done();
            }
        }).start();

        output.send(synth);
     }).then(function(result) {
        var L = T("buffer", {buffer:result, loop:true});
        var R = T("buffer", {buffer:result, loop:true});

        var num = 400;
        var duration = L.duration;

        R.pitch = (duration * (num - 1)) / (duration * num);

        T("delay", {time:"bpm120 l16", fb:0.1, cross:true},
            T("pan", {pos:-0.6}, L), T("pan", {pos:+0.6}, R)
        ).play();
   });

}

const client = deepstream('104.236.166.136:6020').login();
const record = client.record.getRecord('room/1');

function sendDrawing() {
  console.log("sendDrawing: "+pitchFrames);
    record.set('humanPitches', pitchFrames);
}

record.whenReady(function() {
  //pitchFrames = record.get('humanPitches');
  //console.log("whenReady:"+pitchFrames);
})
record.subscribe("humanPitches", function (foo) {
  pitchFrames = record.get('humanPitches');
  console.log("subscribe got: "+pitchFrames);
});