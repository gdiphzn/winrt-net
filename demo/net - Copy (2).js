'use strict';

System.register(['events', 'buffer', 'stream'], function (_export, _context) {
	var EventEmitter, Buffer, Duplex, _typeof, _createClass, DataWriter, DataReader, StreamSocketListener, StreamSocket, Socket, Server, connect, createConnection, errorCodes;

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

	/*for (var s = this; s !== null; s = s._parent) {
 	timers._unrefActive(s)
 }*/


	// the user has called .end(), and all the bytes have been sent out to the other side.
	// If allowHalfOpen is false, or if the readable side has ended already, then destroy.
	// If allowHalfOpen is true, then we need to do a shutdown,
	// so that only the writable side will be cleaned up.
	function onSocketFinish() {
		// If still connecting - defer handling 'finish' until 'connect' will happen
		if (this._connecting) {
			return this.once('connect', onSocketFinish);
		}

		if (!this.readable || this._readableState.ended) {
			return this.destroy();
		}

		//????????????????????????????
		// otherwise, just destroy()
		if (!this._handle) return this.destroy();
	}

	function afterShutdown(status, handle, req) {
		// callback may come after call to destroy.
		if (this.destroyed) return;

		if (this._readableState.ended) {
			this.destroy();
		} else {
			this.once('_socketEnd', this.destroy);
		}
	}

	// the EOF has been received, and no more bytes are coming.
	// if the writable side has ended already, then clean everything up.
	function onSocketEnd() {
		// XXX Should not have to do as much crap in this function.
		// ended should already be true, since this is called *after* the EOF errno and onread has eof'ed
		this._readableState.ended = true;
		if (this._readableState.endEmitted) {
			this.readable = false;
			maybeDestroy(this);
		} else {
			this.once('end', function () {
				this.readable = false;
				maybeDestroy(this);
			});
			this.read(0);
		}

		if (!this.allowHalfOpen) {
			this.write = writeAfterFIN;
			this.destroySoon();
		}
	}

	// Provide a better error message when we call end() as a result
	// of the other side sending a FIN.  The standard 'write after end'
	// is overly vague, and makes it seem like the user's code is to blame.
	function writeAfterFIN(chunk, encoding, cb) {
		if (typeof encoding === 'function') {
			cb = encoding;
			encoding = null;
		}

		var er = new Error('This socket has been ended by the other party');
		er.code = 'EPIPE';
		this.emit('error', er);
		if (typeof cb === 'function') {
			process.nextTick(cb, er);
		}
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
	function isPipeName(s) {
		return typeof s === 'string' && toNumber(s) === false;
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
 console.log('this.destroyed', this.destroyed);/
 
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
 		if (this._closing || this.destroyed) {
 			return;
 		}
 		this._closing = true;
 		this.writable = false;
 		// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
 		// in networking drivers, it flushes the write.
 		this._handle.cancelIOAsync().done(() => {
 			// cancelIOAsync might call the callback synchronously if there's no pending read/write
 			// but it needs to be async - to properly react to errors (Error: write after end)
 			setImmediate(this._end);
 		}, () => {
 			// TODO investigate - does this need any futher handling?
 			setImmediate(this._end);
 		});
 	}*/

	/*
 ERRORS
 
 EACCES (Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions.
 EADDRINUSE (Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address.
 ECONNREFUSED (Connection refused): No connection could be made because the target machine actively refused it. 
 ECONNRESET (Connection reset by peer): A connection was forcibly closed by a peer. 
 
 */

	// this is (modified) code from module 'util' but there's no point to have it as dependecy because of one function
	// https://github.com/nodejs/node/blob/master/lib/util.js

	function errnoException(err, syscall, address, port) {
		var errname = errorCodes[err.number] || err.number;
		var message = syscall + ' ' + errname;
		var e = new Error(message);
		e.code = e.errno = errname;
		e.syscall = syscall;
		e.message = err.message;
		if (port) {
			e.port = port;
		}
		if (address) {
			e.address = address;
		}
		return e;
	}return {
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

			//export class Socket extends EventEmitter {
			_export('Socket', Socket = function (_Duplex) {
				_inherits(Socket, _Duplex);

				// 64kB

				function Socket(options) {
					var _ret;

					_classCallCheck(this, Socket);

					var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Socket).call(this));

					_this._connecting = false;
					_this._connected = false;
					_this._closing = false;
					_this.destroyed = false;
					_this._hadError = false;
					_this._handle = null;
					_this._maxChunkLength = 65536;
					_this.localAddress = undefined;
					_this.localPort = undefined;
					_this.remoteAddress = undefined;
					_this.remoteFamily = undefined;
					_this.remotePort = undefined;
					_this._hadError = false;
					_this.bytesRead = 0;
					_this._bytesDispatched = 0;
					_this._pendingData = [];


					if (!(_this instanceof Socket)) return _ret = new Socket(options), _possibleConstructorReturn(_this, _ret);

					if (options === undefined) {
						options = {};
					}

					if (options.handle) {
						// wrapping server connection socket
						_this._handle = options.handle; // private
						_this.readable = _this.writable = true;
						_this._onConnect();
					} else {
						// these will be set once there is a connection
						_this.readable = _this.writable = false;
					}

					// shut down the socket when we're finished with it.
					_this.on('finish', _this.destroy);
					//this.on('finish', onSocketFinish);
					//this.on('_socketEnd', onSocketEnd);

					_this._initSocketHandle(_this);

					// default to *not* allowing half open sockets
					_this.allowHalfOpen = options && options.allowHalfOpen || false;

					// if we have a handle, then start the flow of data into the
					// buffer.  if not, then this will happen when we connect
					if (_this._handle && options.readable !== false) {
						if (options.pauseOnCreate) {
							// TODO
						} else {
								_this.read(0);
							}
					}

					// Reserve properties
					_this.server = null;

					_this._onConnect = _this._onConnect.bind(_this);
					_this._onError = _this._onError.bind(_this);
					_this._onReceive = _this._onReceive.bind(_this);
					_this._end = _this._end.bind(_this);
					_this._onEnd = _this._onEnd.bind(_this);
					return _this;
				}
				// 35536 is max size of data the chunk could read from stream at once
				// (it's not just a random value. Was measured with Node.js)


				_createClass(Socket, [{
					key: '_initSocketHandle',
					value: function _initSocketHandle() {
						this.destroyed = false;
						this.bytesRead = 0;
						this._bytesDispatched = 0;
						this._sockname = null;
					}
				}, {
					key: 'address',
					value: function address() {
						return {
							address: this.remoteAddress,
							family: this.remoteFamily,
							port: this.remotePort
						};
					}
				}, {
					key: 'connect',
					value: function connect(options, cb) {
						var _this2 = this;

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

						if (options.host == 'localhost') {
							options.host = '127.0.0.1';
						}

						// emiting 'close' event right after 'end'
						this.once('end', this._onEnd);

						this._handle = new StreamSocket();
						//this._handle.control.keepAlive = false;
						// Microsoft desperately wants to make this more complicated than it needs to be
						var hostName = new Windows.Networking.HostName(options.host);

						this._connecting = true;
						this._handle.connectAsync(hostName, options.port).done(this._onConnect, function (err) {
							return _this2._onError(err, 'connect', options.host, parseInt(options.port));
						});
					}
				}, {
					key: '_onConnect',
					value: function _onConnect() {
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
						var _this3 = this;

						//console.log('################################# _readChunk ####################################')
						//if (this._connected && this.readable) {
						if (this.readable) {
							// sets up data listener and calls _onReceive if (what a surprise) data is received
							var thing = this._reader.loadAsync(this._maxChunkLength);
							//console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
							thing.done(this._onReceive, function (err) {
								return _this3._onError(err, 'read');
							});
							//console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
						}
					}
				}, {
					key: '_onReceive',
					value: function _onReceive(chunkBytesRead) {
						var _this4 = this;

						if (this.destroyed) {
							// this happens once in 10 tries so don't delete it. It could happen. safety measures...
							return false;
						}
						if (chunkBytesRead == 0) {
							this.end();
							return;
						}
						this.bytesRead += chunkBytesRead;
						// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
						var buffer = new Buffer(chunkBytesRead);
						this._reader.readBytes(buffer);
						// if returns false, then apply backpressure
						var pushed = this.push(buffer);
						if (!pushed) {}
						//chrome.sockets.tcp.setPaused(this.id, true) // TODO

						// keep receiving next data
						setImmediate(function () {
							return _this4._readChunk();
						});
					}
				}, {
					key: '_onError',
					value: function _onError(err, syscall, address, port) {
						console.log('### _onError', err, syscall);
						// TODO investigate - should multiple errors be merged into one?
						// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
						if (this._closing || this.destroyed) {
							// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
							return;
						}
						this._connecting = false;
						this._hadError = true;
						this._end();
						this.emit('error', errnoException(err, syscall, address, port));
					}
				}, {
					key: 'end',
					value: function end(data, encoding) {
						var _this5 = this;

						// Duplex.prototype.end has to be called everytime to ensure proper reaction (calling .write(), ._write()
						// and throwing Error: write after end) if there are any data (first argument of this method)
						// to be sent before closing socket
						Duplex.prototype.end.call(this, data, encoding);
						//if (!this._connected) {
						if (!this._connecting && !this._connected) {
							// .end() was called before .connect() do nothing
							return;
						}
						if (this._closing || this.destroyed) {
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
							if (_this5.destroyed) {
								// .destroy() might have been called in meantime
								return;
							}
							// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
							// in networking drivers, it flushes the write.
							_this5._handle.cancelIOAsync().done(_this5._end, _this5._end);
							// TODO investigate - does this need any futher error handling?
						});
					}
				}, {
					key: '_end',
					value: function _end() {
						if (this.destroyed) {
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
						var _this6 = this;

						if (this.destroyed) {
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
							return _this6.emit('close', _this6._hadError || !!exception);
						});
					}
				}, {
					key: '_destroy',
					value: function _destroy() {
						this._connecting = false;
						this._connected = false;
						this._closing = false;
						this.destroyed = true;

						this.writable = this.readable = false;
						if (this._writer) {
							// might be writing at the moment
							try {
								this._writer.detachStream();
							} catch (e) {}
							// TODO invesitagate - does this need any further error handling? Or will the writer just burn in flames on it's own?
							this._writer = null;
						}
						if (this._reader) {
							// might be reading at the moment
							try {
								this._reader.detachStream();
							} catch (e) {}
							// TODO invesitagate - does this need any further error handling? Or will the reader just burn in flames on it's own?
							this._reader = null;
						}
						if (this._handle) {
							this._handle.close();
							this._handle = null;
						}
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
					key: '_write',
					value: function _write(chunk, encoding, callback) {
						var _this7 = this;

						if (!callback) callback = function callback() {};

						if (this._connecting) {
							this._pendingData.push(chunk);
							this.once('connect', function () {
								removeFromArray(_this7._pendingData, chunk);
								_this7._write(chunk, encoding, callback);
							});
							return;
						}
						/*
      		if (this.destroyed) {
      			callback(new Error('This socket is closed'))
      			return;
      		}
      */
						//if (this._connected) {
						if (this.writable) {
							this._writer.writeBytes(chunk);
							// note: don't pass callback as rference! oh boy those contexts...
							this._writer.storeAsync().done(function () {
								_this7._bytesDispatched += chunk.length;
								callback();
							}, function (err) {
								return _this7._onError(err, 'write');
							});
						} else {
							callback(new Error('This socket is closed'));
						}
					}
				}, {
					key: '_read',
					value: function _read(n) {}
					/*if (this._connecting || !this._handle) {
     	debug('_read wait for connection');
     	this.once('connect', () => this._read(n));
     } else if (!this._handle.reading) {
     	// not already reading, start the flow
     	debug('Socket._read readStart');
     	this._handle.reading = true;
     	var err = this._handle.readStart();
     	if (err)
     		this._destroy(errnoException(err, 'read'));
     }*/


					/*read(n) {
     	if (n === 0)
     		return stream.Readable.prototype.read.call(this, n);
     
     	this.read = stream.Readable.prototype.read;
     	this._consuming = true;
     	return this.read(n);
     };*/

				}, {
					key: 'setTimeout',
					value: function setTimeout(timeout, callback) {
						/*if (timeout === 0) {
      	timers.unenroll(this)
      	if (callback) {
      		this.removeListener('timeout', callback)
      	}
      } else {
      	timers.enroll(this, timeout)
      	timers._unrefActive(this)
      	if (callback) {
      		this.once('timeout', callback)
      	}
      }
      		return this*/
					}
				}, {
					key: '_onTimeout',
					value: function _onTimeout() {
						this.emit('timeout');
					}
				}, {
					key: 'setNoDelay',
					value: function setNoDelay(enable) {
						var _this8 = this;

						if (!this._handle) {
							this.once('connect', enable ? this.setNoDelay : function () {
								return _this8.setNoDelay(enable);
							});
							return this;
						}

						// backwards compatibility: assume true when `enable` is omitted
						if (this._handle.setNoDelay) this._handle.setNoDelay(enable === undefined ? true : !!enable);

						return this;
					}
				}, {
					key: 'setKeepAlive',
					value: function setKeepAlive(setting, msecs) {
						var _this9 = this;

						if (!this._handle) {
							this.once('connect', function () {
								return _this9.setKeepAlive(setting, msecs);
							});
							return this;
						}

						if (this._handle.setKeepAlive) this._handle.setKeepAlive(setting, ~ ~(msecs / 1000));

						return this;
					}
				}, {
					key: '_unrefTimer',
					value: function _unrefTimer() {}
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

			_export('Server', Server = function (_EventEmitter) {
				_inherits(Server, _EventEmitter);

				function Server(options, connectionListener) {
					_classCallCheck(this, Server);

					var _this10 = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

					_this10._host = null;
					_this10._connections = 0;


					_this10._onError = _this10._onError.bind(_this10);
					_this10._onListen = _this10._onListen.bind(_this10);
					_this10._onConnection = _this10._onConnection.bind(_this10);

					if (!(_this10 instanceof Server)) {
						var _ret2;

						return _ret2 = new Server(options, connectionListener), _possibleConstructorReturn(_this10, _ret2);
					}

					EventEmitter.call(_this10);

					if (typeof options === 'function') {
						connectionListener = options;
						options = {};
						_this10.on('connection', connectionListener);
					} else {
						options = options || {};

						if (typeof connectionListener === 'function') {
							_this10.on('connection', connectionListener);
						}
					}

					_this10._connections = 0;

					_this10._handle = null;
					//this._unref = false;

					_this10.allowHalfOpen = options.allowHalfOpen || false;
					_this10.pauseOnConnect = !!options.pauseOnConnect;
					return _this10;
				}

				_createClass(Server, [{
					key: 'address',
					value: function address() {
						return {
							port: this._port,
							address: this._host,
							family: this._host.indexOf(':') !== -1 ? 'IPv6' : 'IPv4'
						};
					}
				}, {
					key: 'listen',
					value: function listen(port, callback) {
						var _this11 = this;

						this._closing = false;
						this.once('listening', callback);
						if (self._handle) {
							if (port == this._port) {
								// nodejs allows (accidentally?) calling .listen() multiple times and simply ignores it
								return false;
							} else {
								// TODO
								// destroy original server and start listening on new port
							}
						}
						// TODO find local IP
						this._host = '::';
						// WinRT needs port (or rather serviceName) to be string
						this._port = port;
						port = port + '';
						this._handle = new StreamSocketListener(port);
						this._handle.addEventListener('connectionreceived', this._onConnection);
						this._handle.bindServiceNameAsync(port).done(this._onListen, function (err) {
							return _this11._onError(err, 'listen', _this11._host, port);
						});
					}
				}, {
					key: '_onListen',
					value: function _onListen(foo) {
						console.log('onlisten', this._handle);
						this.emit('listening');
					}
				}, {
					key: '_onConnection',
					value: function _onConnection(e) {
						if (this.maxConnections && this._connections >= this.maxConnections) {
							e.socket.close();
							return;
						}

						var socket = new Socket({
							server: this,
							handle: e.socket,
							allowHalfOpen: this.allowHalfOpen,
							pauseOnCreate: this.pauseOnConnect
						});
						this._connections++;
						this.emit('connection', socket);
					}
				}, {
					key: 'getConnections',
					value: function getConnections(cb) {
						process.nextTick(cb, null, this._connections);
					}
				}, {
					key: '_onError',
					value: function _onError(err, syscall, address, port) {
						// Clean up a listener if we failed to bind to a port.
						try {
							this._handle.cancelIOAsync();
							this._handle.close();
						} catch (e) {}
						this._handle = null;

						// When we close a socket, outstanding async operations will be canceled and the
						// error callbacks called.  There's no point in displaying those errors.
						if (this._closing || this.destroyed) {
							return;
						}
						this.emit('error', errnoException(err, syscall, address, port));
					}
				}, {
					key: 'ref',
					value: function ref() {}
				}, {
					key: 'unref',
					value: function unref() {}
				}, {
					key: 'listening',
					get: function get() {
						return !!this._handle;
					}
				}]);

				return Server;
			}(EventEmitter));

			_export('Server', Server);

			/*
   
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

			errorCodes = {
				'-2147014848': 'EADDRINUSE',
				'-2147014836': 'ETIMEDOUT',
				'?': 'ECONNREFUSED',
				'-2147014842': 'ECONNRESET'
			};
			;
		}
	};
});