import net from 'net';
import {Buffer} from 'buffer';

//import {EventEmitter} from 'events';
//console.log('EventEmitter', EventEmitter)

var $pre = document.querySelector('pre');
var $connect = document.querySelector('#connect');
var $listen = document.querySelector('#listen');
var $end = document.querySelector('#end');
var $stop = document.querySelector('#stop');
var $ip = document.querySelector('#ip');
var $port = document.querySelector('#port');
var $img = document.querySelector('img');

log('demo loaded')


var port = 22112;
var ip = getLocalIP();

$port.value = port;
$ip.value = ip;

$connect.addEventListener('click', () => {
	log('connect', ip + ':' + port);
})
$listen.addEventListener('click', () => {
	log('listen', ip + ':' + port);
})
$end.addEventListener('click', () => {
	log('end socket');
	socket.end();
})
$stop.addEventListener('click', () => {
	log('stop server');
})





var socket = new net.Socket();
socket.connect(port, 'localhost', function() {
	console.log('connected to server!');
});

socket.on('connect', function() {
	console.log('socket connect')
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
socket.on('end', function() {
	console.log('socket end')
});

socket.on('error', function(err) {
	console.log('socket ERROR')
});


var dropZone = document;
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleFileSelect);
function handleDragOver(e) {
	e.stopPropagation();
	e.preventDefault();
}
function handleFileSelect(e) {
	e.stopPropagation();
	e.preventDefault();
	console.log(e.dataTransfer)
	console.log(e.dataTransfer.files[0]);
	var blob = e.dataTransfer.files[0];
	var fileReader = new FileReader();
	fileReader.onload = function() {
		var arrayBuffer = this.result;
		var uint8ArrayNew  = new Uint8Array(arrayBuffer);
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
function log(...args) {
	$pre.textContent += args.join(', ') + '\n';
}
