//-------------------------Module "Importing"-----------------------------//
var express = require('express'); //used as routing framework
var app = express(); //creates an instance of express

//modules required (same idea of #includes or Imports)
var path = require('path'); //Node.js module used for getting path of file
var logger = require('morgan'); //used to log in console window all request
var cookieParser = require('cookie-parser'); //Parse Cookie header and populate req.cookies
var bodyParser = require('body-parser'); //allows the use of req.body in POST request
var server = require('http').createServer(app); //creates an HTTP server instance
var io = require('socket.io')(server);



//-------------------------Express JS configs-----------------------------//

app.use(logger('dev')); //debugs logs in terminal
app.use(bodyParser.json()); //parses json and sets to body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'front'))); //sets all static file calls to folder


//---------------API-------------------//

app.get('/', function(req, res, next) {
  res.sendFile('index.html');
});

app.get('/color/:color', function(req, res, next) {
    
    var color = req.params.color || "white"; //defaults if no param is passed
    io.emit("color", {"color" : color});
    res.send(color + " broadcasted");
    
});

//-------------Socket IO -------------------//

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
    

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err); 
});*/

// error handlers
/*app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
});*/



// ------------ Server Setup --------------//


/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '8000');
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}


const PORT_NET = 6419;
const VERBOSE = false;
const SCALE = 300;
var net_key = "";
var net_option = "";
var net_value = "";
var nl_1 = -1; //new line 1
var nl_2 = -1; 

var net_vec = [];
var data_chunks = ""; // concatination of all chunks
var chunks = false;

var net = require('net');
var net_server = net.createServer( (connection) => {
    console.log('client connected');

    connection.on('close', () => {
	console.log('client disconnected');
    });

    connection.on('data', (data) =>  {
	
	// getting breaks in protocol
	//data = data.toString().replace(/\0[\s\S]*$/g,'');
	data = data.toString();
	nl_1 = data.indexOf("\n");

	nl_2 = data.substr(nl_1+1).indexOf("\n") + (nl_1 + 1);
	// getting broken up parts
	net_key = data.substring(0,nl_1);

	// if nl_1 is -1 then its being sent as data chunks
	// TODO find why it can start wit a \n
	if (nl_1 == -1 || net_key.length >  8) {
	    chunks = true;
	    data_chunks += data;
	} else {
	    	    
	    net_option = data.substring(nl_1+1, nl_2);
	    
	    // if it doesn't null terminate then it would be a empty string
	    if (net_key == 3) {
		net_value = data.substr(nl_2+1, data.indexOf("&"));
	    } else if (data.indexOf("\0") == -1) {
		net_value = data.substr(nl_2+1);
	    } else {
		net_value = data.substring(nl_2+1, data.indexOf("\0"));
	    }
	
	    if ( data.length > 0 && net_key != 1) {

		//check if data was being chunked
		if (chunks) {
		    if (VERBOSE) console.log("binding chunks");
		    chunks = false;
		    net_value = data_chunks + net_value;
		    data_chunks = "";
		}

		// Parse data - Format: X/Y/Z, ( ex: 3.2/4.1/7.5, == x:3.2, y:4.1, z:7.5 )
		let points = net_value.split(",");
		for (let i = 0; i < points.length; i++) {
		    let point = points[i].split("/");
		    
		    x_f = parseFloat(point[0]) * SCALE;
		    y_f = parseFloat(point[1]) * SCALE;
		    z_f = parseFloat(point[2]) * SCALE;

		    if (x_f == null || y_f == null || z_f == null ||
		        x_f == NaN  || y_f == NaN  || z_f == NaN ) { continue; } //skip if invalid

		    net_vec.push( { "x" : x_f, "y" : y_f, "z" : z_f } );
		}
		console.log("pushed vecs");

		if (net_key == 3) {
		    console.log("key == 3");
		    //fs.writeFileSync("test", JSON.stringify(net_vec), 'utf8');
		    console.log("file write!");
		    net_vec = [];
		}
	    }
	    
	    if (VERBOSE) console.log("key: ", net_key, "\toption: ", net_option);
	    
	}
	    
	connection.write("0"); //Sended response to client
	
//	connection.end();
//	console.log('Disconnected the client.');
    });

    connection.on('end', () => {
	console.log('END');
    });

    connection.on('error', (err) => {
	console.log('ERROR: ', err);
    });

});

net_server.listen(PORT_NET, () =>  {
    console.log('NodeJS Socket Server Ready - Port ' + PORT_NET);
}); 

