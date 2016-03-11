'use strict';

System.register(['net', 'fs'], function (_export, _context) {
	var net, fs, port, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_fs) {
			fs = _fs.default;
		}],
		execute: function () {
			port = 22112;
			socket = new net.Socket();

			socket.connect(port, 'localhost', function () {
				console.log('connected to server!');
			});

			socket.on('connect', function () {
				console.log('socket connect');
				var fileReadStream = fs.createReadStream('images/source.png');
				fileReadStream.pipe(socket);
			});

			socket.on('data', function (data) {
				//console.log('-- socket data |', data.length, '|', data.toString());
				console.log('-- socket data |', data.length);
			});

			socket.on('end', function () {
				console.log('socket end');
			});

			socket.on('error', function (err) {
				console.log('socket ERROR');
			});
		}
	};
});