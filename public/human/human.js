"use strict";

const client = deepstream('104.236.166.136:6021').login();
const record = client.record.getRecord('room/1');

record.set('tones', [330,440,660,880,990]);
