"use strict";

const client = deepstream('104.236.166.136:6020', {
    mergeStrategy: deepstream.MERGE_STRATEGIES.LOCAL_WINS
}).login();
const statusRecord = client.record.getRecord('room/1/status');
const countRecord = client.record.getRecord('room/1/count');

const statusField = document.getElementById('status');

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
