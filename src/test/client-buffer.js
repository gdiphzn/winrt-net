import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;

// examples taken from https://nodejs.org/api/buffer.html

// creates a buffer of length 10
var buf1 = new Buffer(10);
// creates a buffer containing [01, 02, 03]
var buf2 = new Buffer([1,2,3]);
// creates a buffer containing ASCII bytes [74, 65, 73, 74]
var buf3 = new Buffer('test');
// creates a buffer containing UTF8 bytes [74, c3, a9, 73, 74]
var buf4 = new Buffer('tést', 'utf8');
var buf5 = new Buffer('hello world', 'ascii');

var arr = new Uint8Array(2);
arr[0] = 97; // 'a'
arr[1] = 98; // 'b'
var buf6 = new Buffer(arr); // copies the buffer
var buf7 = new Buffer(arr.buffer); // shares the memory with arr;

var buf8 = new Buffer('ěščřžýáíéúůďťň ĚŠČŘŽÝÁÍÉÚŮĎŤŇ ;+=/(\'"!°ˇ´)§,.-');
var msg9 = 'ěščřžýáíéúůďťň ĚŠČŘŽÝÁÍÉÚŮĎŤŇ ;+=/(\'"!°ˇ´)§,.-';



var socket = new net.Socket();
socket.connect(port, 'localhost');

socket.on('connect', function() {
	console.log('# socket connect')

	setTimeout(() => socket.write(buf1), 100)
	setTimeout(() => socket.write(buf2), 200)
	setTimeout(() => socket.write(buf3), 300)
	setTimeout(() => socket.write(buf4), 400)
	setTimeout(() => socket.write(buf5), 500)
	setTimeout(() => socket.write(buf6), 600)
	setTimeout(() => socket.write(buf7), 700)
	setTimeout(() => socket.write(buf8), 800)
	setTimeout(() => socket.write(msg9), 900)
});

socket.on('data', function(data) {
	console.log('# socket data |', data.length);
});

socket.on('end', function() {
	console.log('# socket end')
});

socket.on('error', function(err) {
	console.log('# socket ERROR')
});

