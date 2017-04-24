#!/usr/local/bin/node
let express = require('express');
let app = express();
let http = require('http').Server(app);
let net = require('net');
let io = require('socket.io')(http);

let dataInReception ="";
let hexInReception="";
let lastRequest='';
var dateOrigin;

app.use(express.static(__dirname + '/view'));
app.use(express.static(__dirname + '/public'));

let socket = new net.Socket();
socket.setEncoding('hex');



socket.on('error', function(err) {
  console.log("Error: " + err);
});


/* Gestions des routes
 * */
app.get('/', function(req, res) {
    res.sendFile('index.html');
});



http.listen(3000); // Lancement du serveur web
console.log("server is now running on port 3000");

let connections = [];

io.on('connection', handleConnection);


socket.on('end', function(){
    io.emit("tcpDisconected");
});


/*
 * bind des evenenements aux fonctions de callback
 * Gestion des clients connecté dans la list client[]
 */

function handleConnection(client) {
    connections.push(client);
    client.on('askConnection',connectTcp);
    client.on('askDisconnection',disconnectTcp);
    client.on('start', startDumby);
    client.on('idle', restartState);
    client.on('sendPos', sendPos);
    client.on('pressArena',eventArena);
    client.on('arenaConfirm',arenaConfirm);
    client.on('arenaInfirm', arenaInfirm);
    client.on('MOVEFORWARD', moveForward);
    client.on('MOVEBACK', moveBack);
    client.on('MOVERIGHT', moveRight);
    client.on('MOVELEFT', moveLeft);
    client.on('MOVESTOP', stopMove);
    client.on('disconnect', function(client)
    {
        
        let index = connections.indexOf(client);
        connections.splice(index,1);
    });
}

/*
 * Descriptions des fonctions de call back
 */

connectTcp = function(msg)
{
     socket.connect(8080, "localhost", function(err) {
	 dateOrigin = new Date();
         console.log('Connected to raspberry');
         io.emit("tcpConnected","connected");
	sendConsole("Connecté à la cible");
     });
     lastRequest="Connection";

}

disconnectTcp = function(msg)
{
    socket.write("MSG:C ")
    lastRequest="Disconnection";
	sendConsole("Déconnecté de la cible");
}

moveForward = function(){
    socket.write("DMB:F ");
    lastRequest="GoingForward";
    sendConsole("Avance");
}

moveBack = function(){
    socket.write("DMB:B ");
    lastRequest="GoingBack";
    sendConsole("recule");
}

moveRight = function(){

    socket.write("DMB:R ");
    lastRequest="TurnRight";
    sendConsole("pivot droite");
}

moveLeft = function(){
    socket.write("DMB:L ");
    lastRequest="TurnLeft";
    sendConsole("pivotGauche");
}

stopMove = function(){
    socket.write("DMB:S ");
    lastRequest="Stop";
    sendConsole("Stop");
}

startDumby = function(){
    socket.write("DMB:u ");
    lastRequest="StartDumby";
    sendConsole("Start dumby");
}

restartState = function(){
    socket.write("DMB:r ");
    lastRequest="IdleDumby";
    sendConsole("Idle dumby");
}

sendPos = function(msg){
  socket.write("POS:" + msg+" ");
  lastRequest="SendPosition";	
  sendConsole("Envoi position : " + msg);
}

eventArena = function(){
  socket.write("MSG:"+"bArena"+" ");
  lastRequest="eventArena";
}

arenaConfirm=function(){
  socket.write("MSG:"+"okArena"+" ");
  lastRequest="arenaConfirm";
}


arenaInfirm=function(){
  socket.write("MSG:"+"noArena"+" ");
  lastRequest="arenaInfirm";
  }

/*
 * Traite une trame de donnée reçu.
 */
function traitmentMessage(val){
    payload = val.substring(6);
    header = hex2a(val.substring(0,6));
    //console.log("Header : " + header);
    // feed back type header
    if(header != "IMG")
    {
        payload=hex2a(payload);
    }
   else{
	//sendConsole("image reçu");
   }


    if(header != "ACK")
        io.emit(header,payload); // Main case
    else
    { 	
		
        if(lastRequest=="IdleDumby") // specific case of disconnection
        {
            io.emit("dumberDisconected");
        }
        else if(lastRequest=="StartDumby"){
            io.emit("dumberConnected");
        }
       /* else
        {
            // set payload
            if(payload =="0")
                payload = lastRequest + ":sucess";
            else
                payload = lastRequest + ":failed";
            
            io.emit(header,payload);
        }*/
    }
}


/*
 * Evenement sur une donnée tcp reçu 
 */
socket.on('data',function(data){
   let trame = data.split('5452414d45'); // Trame sera le parser final ici écrit en hexa
   dataInReception+=trame[0];
   if(trame.length>1)
   {
       traitmentMessage(dataInReception);
       for(let i = 0; i < trame.length-1;i++)
            traitmentMessage(trame[i]);
        dataInReception=trame[trame.length-1];
   }
});


/*
 * Fonction qui retourne le temps à un message passé en paramétre
 */
function addTime(msg)
{
	let a = Math.abs(new Date()-dateOrigin);
	let date = new Date(a);
	let message = "<"+date.getMinutes()+":"+date.getSeconds()+":"+date.getMilliseconds()+">"+msg;
	return message;
}

function sendConsole(msg)
{
	io.emit('MSG',addTime(msg));
}

/*
 * Conversion chaine de caractére avec des informations hexa en chaine de caractére
 * avec les informations ascii.
 */
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

