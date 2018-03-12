'use strict';

System.register(['net', 'buffer', 'stream'], function (_export, _context) {
	"use strict";

	var net, Buffer, stream, port, buf1, buf2, buf3, buf4, buf5, arr, buf6, buf7, buf8, msg9, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_buffer) {
			Buffer = _buffer.Buffer;
		}, function (_stream) {
			stream = _stream.default;
		}],
		execute: function () {
			port = 22112;
			buf1 = new Buffer(10);
			buf2 = new Buffer([1, 2, 3]);
			buf3 = new Buffer('test');
			buf4 = new Buffer('tést', 'utf8');
			buf5 = new Buffer('hello world', 'ascii');
			arr = new Uint8Array(2);

			arr[0] = 97; // 'a'
			arr[1] = 98; // 'b'
			buf6 = new Buffer(arr);
			buf7 = new Buffer(arr.buffer);
			buf8 = new Buffer('ěščřžýáíéúůďťň ĚŠČŘŽÝÁÍÉÚŮĎŤŇ ;+=/(\'"!°ˇ´)§,.-');
			msg9 = 'ěščřžýáíéúůďťň ĚŠČŘŽÝÁÍÉÚŮĎŤŇ ;+=/(\'"!°ˇ´)§,.-';
			socket = new net.Socket();

			socket.connect(port, 'localhost');

			socket.on('connect', function () {
				console.log('# socket connect');

				setTimeout(function () {
					return socket.write(buf1);
				}, 100);
				setTimeout(function () {
					return socket.write(buf2);
				}, 200);
				setTimeout(function () {
					return socket.write(buf3);
				}, 300);
				setTimeout(function () {
					return socket.write(buf4);
				}, 400);
				setTimeout(function () {
					return socket.write(buf5);
				}, 500);
				setTimeout(function () {
					return socket.write(buf6);
				}, 600);
				setTimeout(function () {
					return socket.write(buf7);
				}, 700);
				setTimeout(function () {
					return socket.write(buf8);
				}, 800);
				setTimeout(function () {
					return socket.write(msg9);
				}, 900);
			});

			socket.on('data', function (data) {
				console.log('# socket data |', data.length);
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR');
			});
		}
	};
});