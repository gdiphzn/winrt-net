'use strict';

System.register(['net'], function (_export, _context) {
	"use strict";

	var net, socket;


	function logSocket() {
		/*console.log('bufferSize', socket.bufferSize)
  console.log('bytesRead', socket.bytesRead)
  console.log('bytesWritten', socket.bytesWritten)*/
		//console.log('localAddress', socket.localAddress)
		//console.log('localPort', socket.localPort)
		//console.log('remoteAddress', socket.remoteAddress)
		//console.log('remoteFamily', socket.remoteFamily)
		//console.log('remotePort', socket.remotePort)
		//console.log('readable', socket.readable)
		//console.log('writable', socket.writable)
	}
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			socket = new net.Socket();


			logSocket();

			socket.on('close', function (had_error) {
				console.log('--------- close --', had_error, '-----------');
				logSocket();
			});

			socket.on('connect', function (data) {
				console.log('--------- connect ------------------');
				logSocket();

				console.log('# writing');
				socket.write('start');
				var bigwrite = socket.write(''.padLeft(1000000, ' '));
				console.log('# bigwrite', bigwrite);
				socket.write('end');
				console.log('# ending');
				socket.end();
				console.log('# writing');
				socket.write('aftermath');
				console.log('# manually ended');
				logSocket();
			});
			String.prototype.padLeft = function (l, c) {
				return Array(l - this.length + 1).join(c || " ") + this;
			};

			socket.on('data', function (data) {
				console.log('--------- data --', data.length, '---------------');
				logSocket();
				console.log('# writing');
				socket.write('i just read ' + data.length + ' bytes 1');
				console.log('# ending');
				socket.end();
				console.log('# manually ended');
				logSocket();
				socket.write('i just read ' + data.length + ' bytes 2');
			});

			socket.on('drain', function (data) {
				console.log('--------- drain --------------------');
				logSocket();
			});

			socket.on('end', function (data) {
				console.log('--------- end ----------------------');
				logSocket();
			});

			socket.on('error', function (data) {
				console.log('--------- error --------------------', data);
				logSocket();
			});
			/*
   socket.on('lookup', data => {
   	console.log('--------- lookup --------------------')
   	logSocket()
   })
   */
			socket.on('timeout', function (data) {
				console.log('--------- timeout --------------------');
				logSocket();
			});

			socket.connect(22112, 'localhost');
		}
	};
});