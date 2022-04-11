/////////////////////////////////////////////////////////////////
//
// pioupiou server
//

var boxesPath = __dirname

//var boxesPath = './boxes_Elise/'


//////////////////////////////////////////////////////
//
// 0- UUID GENERATOR & some utils
//
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var UUID_COUNTER = 0
function UUID() {
  UUID_COUNTER++;
  let days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  let date = new Date();
  return (
    "y" +
    date.getFullYear() +
    "m" +
    ("0" + (date.getMonth()+1)).slice(-2) + //BUG? Months start at 0
    "d" +
    ("0" + date.getDate()).slice(-2) +
    "h" +
    ("0" + date.getHours()).slice(-2) +
    "m" +
    ("0" + date.getMinutes()).slice(-2) +
    "s" +
    ("0" + date.getSeconds()).slice(-2) +
    "ms" +
    ("000" + date.getMilliseconds()).slice(-3) +
    "co" +
    ("000000" + UUID_COUNTER).slice(-6)
  );
}
//
//////////////////////////////////////////////////////


//////////////////////////////////////////////////////
//
// 1- log and message files
//
var fs = require('fs');
var logStream = fs.createWriteStream(__dirname + '/log.txt', {flags: 'a'});
var messageStream = fs.createWriteStream(__dirname + '/msg.txt', {flags: 'a'});


var now = function() {
  return Date().slice(0,25)+'UTC';
}

var log = function(message) {
  console.log( now() + ' : ' + message);
  logStream.write(now() + ' : ' + message + '\n');
}

var logMessage = function(message) {
  messageStream.write(now() + ' : ' + message + '\n');
}
//
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
//
// 2- app with express
//
var express = require('express')
var app = express();
//
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
//
// 3- server for app
//
var server = require('http').createServer(app);
//
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
//
// 4- app code
//
// http://expressjs.com/en/starter/static-files.html
app.use(express.static(__dirname + '/public'));

// sugar
let t = function(style,txt) {
  return `<span style="${style}">${txt}</span>`
}

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
  /*response.send(`
                <body style="background-color:black; font-size:40px; font-family:monospace" contenteditable="true">
                ${t('color:blue','Hello World<br>')}
                ${t('color:white','How are you ?<br>')}
                ${t('color:red','My name is Pioupiou.io !<br>')}
                </span>
                </body>
                `)*/
});
//
//////////////////////////////////////////////////////



//////////////////////////////////////////////////////
//
// 5- socket code, use the same app server
//
var io = require('socket.io')(server, {cors: true});

var players = {};

io.sockets.on('connection', function(socket) {

  //////////////////////////////////////////////////////
  //
  // 5a - MSG : if an unknown event happends, broadcast it to all clients
  //
  socket.onAny((event, data) => {
    if (['initialize','disconnect','message','directory'].includes(event)) return;
    log('socket.on [Any] => (event,data)=(' + event + ',' + data + ')');
    socket.broadcast.emit(event,data);
  });

  //////////////////////////////////////////////////////
  //
  // 5b - MSG : INITIALIZE
  //
  socket.on('initialize', function (data) {
    var id = socket.id;
    data.id = id;
    data.time = Date.now();
    players[id] = data;
    // emit to the 'initialize' sender all players data and its unique ID :
    socket.emit ('playerData', {id: id, players: players});

    console.log('### SEND ALL BOXES TO NEW PIOU CONNECTED ');

    boxesPath = __dirname + '/boxes_clients/'+data.name.toLowerCase()+'/'

    if (!fs.existsSync(boxesPath)) boxesPath= __dirname + '/boxes_clients/accessforbiden/'

    fs.readdirSync(boxesPath).forEach(fileName => {
      console.log(fileName);

      fs.readFile(boxesPath + fileName, function (err, data) {
        if (err) {
          throw err;
        }
        console.log(data.toString());
        socket.emit ('message', {name: 'pioupiou', message: data.toString()});
      });

    });
    console.log('### END SEND TO PIOU CONNECTED DIRECTORY ');


    // emit to all connected players except the 'initialize' sender
    socket.broadcast.emit ('playerJoined', data);
    log('socket.on [initialize] => emitter = ' + data.name);

    // compute and emit nbClientsConnected
    let nbClientsConnected = 0
    for (const [_, socket] of io.of("/").sockets) {
      //socket.emit('message',{name: 'server', id: id, message: ' : HELLO sister, HELLO brother'})
      nbClientsConnected++
    }
    let message = {name: 'Pioupiou', id: id, message: nbClientsConnected + ' fan(s) de Pioupiou connecté(s)'}
    //socket.emit ('message', message)
    // emit to all connected players except the 'initialize' sender
    //socket.broadcast.emit ('message', message);
  });

  //////////////////////////////////////////////////////
  //
  // 5c - MSG : DISCONNECT
  //
  socket.on('disconnect',function(){
    if(!players[socket.id]) return;
    log('socket.on [disconnect] => ' + players[socket.id].name + ' left !');
    delete players[socket.id];
    // Update clients with the new player killed
    socket.broadcast.emit('killPlayer',socket.id);
  });

  //////////////////////////////////////////////////////
  //
  // 5d - MSG : MESSAGE
  //
  socket.on ('message', function (data) {
    log('socket.on [message] => ( from , message ) = ( ' + data.name + ' , ' + data.message + ' )');
    logMessage(data.name + ' -> ' + data.message);

    //if(!players[data.id]) return;
    socket.broadcast.emit ('message', data);

    var fileContent = data.message;

    //boxesPath = './boxes_clients/'+data.name.toLowerCase()+'/'

    boxesPath = __dirname + '/boxes_clients/message/'


    // The absolute path of the new file with its name
    var filepath = boxesPath + UUID() + '.html';

    fs.writeFile(filepath, fileContent, (err) => {
        if (err) {
          console.log("## ERROR : The file "+filepath+"was NOT saved!");
          throw err;
        }
        console.log("The file "+filepath+"was succesfully saved!");
    });
  });

  //////////////////////////////////////////////////////
  //
  // 5e - MSG : SAVE
  //
  socket.on ('save', function (data) {
    log('socket.on [save] => ( from , save ) = ( ' + data.name + ' , ' + data.code + ' )');
    logMessage(data.name + ' -> ' + data.code);

    //if(!players[data.id]) return;
    //socket.broadcast.emit ('message', data);

    var fileContent = data.code;

    boxesPath = __dirname + '/boxes_clients/'+data.name.toLowerCase()+'/'

    // The absolute path of the new file with its name
    var filepath = boxesPath + UUID() + '.html';

    fs.writeFile(filepath, fileContent, (err) => {
        if (err) {
          console.log("## ERROR : The file "+filepath+"was NOT saved!");
          throw err;
        }
        console.log("The file "+filepath+"was succesfully saved!");
    });
  });

  //////////////////////////////////////////////////////
  //
  // 5f - MSG : DIRECTORY
  //

  socket.on ('directory', function (data) {
    log('socket.on [directory] => ( from , message ) = ( ' + data.name + ' , ' + data.message + ' )');
    logMessage(data.name + ' -> ' + data.message);
    //boxesPath = './boxes_private/'+data.message+'/';
    log('new path :' + boxesPath)
  });

});
//
// 5- socket code, use the same app server
//
//////////////////////////////////////////////////////




//////////////////////////////////////////////////////
//
// 7- listen to the server
//
server.listen(3000);
log('### Server started ###');
//
//////////////////////////////////////////////////////



//
// pioupiou server
//
//////////////////////////////////////////////////////////////////
