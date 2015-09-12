'use strict';
var common = require('../common');
var assert = require('assert');

var spawn = require('child_process').spawn;

var cat = spawn(common.isWindows ? 'more' : 'cat');
cat.stdin.write('hello');
cat.stdin.write(' ');
cat.stdin.write('world');

assert.ok(cat.stdin.writable);
assert.ok(!cat.stdin.readable);

cat.stdin.end();

var response = '';
var exitStatus = -1;
var closed = false;

var gotStdoutEOF = false;

cat.stdout.setEncoding('utf8');
cat.stdout.on('data', function(chunk) {
  console.log('stdout: ' + chunk);
  response += chunk;
});

cat.stdout.on('end', function() {
  gotStdoutEOF = true;
});


var gotStderrEOF = false;

cat.stderr.on('data', function(chunk) {
  // shouldn't get any stderr output
  assert.ok(false);
});

cat.stderr.on('end', function(chunk) {
  gotStderrEOF = true;
});


cat.on('exit', function(status) {
  console.log('exit event');
  exitStatus = status;
});

cat.on('close', function() {
  closed = true;
  if (common.isWindows) {
    assert.equal('hello world\r\n', response);
  } else {
    assert.equal('hello world', response);
  }
});

process.on('exit', function() {
  assert.equal(0, exitStatus);
  assert.equal(gotStdoutEOF, true);
  assert.equal(gotStderrEOF, true);
  assert(closed);
  if (common.isWindows) {
    assert.equal('hello world\r\n', response);
  } else {
    assert.equal('hello world', response);
  }
});
