"use strict";

const client = deepstream('104.236.166.136:6020', {
    mergeStrategy: deepstream.MERGE_STRATEGIES.LOCAL_WINS
}).login();
const statusRecord = client.record.getRecord('room/1/status');

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
