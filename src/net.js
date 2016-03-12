import {EventEmitter} from 'events';
import {Buffer} from 'buffer';
import {Duplex} from 'stream';
import process from 'process';


var DataWriter = Windows.Storage.Streams.DataWriter;
var DataReader = Windows.Storage.Streams.DataReader;
var StreamSocketListener = Windows.Networking.Sockets.StreamSocketListener;
var StreamSocket = Windows.Networking.Sockets.StreamSocket;



///////////////////////////////////////////////////////////////////////
/////////////////////////// SOCKET ////////////////////////////////////
///////////////////////////////////////////////////////////////////////




export class Socket extends Duplex {

	_connecting = false;
	_connected = false;
	destroyed = false;
	_hadError = false;
	_handle = null;
	_maxChunkLength = 65536; // 64kB

	localAddress = undefined;
	localPort = undefined;
	remoteAddress = undefined;
	remoteFamily = undefined;
	remotePort = undefined;

	constructor(options) {
		// TODO implement options
		// TODO -- accept socket from server
		super();

		if (!(this instanceof Socket)) return new Socket(options);

		this._onConnect = this._onConnect.bind(this);
		this._onError = this._onError.bind(this);
		this._onRead = this._onRead.bind(this);

		if (options === undefined) {
			options = {};
		}

		// Reserve properties
		this.server = this._server = null;

		if (options.handle) {
			// wrapping server connection socket
			this._handle = options.handle; // private
			this.readable = this.writable = true;
			this.server = options.server;
			this._server = options._server;
			this._onConnect();
		} else {
			// these will be set once there is a connection
			this.readable = this.writable = false;
		}

		// shut down the socket when we're finished with it.
		this.on('finish', this.destroy)

		this._initSocketHandle();
		this._initSocketHandle2();

		// default to *not* allowing half open sockets
		this.allowHalfOpen = options && options.allowHalfOpen || false;

		// if we have a handle, then start the flow of data into the
		// buffer.  if not, then this will happen when we connect
		if (this._handle && options.readable !== false) {
			if (options.pauseOnCreate) {
				// TODO
			} else {
				this.read(0);
			}
		}
	}

	// TODO investigate - will bytesRead remain after reconneting or will it become 0?
	// can we merge these function or is only _initSocketHandle2 callable when reconnecting?
	_initSocketHandle() {
		this.bytesRead = 0;
		this._bytesDispatched = 0;
	}
	_initSocketHandle2() {
		this.destroyed = false;
		this._hadError = false;
		//this._sockname = null; // TODO
	}
	
	address() {
		return {
			address: this.remoteAddress,
			family: this.remoteFamily,
			port: this.remotePort
		}
	}

	connect(options, cb) {
		if (options === null || typeof options !== 'object') {
			// Old API:
			// connect(port, [host], [cb])
			// connect(path, [cb]);
			var args = normalizeConnectArgs(arguments);
			return Socket.prototype.connect.apply(this, args);
		}
		if (options.host == 'localhost') {
			// TODO, IPv6
			options.host = '127.0.0.1';
		}
		if (this._connecting || this._connected) {
			process.nextTick(connectErrorNT, this, errnoException('EISCONN', 'connect', options.host, options.port));
		}

		if (this.destroyed) {
			this._readableState.reading = false;
			this._readableState.ended = false;
			this._readableState.endEmitted = false;
			this._writableState.ended = false;
			this._writableState.ending = false;
			this._writableState.finished = false;
			this._writableState.errorEmitted = false;
			this.destroyed = false;
			this._handle = null;
			this._sockname = null;
		}
		this._initSocketHandle2();

		if (typeof cb === 'function') {
			this.once('connect', cb);
		}

		//this._unrefTimer();

		this._connecting = true;
		this.writable = true;

		this._handle = new StreamSocket();
		//this._handle.control.keepAlive = false;
		// Microsoft desperately wants to make this more complicated than it needs to be
		var hostName = new Windows.Networking.HostName(options.host);

		this._handle.connectAsync(hostName, options.port)
					.done(this._onConnect, err => this._onError(err, 'connect', options.host, parseInt(options.port)));
		return this;
	}

	_onConnect() {
		if (this.destroyed) {
			// .destroy() might have been called in meantime (right after .connect() but before connection was established)
			return;
		}
		this.localPort = this._handle.information.localPort;
		this.localAddress = this._handle.information.localAddress.canonicalName;
		this.remotePort = this._handle.information.remotePort;
		this.remoteAddress = this._handle.information.remoteAddress.canonicalName;
		this.remoteFamily = this.remoteAddress.includes(':') ? 'IPv6' : 'IPv4';
		this._connecting = false;
		this._connected = true;
		// setup writer and writer. it needs to be ready to use in connect callback
		this._writer = new DataWriter(this._handle.outputStream);
		this.writable = true;
		this._reader = new DataReader(this._handle.inputStream);
		this.readable = true;
		// Make _reader.loadAsync read any ammount of bytes (basically right when any data arrive)
		// In other words: wont't wait for receiving all of the _maxChunkLength to call _onRead
		this._reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;
		// emit connect, at this point everything should be ready to write
		this.emit('connect')
		// start listening only after emiting connect, 'data' event can't preceed 'connect'
		this._readChunk();
		// start the first read, or get an immediate EOF.
		// this doesn't actually consume any bytes, because len=0.
		this.read(0);
	}
	_readChunk() {
		//if (this._connected && this.readable) {
		//if (this.readable) {
		if (this._reader && this.readable) {
			// sets up data listener and calls _onRead if (what a surprise) data is received
			var thing = this._reader.loadAsync(this._maxChunkLength)
			thing.done(this._onRead, err => this._onError(err, 'read'));
		}
	}
	_onRead(chunkBytesRead) {
		if (chunkBytesRead == 0) {
			// server closed this socket, destroy this end too
			this.end();
			return;
		}
		this.bytesRead += chunkBytesRead;
		// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
		var buffer = new Buffer(chunkBytesRead);
		this._reader.readBytes(buffer);
		this.push(buffer);
		// TODO
		// if returns false, then apply backpressure
		//if (!this.push(buffer)) {
		//	chrome.sockets.tcp.setPaused(this.id, true)
		//}
		// keep receiving next data
		setImmediate(() => this._readChunk());
	}

	_onError(err, syscall, address, port) {
		// TODO investigate - should multiple errors be merged into one?
		// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
		if (this.destroyed) {
			// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
			return;
		}
		this._connecting = false
		this._hadError = true;
		//this.end();
		
		//this._destroy();
		//this.emit('error', errnoException(err, syscall, address, port));
		process.nextTick(connectErrorNT, this, errnoException(err, syscall, address, port));
	}

	end(data, encoding) {
		if (!this._connecting && !this._connected) {
			// .end() was called before .connect() do nothing
			// Duplex.prototype.write has to be called to ensure throwing error (write after end)
			Duplex.prototype.end.call(this, data, encoding)
			return;
		}
		if (this._connecting) {
			this.once('connect', () => this.end(data, encoding))
			//setImmediate(() => this.end(data, encoding))
			return;
		}
		// Duplex.prototype.write has to be called to ensure throwing error (write after end)
		// WARNING: Duplex.end() calls this.destroy
		Duplex.prototype.end.call(this, data, encoding)
		this._willEmitEnd = true;
		if (this.readable && !this._readableState.endEmitted) {
			this.read(0);
		}
	}

	destroy(exception) {
		this._destroy(exception);
	}
	_destroy(exception, cb) {
		if (!this._connecting && !this._connected) {
			// .destroy() called before .connect() do nothing
			return;
		}

		var fireErrorCallbacks = () => {
			if (cb) cb(exception);
			if (exception && !this._writableState.errorEmitted) {
				process.nextTick(emitErrorNT, this, new Error(exception));
				//setImmediate(() => this.emit('error', new Error(exception)));
				this._writableState.errorEmitted = true;
			}
		}

		if (this.destroyed) {
			// already destroyed, fire error callbacks
			fireErrorCallbacks();
			return;
		}

		// stream is no more readable (won't be sending anything to server)
		// but it remains readable since some data from server might be already
		// on the way or in buffer waiting to be emitted
		this.writable = false;
		// calling destroy with argument causes error and 'close' event callback argument to be true
		this._hadError = this._hadError || !!exception;
		// we set destroyed to true before firing error callbacks in order
		// to make it re-entrance safe in case Socket.prototype.destroy()
		// is called within callbacks
		this.destroyed = true;
		fireErrorCallbacks();
		this._connecting = false;
		this._connected = false;

		if (this._server) {
			this._server._connections--;
			if (this._server._emitCloseIfDrained) {
				this._server._emitCloseIfDrained();
			}
		}

		this._destroyHandle();
	}

	_destroyHandle() {
		// why the setImmediate?
		// cancelIOAsync might call the callback synchronously if there's no pending read/write
		// but it needs to be async - to properly react to errors (Error: write after end).
		// Also .end() (unlike .destroy() ) gives reader/writer some head start to finish reading.
		// Writer has to stop sending whatever is in buffer and send FIN packet to gracefuly close connection. 
		setImmediate(() => {
			if (this._handle == null) {
				return;
			}
			// disabling readable here instead of in _destroyHandle2() to make reading safer
			// (to prevent Error reading in inappropriate time)
			this.readable = false;
			// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
			// in networking drivers, it flushes the write.
			var _destroyHandle2 = this._destroyHandle2.bind(this);
			this._handle.cancelIOAsync().done(_destroyHandle2, _destroyHandle2);
			// TODO investigate - does this need any futher error handling?
		});
	}
	_destroyHandle2() {
		if (this._handle) {
			try {
				this._handle.close();
			} catch(e) {}
			this._handle = null;
		}
		if (this._writer) {
			// might be writing at the moment
			try {
				this._writer.detachStream();
			} catch(e) {}
			// TODO invesitagate - does this need any further error handling? Or will the writer just burn in flames on it's own?
			this._writer = null;
		}
		if (this._reader) {
			// might be reading at the moment
			try {
				this._reader.detachStream();
			} catch(e) {}
			// TODO invesitagate - does this need any further error handling? Or will the reader just burn in flames on it's own?
			this._reader = null;
		}

		if (this._willEmitEnd && !this._readableState.endEmitted) {
			// either we closed the socket or server disconnected us and WinRT didn't give us EOF
			// so we have to simulate it by pushing null to data. (in other word: this emits 'end')
			this.push(null);
			this.once('end', () => this.emit('close', this._hadError));
		} else {
			this.emit('close', this._hadError);
		}

	}


	get bufferSize() {
		// returns undefined before socket.connect()
		if (this._connecting || this._connected) {
			return this._writableState.length;
		}
	}

	bytesRead = 0;
	_bytesDispatched = 0;
	get bytesWritten() {
		return this._bytesDispatched + (this.bufferSize || 0);
	}

	_write(chunk, encoding, done) {
		if (!done) done = () => {}

		if (this._connecting) {
			this.once('connect', () => this._write(chunk, encoding, done));
			return;
		}

		if (this.writable) {
			this._writer.writeBytes(chunk);
			// note: don't pass callback as rference! oh boy those contexts...
			this._writer.storeAsync().done(() => {
				this._bytesDispatched += chunk.length;
				done()
			}, err => this._onError(err, 'write'));
		} else {
			done(new Error('This socket is closed'))
		}
	}


	_read(n) {}

	// No StreamSocket equivalent
	ref() {
		console.warn('ref() not implemented. No WinRT equivalent')
		return this;
	}
	unref() {
		console.warn('unref() not implemented. No WinRT equivalent')
		return this;
	}

	// TODO
	setEncoding() {
		console.warn('setEncoding() not implemented');
		return this;
	}

	// TODO
	setTimeout(timeout, callback) {
		console.warn('setTimeout() not implemented');
		return this;
	}

	// TODO (following code is probably not working. Copied straight outta node source)
	setNoDelay(enable) {
		console.warn('setNoDelay() not implemented');
		/*if (!this._handle) {
			this.once('connect',
			enable ? this.setNoDelay : () => this.setNoDelay(enable));
			return this;
		}

		// backwards compatibility: assume true when `enable` is omitted
		if (this._handle.setNoDelay)
			this._handle.setNoDelay(enable === undefined ? true : !!enable);*/
		return this;
	}

	// TODO (following code is probably not working. Copied straight outta node source)
	setKeepAlive(setting, msecs) {
		console.warn('setKeepAlive() not implemented');
		/*if (!this._handle) {
			this.once('connect', () => this.setKeepAlive(setting, msecs));
			return this;
		}

		if (this._handle.setKeepAlive)
			this._handle.setKeepAlive(setting, ~~(msecs / 1000));*/
		return this;
	}

	_unrefTimer() {}



}



///////////////////////////////////////////////////////////////////////
/////////////////////////// SERVER ////////////////////////////////////
///////////////////////////////////////////////////////////////////////






export class Server extends EventEmitter {

	_host = null;

	constructor(options, connectionListener) {
		super();

		if (!(this instanceof Server)) return new Server(options, connectionListener);

		this._onError = this._onError.bind(this);
		this._onListen = this._onListen.bind(this);
		this._onConnection = this._onConnection.bind(this);

		EventEmitter.call(this);

		if (typeof options === 'function') {
			connectionListener = options;
			options = {};
			this.on('connection', connectionListener);
		} else {
			options = options || {};

			if (typeof connectionListener === 'function') {
				this.on('connection', connectionListener);
			}
		}

		this._connections = 0;

		this._handle = null;
		//this._unref = false;

		this.allowHalfOpen = options.allowHalfOpen || false;
		this.pauseOnConnect = !!options.pauseOnConnect;

	}

	address() {
		return {
			port: this._port,
			address: this._host,
			family: this._host.indexOf(':') !== -1 ? 'IPv6' : 'IPv4',
		}
	}

	listen(port, cb) {
		if (typeof cb === 'function') {
			this.once('listening', cb);
		}
		if (this._handle) {
			// nodejs allows (accidentally?) calling .listen() multiple times and simply ignores it
			return false;
		}
		// TODO find local IP
		this._host = '::';
		// WinRT needs port (or rather serviceName) to be string
		this._port = port;
		port = port + '';
		this._handle = new StreamSocketListener(port);
		this._handle.addEventListener('connectionreceived', this._onConnection);
		this._handle.bindServiceNameAsync(port)
					.done(this._onListen, err => this._onError(err, 'listen', this._host, port));
		return this;
	}

	get listening() {
		return !!this._handle;
	}

	_onListen(foo) {
		//this.emit('listening');
		process.nextTick(emitListeningNT, this);
	}

	_onConnection(e) {
		if (this.maxConnections && this._connections >= this.maxConnections) {
			e.socket.close();
			return;
		}

		var socket = new Socket({
			server: this,
			_server: this,
			handle: e.socket,
			allowHalfOpen: this.allowHalfOpen,
			pauseOnCreate: this.pauseOnConnect
		});
		this._connections++;
		this.emit('connection', socket);
	}

	_connections = 0;
	getConnections(cb) {
		process.nextTick(cb, null, this._connections);
	}


	_onError(err, syscall, address, port) {
		// Clean up a listener if we failed to bind to a port.
		this._destroyHandle();
		// When we close a socket, outstanding async operations will be canceled and the
		// error callbacks called.  There's no point in displaying those errors.
		if (this.destroyed) {
			return;
		}
		//this.emit('error', errnoException(err, syscall, address, port));
		process.nextTick(emitErrorNT, this, errnoException(err, syscall, address, port));
	}

	_destroyHandle() {
		if (this._handle) {
			// keep handle stored locally for referrence to it's close() when called from cancelIOAsync()
			var handle = this._handle;
			this._handle.cancelIOAsync().done(() => handle.close(), () => handle.close());
			this._handle = null;
		}
	}

	// No StreamSocketListener equivalent
	ref() {}
	unref() {}

	// Stops the server from accepting new connections and keeps existing connections.
	// The server is finally closed when all connections are ended and the server emits a 'close' event.
	// The optional callback will be called once the 'close' event occurs. Unlike that event, it will be called with an Error as its only argument if the server was not open when it was closed.
	close(cb) {
		if (typeof cb === 'function') {
			if (!this._handle) {
				this.once('close', function() {
					cb(new Error('Not running'));
				});
			} else {
				this.once('close', cb);
			}
		}

		this._destroyHandle();
		
		this._emitCloseIfDrained();

		return this;
	}

	_emitCloseIfDrained() {
		if (this._handle || this._connections) {
			return;
		}
		process.nextTick(emitCloseNT, this);
	}


}




///////////////////////////////////////////////////////////////////////
/////////////////////////// HELPER FUNCTIONS //////////////////////////
///////////////////////////////////////////////////////////////////////




function connectErrorNT(self, err) {
	self.emit('error', err);
	self._destroy();
}
function emitErrorNT(self, err) {
	self.emit('error', err);
}
function emitListeningNT(self) {
	// ensure handle hasn't closed
	if (self._handle) {
		self.emit('listening');
	}
}
function emitCloseNT(self) {
	self.emit('close');
}


var errorCodes = {
	'-2147014835': 'ECONNREFUSED',
	'-2147013895': 'ENOENT',
	'-2147014848': 'EADDRINUSE', // (Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address.
	'-2147014836': 'ETIMEDOUT',
	'?': 'ECONNREFUSED', // TODO (Connection refused): No connection could be made because the target machine actively refused it. 
	'-2147014842': 'ECONNRESET' // (Connection reset by peer): A connection was forcibly closed by a peer. 
	//EACCES (Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions.
}

function errnoException(err, syscall, address, port) {
	var errname;
	var message;
	if (typeof err == 'object') {
		errname = errorCodes[err.number] || err.number;
		message = syscall + ' ' + errname + ' ' + err.message;
	} else {
		errname = err;
		message = syscall + ' ' + errname;
	}
	var e = new Error(message);
	e.code = e.errno = errname;
	e.syscall = syscall;
	if (port) {
		e.port = port;
	}
	if (address) {
		e.address = address;
	}
	return e;
}


export function createServer(options, connectionListener) {
  return new Server(options, connectionListener);
}

export var connect = (...args) => {
	args = normalizeConnectArgs(args);
	var s = new Socket(args[0]);
	return Socket.prototype.connect.apply(s, args);
};
export var createConnection = connect;

// Returns an array [options] or [options, cb]
// It is the same as the argument of Socket.prototype.connect().
function normalizeConnectArgs(args) {
	var options = {};

	if (args[0] !== null && typeof args[0] === 'object') {
		// connect(options, [cb])
		options = args[0];
	} else {
		// connect(port, [host], [cb])
		options.port = args[0];
		if (typeof args[1] === 'string') {
			options.host = args[1];
		} else {
			options.host = 'localhost';
		}
	}

	var cb = args[args.length - 1];
	return typeof cb === 'function' ? [options, cb] : [options];
}

export default {
	createServer,
	createConnection,
	connect,
	Socket,
	Server
}


// Source: https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation#use-these-attributes-to-validate-input
var IPv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
var IPv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

export var isIPv4 = (ip) => IPv4Regex.test(ip);
export var isIPv6 = (ip) => IPv6Regex.test(ip);
export var isIP = (ip) => isIPv4(ip) ? 4 : isIPv6(ip) ? 6 : 0;
