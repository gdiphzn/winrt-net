'use strict';

System.register(['net'], function (_export, _context) {
	"use strict";

	var net, port, server;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			server = net.createServer(function (socket) {
				console.log('# server connection1', socket.remoteAddress + ":" + socket.remotePort);

				socket.write('server says hello');
				//socket.write('hello +ěščřžýáíé=´)úpů§-.,ďťň');
				socket.write('here\'s second message');
				setTimeout(function () {
					socket.write('and this is the third message...');
				}, 20);
				setTimeout(function () {
					console.log('disconnecting client');
					socket.end();
				}, 3000);

				socket.on('data', function (data) {
					console.log('# socket data |', data.length, '|', data.toString().trim());
				});

				socket.on('end', function () {
					console.log('# socket end');
				});

				socket.on('close', function () {
					console.log('# socket close');
				});

				socket.on('finish', function () {
					console.log('# socket finish');
				});

				socket.on('error', function (err) {
					console.log('# socket ERROR', JSON.stringify(err));
				});
			});


			server.on('connection', function (socket) {
				console.log('# server connection2', socket.remoteAddress + ":" + socket.remotePort);
			});

			server.on('close', function () {
				console.log('# server close');
			});

			server.on('error', function (err) {
				console.log('# server ERROR', JSON.stringify(err));
			});

			server.on('listening', function () {
				console.log('# server listening 1');
			});

			server.listen(port, function () {
				console.log('# server listening 2');
			});
		}
	};
});