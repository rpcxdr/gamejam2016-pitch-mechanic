"use strict";

const client = deepstream('104.236.166.136:6020').login();
const record = client.record.getRecord('room/1');

const statusField = document.getElementById('status');

record.whenReady(function() {
  statusField.innerHTML = record.get('human-status');
});

record.subscribe('alien-status', function(status) {
  if(status === 'ready') {
      // the alien is now ready
      statusField.innerHTML = 'playing';
      record.set('human-status', 'playing');
  } else {
      // the alien started playing
  }
});

function done() {
  record.set('human-status', 'ready');
  statusField.innerHTML = 'ready';
}
