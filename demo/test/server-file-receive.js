'use strict';

System.register(['net', 'fs'], function (_export, _context) {
	"use strict";

	var net, fs, port, server;
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_fs) {
			fs = _fs.default;
		}],
		execute: function () {
			port = 22112;
			server = net.createServer(function (socket) {

				console.log('user connected: ' + socket.remoteAddress + ":" + socket.remotePort);

				var fileWriteStream = fs.createWriteStream(basepath + 'received.png');
				socket.on('data', function (data) {
					console.log('# socket data |', data.length);
					fileWriteStream.write(data);
					fileWriteStream.end();
				});

				socket.on('drain', function () {
					console.log('socket drain');
				});

				socket.on('end', function () {
					console.log('socket end');
				});

				socket.on('close', function () {
					console.log('socket close');
				});

				socket.on('error', function (err) {
					console.log('socket ERROR', err.code, err.syscall);
				});
			});


			server.on('listening', function () {
				console.log('server listening');
			});

			server.on('connection', function (socket) {
				console.log('server connection', socket.remoteAddress + ":" + socket.remotePort);
			});

			server.on('close', function () {
				console.log('server close');
			});

			server.on('error', function (err) {
				console.log('server ERROR', err.code, err.syscall);
			});

			server.listen(port, function () {
				console.log('server.listen callback');
			});
		}
	};
});