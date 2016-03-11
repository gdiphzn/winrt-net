'use strict';

System.register(['net', 'buffer', 'stream'], function (_export, _context) {
	var net, Buffer, stream, port, socket;
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
			socket = new net.Socket();

			socket.connect(port, 'localhost');

			socket.on('connect', function () {
				console.log('# socket connect');
				socket.pipe(socket);
			});

			socket.on('data', function (data) {
				console.log('# socket data |', data.length, '|', data.toString());
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR');
			});

			socket.on('close', function (err) {
				console.log('# socket close');
			});
		}
	};
});