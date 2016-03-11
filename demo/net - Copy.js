'use strict';

System.register(['events', 'buffer', 'stream'], function (_export, _context) {
	var EventEmitter, Buffer, Duplex, _typeof, _createClass, DataWriter, DataReader, StreamSocketListener, StreamSocket, Server, Socket, connect, createConnection;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	// Returns an array [options] or [options, cb]
	// It is the same as the argument of Socket.prototype.connect().
	function normalizeConnectArgs(args) {
		var options = {};

		if (args[0] !== null && _typeof(args[0]) === 'object') {
			// connect(options, [cb])
			options = args[0];
		} else if (isPipeName(args[0])) {
			// connect(path, [cb]);
			options.path = args[0];
		} else {
			// connect(port, [host], [cb])
			options.port = args[0];
			if (typeof args[1] === 'string') {
				options.host = args[1];
			}
		}

		var cb = args[args.length - 1];
		return typeof cb === 'function' ? [options, cb] : [options];
	}
	/*
 function _connect(options, ...args) {
 	// first argument could be options object that goes to constructor.
 	// all other arguments are passed into connect method
 	var clientSocket;
 	if (options.constructor == Object) {
 		clientSocket = new Socket(options);
 	} else {
 		args.unshift(options);
 		clientSocket = new Socket();
 	}
 	clientSocket.connect(...args);
 	return clientSocket;
 }
 export var connect = _connect;
 export var createConnection = _connect;
 */

	function removeFromArray(array, item) {
		var index = array.indexOf(item);
		if (index > -1) {
			array.splice(index, 1);
		}
	}
	/*
 
 //
 // EXPORTED HELPERS
 //
 
 // Source: https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation#use-these-attributes-to-validate-input
 var IPv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
 var IPv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/
 
 exports.isIPv4 = IPv4Regex.test.bind(IPv4Regex)
 exports.isIPv6 = IPv6Regex.test.bind(IPv6Regex)
 
 exports.isIP = function (ip) {
   return exports.isIPv4(ip) ? 4 : exports.isIPv6(ip) ? 6 : 0
 }
 */

	/*
 console.log('this._connecting', this._connecting);
 console.log('this._connected', this._connected);
 console.log('this._closing', this._closing);
 console.log('this._destroyed', this._destroyed);/
 
 	/*end(data, encoding) {
 		// Duplex.prototype.end has to be called everytime to ensure proper reaction (calling .write(), ._write()
 		// and throwing Error: write after end) if there are any data (first argument of this method)
 		// to be sent before closing socket
 		Duplex.prototype.end.call(this, data, encoding)
 		//if (!this._connected) {
 		if (!this._connecting && !this._connected) {
 			// .end() was called before .connect() do nothing
 			return;
 		}
 		if (this._closing || this._destroyed) {
 			return;
 		}
 		this._closing = true;
 		this.writable = false;
 		// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
 		// in networking drivers, it flushes the write.
 		this._socket.cancelIOAsync().done(() => {
 			// cancelIOAsync might call the callback synchronously if there's no pending read/write
 			// but it needs to be async - to properly react to errors (Error: write after end)
 			setImmediate(this._end);
 		}, () => {
 			// TODO investigate - does this need any futher handling?
 			setImmediate(this._end);
 		});
 	}*/
	return {
		setters: [function (_events) {
			EventEmitter = _events.EventEmitter;
		}, function (_buffer) {
			Buffer = _buffer.Buffer;
		}, function (_stream) {
			Duplex = _stream.Duplex;
		}],
		execute: function () {
			_typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
				return typeof obj;
			} : function (obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
			};

			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			try {
				DataWriter = Windows.Storage.Streams.DataWriter;
				DataReader = Windows.Storage.Streams.DataReader;
				StreamSocketListener = Windows.Networking.Sockets.StreamSocketListener;
				StreamSocket = Windows.Networking.Sockets.StreamSocket;
			} catch (e) {}

			_export('Server', Server = function (_EventEmitter) {
				_inherits(Server, _EventEmitter);

				function Server(options, connectionListener) {
					_classCallCheck(this, Server);

					var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

					if (!(_this instanceof Server)) {
						var _ret;

						return _ret = new Server(options, connectionListener), _possibleConstructorReturn(_this, _ret);
					}
					/*
     {
     	allowHalfOpen: false,
     	pauseOnConnect: false
     }
     */
					_this._onError = _this._onError.bind(_this);
					_this._onListen = _this._onListen.bind(_this);
					_this._onConnection = _this._onConnection.bind(_this);
					return _this;
				}

				_createClass(Server, [{
					key: 'listen',
					value: function listen(port, callback) {
						console.log('listen');
						// WinRT needs port (or rathe serviceName) to be string
						this.once('listening', callback);
						port = port + '';
						this._closing = false;
						this._listener = new StreamSocketListener(port);
						this._listener.addEventListener('connectionreceived', this._onConnection);
						this._listener.bindServiceNameAsync(port).done(this._onListen, this._onError);
					}
				}, {
					key: '_onListen',
					value: function _onListen() {
						console.log('on listen');
						this.emit('listening');
					}
				}, {
					key: '_onConnection',
					value: function _onConnection(eventArgument) {
						var socket = eventArgument.socket;
						this.emit('connection', socket);
					}
				}, {
					key: '_onError',
					value: function _onError(reason) {
						// Clean up a listener if we failed to bind to a port.
						this._listener = null;

						// When we close a socket, outstanding async operations will be canceled and the
						// error callbacks called.  There's no point in displaying those errors.
						if (this._closing || this._destroyed) {
							return;
						}
					}
				}, {
					key: 'ref',
					value: function ref() {}
				}, {
					key: 'unref',
					value: function unref() {}
				}]);

				return Server;
			}(EventEmitter));

			_export('Server', Server);

			_export('Socket', Socket = function (_Duplex) {
				_inherits(Socket, _Duplex);

				// 35536 is max size of data the chunk could read from stream at once
				// (it's not just a random value. Was measured with Node.js)

				function Socket(options) {
					var _ret2;

					_classCallCheck(this, Socket);

					var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Socket).call(this));

					_this2._connecting = false;
					_this2._connected = false;
					_this2._closing = false;
					_this2._destroyed = false;
					_this2._maxChunkLength = 65536;
					_this2.localAddress = undefined;
					_this2.localPort = undefined;
					_this2.remoteAddress = undefined;
					_this2.remoteFamily = undefined;
					_this2.remotePort = undefined;
					_this2.readable = false;
					_this2.writable = false;
					_this2._hadError = false;
					_this2.bytesRead = 0;
					_this2._bytesDispatched = 0;
					_this2._pendingData = [];

					if (!(_this2 instanceof Socket)) return _ret2 = new Socket(options), _possibleConstructorReturn(_this2, _ret2);
					/*
     {
     	fd: null,
     	allowHalfOpen: false,
     	readable: false,
     	writable: false
     }
     */
					if (options === undefined) {
						options = {};
					}

					_this2._onConnect = _this2._onConnect.bind(_this2);
					_this2._onError = _this2._onError.bind(_this2);
					_this2._onReceive = _this2._onReceive.bind(_this2);
					_this2._end = _this2._end.bind(_this2);
					_this2._onEnd = _this2._onEnd.bind(_this2);
					return _this2;
				} // 64kB

				_createClass(Socket, [{
					key: 'connect',
					value: function connect(options, cb) {
						if (options === null || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
							// Old API:
							// connect(port, [host], [cb])
							// connect(path, [cb]);
							var args = normalizeConnectArgs(arguments);
							return Socket.prototype.connect.apply(this, args);
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
							this._peername = null;
							this._sockname = null;
						}

						if (typeof cb === 'function') {
							this.once('connect', cb);
						}

						//this._unrefTimer();

						this._connecting = true;
						this.writable = true;

						if (this._host == 'localhost') {
							this._host = '127.0.0.1';
						}

						// emiting 'close' event right after 'end'
						this.once('end', this._onEnd);

						this._socket = new StreamSocket();
						//this._socket.control.keepAlive = false;
						// Microsoft desperately wants to make this more complicated than it needs to be
						var hostName = new Windows.Networking.HostName(this._host);

						this._connecting = true;
						this._socket.connectAsync(hostName, this._port).done(this._onConnect, this._onError);
					}
				}, {
					key: '_onConnect',
					value: function _onConnect() {
						if (this._destroyed) {
							// .destroy() might have been called in meantime (right after .connect() but before connection was established)
							return;
						}
						this.localPort = this._socket.information.localPort;
						this.localAddress = this._socket.information.localAddress.canonicalName;
						this.remotePort = this._socket.information.remotePort;
						this.remoteAddress = this._socket.information.remoteAddress.canonicalName;
						this.remoteFamily = this.remoteAddress.includes(':') ? 'IPv6' : 'IPv4';
						this._connecting = false;
						this._connected = true;
						// setup writer and writer. it needs to be ready to use in connect callback
						this._writer = new DataWriter(this._socket.outputStream);
						this.writable = true;
						this._reader = new DataReader(this._socket.inputStream);
						this.readable = true;
						// Make _reader.loadAsync read any ammount of bytes (basically right when any data arrive)
						// In other words: wont't wait for receiving all of the _maxChunkLength to call _onReceive
						this._reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;
						// emit connect, at this point everything should be ready to write
						this.emit('connect');
						// start listening only after emiting connect, 'data' event can't preceed 'connect'
						this._readChunk();
					}
				}, {
					key: '_readChunk',
					value: function _readChunk() {
						console.log('################################# _readChunk ####################################');
						if (this._connected && this.readable) {
							// sets up data listener and calls _onReceive if (what a surprise) data is received
							if (this.operation) {
								this.operation.cancel();
								this.operation.close();
							}
							var thing = this._reader.loadAsync(this._maxChunkLength);
							this.operation = thing.operation;
							console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed);
							thing.done(this._onReceive, this._onError);
							console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed);
						}
					}
				}, {
					key: '_onReceive',
					value: function _onReceive(chunkBytesRead) {
						var _this3 = this;

						console.log('### _onReceive');
						console.log('chunkBytesRead', chunkBytesRead);
						console.log('unconsumedBufferLength', this._reader.unconsumedBufferLength);
						if (this._destroyed) {
							// this happens once in 10 tries so don't delete it. It could happen. safety measures...
							return false;
						}
						if (chunkBytesRead == 0) {
							console.log('READ 0, keep reading');
							//this._readChunk();
							//this._reader.detachStream();
							//this._reader = new DataReader(this._socket.inputStream);
							setTimeout(function () {
								return _this3._readChunk();
							}, 1000);
							return;
						}
						this.bytesRead += chunkBytesRead;
						// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
						var buffer = new Buffer(chunkBytesRead);
						this._reader.readBytes(buffer);
						console.log('buffer', buffer.length);
						console.log('unconsumedBufferLength', this._reader.unconsumedBufferLength);
						// if returns false, then apply backpressure
						var pushed = this.push(buffer);
						if (!pushed) {}
						//chrome.sockets.tcp.setPaused(this.id, true) // TODO

						// keep receiving next data
						//this._readChunk();
						setTimeout(function () {
							return _this3._readChunk();
						}, 1000);
					}
				}, {
					key: '_read',
					value: function _read(bufferSize) {}
				}, {
					key: '_onError',
					value: function _onError(reason) {
						console.log('### _onError', reason);
						// TODO investigate - should multiple errors be merged into one?
						// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
						if (this._closing || this._destroyed) {
							// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
							return;
						}
						//console.log('############# NOW I WOULD EMIT ERROR ####################')
						this._connecting = false;
						this._hadError = true;
						this._end();
					}
				}, {
					key: 'end',
					value: function end(data, encoding) {
						var _this4 = this;

						// Duplex.prototype.end has to be called everytime to ensure proper reaction (calling .write(), ._write()
						// and throwing Error: write after end) if there are any data (first argument of this method)
						// to be sent before closing socket
						Duplex.prototype.end.call(this, data, encoding);
						//if (!this._connected) {
						if (!this._connecting && !this._connected) {
							// .end() was called before .connect() do nothing
							return;
						}
						if (this._closing || this._destroyed) {
							return;
						}
						// why the setImmediate?
						// cancelIOAsync might call the callback synchronously if there's no pending read/write
						// but it needs to be async - to properly react to errors (Error: write after end).
						// Also .end() (unlike .destroy() ) gives reader/writer some head start to finish reading.
						// Writer has to stop sending whatever is in buffer and send FIN packet to gracefuly close connection.
						// Unfortunately WinRT has no gentle way to stop writer separately from reader.
						// This should not be that big of a deal but we have to at least fake it by setting this.writable right away
						// (in node, callback of 'end' event the writable==false and readable==true)
						this.writable = false;
						this._closing = true;
						setImmediate(function () {
							if (_this4._destroyed) {
								// .destroy() might have been called in meantime
								return;
							}
							// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
							// in networking drivers, it flushes the write.
							_this4._socket.cancelIOAsync().done(_this4._end, _this4._end);
							// TODO investigate - does this need any futher error handling?
						});
					}
				}, {
					key: '_end',
					value: function _end() {
						if (this._destroyed) {
							// .destroy() might have been called in meantime
							return;
						}
						// close all of the reader/writer/socket and set connecting/connected/etc...
						this._destroy();
						// pushing null means zero terminated EOF which emits 'end' event
						this.push(null);
						// 'close' has to be fired after 'end' which is being listened to in .connect()
					}
				}, {
					key: '_onEnd',
					value: function _onEnd() {
						// 'close' has to be fired after 'end' which is being listened to in .connect()
						this.emit('close', this._hadError);
						this._hadError = false;
					}
				}, {
					key: 'destroy',
					value: function destroy(exception) {
						var _this5 = this;

						if (this._destroyed) {
							return;
						}
						if (exception) {
							// calling destroy with any argument throws it as error
							this.emit('error', new Error(exception));
							//setImmediate(() => this.emit('error', new Error(exception)));
							// note: error seems to be emitted synchronous when calling .destroy('exception') before .connect()
							// but asynchronously after being connected... but meh, this shouldn't be a problem
						}
						if (!this._connecting && !this._connected) {
							// .destroy() called before .connect() do nothing
							return;
						}
						// close all of the reader/writer/socket and set connecting/connected/etc...
						this._destroy();
						// destroy does not call 'end', on 'close'
						setImmediate(function () {
							return _this5.emit('close', _this5._hadError || !!exception);
						});
					}
				}, {
					key: '_destroy',
					value: function _destroy() {
						this.writable = false;
						if (this._writer) {
							try {
								// might be writing at the moment
								this._writer.detachStream();
								this._writer = null;
							} catch (e) {
								// TODO invesitagate - does this need any further handling? Or will the writer just burn in flames on it's own?
								this._writer = null;
							}
						}
						this.readable = false;
						if (this._reader) {
							try {
								// might be reading at the moment
								this._reader.detachStream();
								this._reader = null;
							} catch (e) {
								// TODO invesitagate - does this need any further handling? Or will the reader just burn in flames on it's own?
								this._reader = null;
							}
						}
						if (this._socket) {
							this._socket.close();
							this._socket = null;
						}

						this._connecting = false;
						this._connected = false;
						this._closing = false;
						this._destroyed = true;
					}
				}, {
					key: 'pause',
					value: function pause() {}
				}, {
					key: 'ref',
					value: function ref() {}
				}, {
					key: 'unref',
					value: function unref() {}
				}, {
					key: 'setEncoding',
					value: function setEncoding() {}
				}, {
					key: 'setKeepAlive',
					value: function setKeepAlive() {}
				}, {
					key: 'setNoDelay',
					value: function setNoDelay() {}
				}, {
					key: 'setTimeout',
					value: function setTimeout() {}
				}, {
					key: '_write',
					value: function _write(chunk, encoding, callback) {
						var _this6 = this;

						if (!callback) callback = function callback() {};

						if (this._connecting) {
							this._pendingData.push(chunk);
							this.once('connect', function () {
								removeFromArray(_this6._pendingData, chunk);
								_this6._write(chunk, encoding, callback);
							});
							return;
						}
						/*
      		if (this._destroyed) {
      			callback(new Error('This socket is closed'))
      			return;
      		}
      */
						//if (this._connected) {
						if (this.writable) {
							this._writer.writeBytes(chunk);
							// note: don't pass callback as rference! oh boy those contexts...
							this._writer.storeAsync().done(function () {
								_this6._bytesDispatched += chunk.length;
								callback();
							}, this._onError);
							//}, error => {
							//	//console.log('### ERROR ._write(), storeAsync')
							//	this._onError(error);
							//});
						} else {
								callback(new Error('This socket is closed'));
							}
					}
				}, {
					key: 'bufferSize',
					get: function get() {
						// tested in node: returns undefined before socket.connect()
						//if (this._closing) {
						//	// TODO investigate more
						//	return 0;
						//} else if (this._connecting || this._connected) {
						if (this._connecting || this._connected) {
							return this._writableState.length;
						}
					}
				}, {
					key: 'bytesWritten',
					get: function get() {
						return this._bytesDispatched + (this.bufferSize || 0);
					}
				}]);

				return Socket;
			}(Duplex));

			_export('Socket', Socket);

			/*
   // called when creating new Socket, or when re-using a closed Socket
   Socket.prototype._init = function () {
     // The amount of received bytes.
     this.bytesRead = 0
   
     this._bytesDispatched = 0
   }
   
   // called when creating new Socket, or when closing a Socket
   Socket.prototype._reset = function () {
     this.remoteAddress = this.remotePort =
         this.localAddress = this.localPort = null
     this.remoteFamily = 'IPv4'
     this.readable = this.writable = false
     this._connecting = false
   }
   */

			function createServer(options, connectionListener) {
				return new Server(options, connectionListener);
			}

			_export('createServer', createServer);

			_export('connect', connect = function connect() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				args = normalizeConnectArgs(args);
				var s = new Socket(args[0]);
				return Socket.prototype.connect.apply(s, args);
			});

			_export('connect', connect);

			_export('createConnection', createConnection = connect);

			_export('createConnection', createConnection);

			_export('default', {
				createServer: createServer,
				createConnection: createConnection,
				connect: connect,
				Socket: Socket,
				Server: Server
			});
		}
	};
});