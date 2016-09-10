"use strict";

const client = deepstream('104.236.166.136:6020').login();
const record = client.record.getRecord('room/1');

const statusField = document.getElementById('status');

record.whenReady(function() {
  statusField.innerHTML = record.get('alien-status');
});

record.subscribe('human-status', function(status) {
  if(status === 'ready') {
      // the human is now ready for you to play
      statusField.innerHTML = 'playing';
      record.set('alien-status', 'playing');
  } else {
      // the human started playing
  }
});

function done() {
  record.set('alien-status', 'ready');
  statusField.innerHTML = 'ready';
}
