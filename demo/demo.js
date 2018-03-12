'use strict';

System.register(['net', 'buffer'], function (_export, _context) {
	"use strict";

	var net, Buffer, $pre, $connect, $listen, $end, $stop, $ip, $port, $img, port, ip, socket, dropZone;

	function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
	}
	function handleFileSelect(e) {
		e.stopPropagation();
		e.preventDefault();
		console.log(e.dataTransfer);
		console.log(e.dataTransfer.files[0]);
		var blob = e.dataTransfer.files[0];
		var fileReader = new FileReader();
		fileReader.onload = function () {
			var arrayBuffer = this.result;
			var uint8ArrayNew = new Uint8Array(arrayBuffer);
			var buffer = new Buffer(uint8ArrayNew);
			socket.write(buffer);
		};
		fileReader.readAsArrayBuffer(blob);
	}

	function parseValues() {
		port = parseInt($port.value);
		ip = parseInt($ip.value);
	}
	function getLocalIP() {
		var hosts = Windows.Networking.Connectivity.NetworkInformation.getHostNames();
		var ipv4 = Windows.Networking.HostNameType.ipv4;
		for (var i = 0; i < hosts.length; i++) {
			var host = hosts[i];
			if (host.type == ipv4 && host.ipInformation.prefixLength == 24) {
				return host.displayName;
			}
		}
	}
	function log() {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		$pre.textContent += args.join(', ') + '\n';
	}
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_buffer) {
			Buffer = _buffer.Buffer;
		}],
		execute: function () {
			$pre = document.querySelector('pre');
			$connect = document.querySelector('#connect');
			$listen = document.querySelector('#listen');
			$end = document.querySelector('#end');
			$stop = document.querySelector('#stop');
			$ip = document.querySelector('#ip');
			$port = document.querySelector('#port');
			$img = document.querySelector('img');


			log('demo loaded');

			port = 22112;
			ip = getLocalIP();


			$port.value = port;
			$ip.value = ip;

			$connect.addEventListener('click', function () {
				log('connect', ip + ':' + port);
			});
			$listen.addEventListener('click', function () {
				log('listen', ip + ':' + port);
			});
			$end.addEventListener('click', function () {
				log('end socket');
				socket.end();
			});
			$stop.addEventListener('click', function () {
				log('stop server');
			});

			socket = new net.Socket();

			socket.connect(port, 'localhost', function () {
				console.log('connected to server!');
			});

			socket.on('connect', function () {
				console.log('socket connect');
			});
			/*
   socket.on('data', function(data) {
   	//console.log('-- socket data |', data.length, '|', data.toString());
   	console.log('-- socket data |', data.length);
   	console.log(data.buffer);
   	var blob = new Blob([data.buffer]);
   	var objectURL = URL.createObjectURL(blob);
   	$img.src = objectURL;
   });
   */
			socket.on('end', function () {
				console.log('socket end');
			});

			socket.on('error', function (err) {
				console.log('socket ERROR');
			});

			dropZone = document;

			dropZone.addEventListener('dragover', handleDragOver);
			dropZone.addEventListener('drop', handleFileSelect);
		}
	};
});