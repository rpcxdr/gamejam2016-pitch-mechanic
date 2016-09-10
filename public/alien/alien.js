"use strict";

const client = deepstream('104.236.166.136:6020').login({username: 'adrian'});
const record = client.record.getRecord('room/1');

record.whenReady(function() {
  const tones = record.get();
  console.log(tones);
})
