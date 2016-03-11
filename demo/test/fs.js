'use strict';

System.register(['net', 'buffer', 'stream'], function (_export, _context) {
	var net, Buffer, stream, _createClass, port, folder, CustomWritable, UpperCaseTransformStream;

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

	/*
 setTimeout(() => {
 
 var socket = new net.Socket();
 socket.connect(port, 'localhost');
 
 
 socket.on('connect', function() {
 	console.log('# socket connect')
 	socket
 		//.pipe(new UpperCaseTransformStream())
 		.pipe(writeStream);
 });
 
 socket.on('data', function(data) {
 	console.log('# socket data |', data.length);
 });
 
 socket.on('end', function() {
 	console.log('# socket end')
 });
 
 socket.on('error', function(err) {
 	console.log('# socket ERROR')
 });
 
 socket.on('close', function(err) {
 	console.log('# socket close')
 });
 
 }, 300)
 */

	function fsCreateReadStream(path) {
		var theStream = new stream.PassThrough();
		fsReadFile(path, function (err, buffer) {
			theStream.write(buffer);
		});
		return theStream;
	}

	function winBufferToBuffer(winBuffer) {
		var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(winBuffer);
		var buffer = new Buffer(winBuffer.length);
		dataReader.readBytes(buffer);
		return buffer;
	}

	function fsWriteFile(path, data, callback) {
		var FileIO = Windows.Storage.FileIO;
		var localFolder = Windows.Storage.ApplicationData.current.localFolder;
		localFolder.createFileAsync(path, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
			console.log('file', file);
			FileIO.writeBytesAsync(file, data).then(function () {
				callback(null);
			}, function (error) {
				callback(error);
			});
		});
	}

	/*
 var writeStream = fsCreateWriteStream('sampletext3.txt');
 setTimeout(() => {
 	writeStream.write('wow ');
 	writeStream.write('this is');
 }, 20)
 setTimeout(() => {
 	writeStream.write(' working');
 }, 100)
 */
	/*
 fsWriteFile('sampletext3.txt', new Buffer('wow, very text!'), err => {
 	if (err) {
 		console.log('error saving file', err);
 	} else {
 		console.log('file saved at', Windows.Storage.ApplicationData.current.localFolder.path);
 	}
 })
 */
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_buffer) {
			Buffer = _buffer.Buffer;
		}, function (_stream) {
			stream = _stream.default;
		}],
		execute: function () {
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

			port = 22112;
			folder = Windows.Storage.ApplicationData.current.localFolder;

			try {
				folder.createFileAsync('sampletext3.txt', Windows.Storage.CreationCollisionOption.replaceExisting).done(function (file) {
					file.openAsync(Windows.Storage.FileAccessMode.readWrite).done(function (randomStream) {
						console.log('FILE LOADED');
						randomStream.close();
						/*var outStream = randomStream.getOutputStreamAt(0);
      var dataWriter = new Windows.Storage.Streams.DataWriter(outStream)
      dataWriter.writeString('FOO!');
      dataWriter.storeAsync().done(() => {
      	//outStream.flushAsync().done(() => {
      		console.log('flushed');
      				dataWriter.writeString('BAR!');
      		dataWriter.storeAsync().done(() => {
      			outStream.flushAsync().done(() => {
      				console.log('flushed');
      			})
      		})
      			//})
      })*/
					}, function (e) {
						console.log('error 1');
						console.log(e);
					});
				}, function (e) {
					console.log('error 2');
					console.log(e);
				});
			} catch (e) {
				console.log('catch fooo');
			}
			CustomWritable = function (_stream$Writable) {
				_inherits(CustomWritable, _stream$Writable);

				function CustomWritable() {
					_classCallCheck(this, CustomWritable);

					return _possibleConstructorReturn(this, Object.getPrototypeOf(CustomWritable).apply(this, arguments));
				}

				_createClass(CustomWritable, [{
					key: '_write',
					value: function _write(chunk, cb) {
						console.log('_write', chunk);
					}
				}]);

				return CustomWritable;
			}(stream.Writable);

			UpperCaseTransformStream = function (_stream$Transform) {
				_inherits(UpperCaseTransformStream, _stream$Transform);

				function UpperCaseTransformStream() {
					_classCallCheck(this, UpperCaseTransformStream);

					return _possibleConstructorReturn(this, Object.getPrototypeOf(UpperCaseTransformStream).apply(this, arguments));
				}

				_createClass(UpperCaseTransformStream, [{
					key: '_transform',
					value: function _transform(chunk, enc, cb) {
						var upperChunk = chunk.toString().toUpperCase();
						this.push(upperChunk);
						cb();
					}
				}]);

				return UpperCaseTransformStream;
			}(stream.Transform);
		}
	};
});