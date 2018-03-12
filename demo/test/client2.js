'use strict';

System.register(['net'], function (_export, _context) {
	"use strict";

	var net, port, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			socket = new net.Socket();

			socket.connect(port, 'localhost', function () {
				console.log('# connected to server!');
				socket.write('Hello server! This is me, client!');
				setTimeout(function () {
					console.log('ending');
					socket.end();
				}, 500);
			});

			socket.on('connect', function () {
				console.log('# socket connect');
			});

			socket.on('data', function (data) {
				console.log('# socket data |', data.length, '|', data.toString());
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('finish', function () {
				console.log('# socket finish');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR', JSON.stringify(err));
			});
		}
	};
});