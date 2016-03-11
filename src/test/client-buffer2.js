import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;


var socket = new net.Socket();
socket.connect(port, 'localhost');

socket.on('connect', function() {
	console.log('# socket connect')
/*
	var upper = new Upper();
	var buffer = new Buffer('hello world, this is test');
	var bufferStream = new BufferStream(buffer);
	bufferStream.pipe(upper);
	upper.pipe(socket);
*/

	fsReadFile('ms-appx:///demo/sampletext1.txt', (err, buffer) => {
		console.log('buffer', buffer);
		socket.write(buffer);
		readableStreamBuffer(buffer)
			.pipe(new UpperCaseTransformStream())
			.pipe(socket);
		new BufferStream(buffer)
			.pipe(socket)
	});

/*
	var theStream = new stream.PassThrough();
	theStream.pipe(upper);
	upper.pipe(socket);
	theStream.push(new Buffer('this is the buffer'));
	setTimeout(() => {
		theStream.push('hello world, this is test');
	}, 10)
	setTimeout(() => {
		theStream.push('second message');
		theStream.push(null);
	}, 100)
*/
	//upper.pipe(process.stdout);
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



function readableStreamBuffer(buffer) {
	var theStream = new stream.PassThrough();
	theStream.write(buffer);
	return theStream;
}

class UpperCaseTransformStream extends stream.Transform {
	_transform(chunk, enc, cb) {
		var upperChunk = chunk.toString().toUpperCase();
		this.push(upperChunk);
		cb();
	}
}

class BufferStream extends stream.Readable {

	constructor(source) {
		super();
	    if (!Buffer.isBuffer(source)) {
	        throw new Error('Source must be a buffer.' );
	    }
	    this._source = source;
	    // I keep track of which portion of the source buffer is currently being pushed
	    // onto the internal stream buffer during read actions.
	    this._offset = 0;
	    this._length = source.length;
	    // When the stream has ended, try to clean up the memory references.
	    this.on('end', this._destroy);
	}

	// I attempt to clean up variable references once the stream has been ended.
	// --
	// NOTE: I am not sure this is necessary. But, I'm trying to be more cognizant of memory
	// usage since my Node.js apps will (eventually) never restart.
	_destroy() {
	    this._source = null;
	    this._offset = null;
	    this._length = null;
	}

	// I read chunks from the source buffer into the underlying stream buffer.
	// --
	// NOTE: We can assume the size value will always be available since we are not
	// altering the readable state options when initializing the Readable stream.
	_read(size) {
	    // If we haven't reached the end of the source buffer, push the next chunk onto
	    // the internal stream buffer.
	    if (this._offset < this._length) {
	        this.push(this._source.slice(this._offset, (this._offset + size)));
	        this._offset += size;
	    }
	    // If we've consumed the entire source buffer, close the readable stream.
	    if (this._offset >= this._length) {
	        this.push(null);
	    }

	}

}


function winBufferToBuffer(winBuffer) {
	var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(winBuffer);
	var buffer = new Buffer(winBuffer.length);
	dataReader.readBytes(buffer);
	return buffer;
}


function fsReadFile(path, callback) {
	var FileIO = Windows.Storage.FileIO;
	var url = new Windows.Foundation.Uri(path);
	Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(file => {
		FileIO.readBufferAsync(file).then(winBuffer => {
			var buffer = winBufferToBuffer(winBuffer);
			callback(null, buffer);
		})
	});
}