'use strict';

System.register(['net'], function (_export, _context) {
	var net, port, server;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			server = net.createServer(function (socket) {

				console.log('# user connected, sending big message');

				socket.write(''.padLeft(1000000, '-'));

				socket.on('data', function (data) {
					console.log('# socket data |', data.length);
				});

				socket.on('end', function () {
					console.log('# socket end');
				});

				socket.on('close', function () {
					console.log('# socket close');
				});

				socket.on('error', function (err) {
					console.log('# socket ERROR');
				});
			});


			server.on('listening', function () {
				console.log('# server listening');
			});

			server.on('connection', function (socket) {
				console.log('# server connection', socket.remoteAddress + ":" + socket.remotePort);
			});

			server.on('close', function () {
				console.log('# server close');
			});

			server.on('error', function () {
				console.log('# server ERROR');
			});

			server.listen(port, function () {
				console.log('# server.listen callback');
			});

			String.prototype.padLeft = function (l, c) {
				return Array(l - this.length + 1).join(c || " ") + this;
			};
		}
	};
});