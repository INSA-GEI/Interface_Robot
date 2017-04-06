$(document).ready(function() {
    vueTargetDeconnect();
    let socket = io();
    let keysdown = {};
    var nbrImage=0;

    let stateConnectionTarget = false;
    let stateConnectionDumber = false;

    $('img').on('dragstart', function(event) { event.preventDefault(); });

    /*Event entrant */

    // évenement de connection
    socket.on("tcpConnected",function(msg){            // tcpConnected : Entrée
        stateConnectionTarget=true;
        $("#target").removeClass('led-lg-red');
        $("#target").addClass('led-lg-green');
        vueTargetConnect();
    });

    // événement de deconnection
    socket.on("tcpDisconected",function(){             // tcpDisconected : Entrée
        stateConnectionTarget=false;
        $("#target").removeClass('led-lg-green');
        $("#target").addClass('led-lg-red');
        $('#battery').attr("src","img/chargefull.png");
        $('#video').attr("src","img/nosignal2.png");
        vueTargetDeconnect();
	stateConnectionDumber = false;
    });

    socket.on("dumberDisconected",function(msg){ //dumberDisconected : Entrée
	stateConnectionDumber = false;         
        $("#dumber").removeClass('led-lg-green');
        $("#dumber").addClass('led-lg-red');
        vueTargetConnect();
    });

    socket.on("dumberConnected",function(msg){            //dumberConnected : Entrée
        stateConnectionDumber=true;
        $("#dumber").removeClass('led-lg-red');
        $("#dumber").addClass('led-lg-green');
        vueRobotConnect();
        
        //déconection tcp
    });

    socket.on('MSG',function(data){           // messageConsole : Entrée
        $("div.console").prepend("</br>" +data);
    });

    socket.on("BAT", function(msg){              // messageBat : Entrée
        if(msg === "0")
        {
            $('#battery').attr("src","img/chargefull-0.png");

        }
        else if(msg==="1")
        {
            $('#battery').attr("src","img/chargefull-1.png");
        }
        else if(msg ==="2")
        {
            $('#battery').attr("src","img/chargefull.png");
        }
    });

    socket.on("FDB", function(msg){                // orderAnswer : Entrée
	console.log("ACK : " + msg);    
});


    socket.on("POS", function(msg){
    $("#position").text(msg+"°");
    });



    socket.on("IMG", function(msg){    
        var src = "data:image/jpeg;base64,";
        src += hexToBase64(msg);
        var frame = document.getElementById("video");
        frame.src = src;
	nbrImage++;
    });


    /*Event sortant */


    $("#target").click(function(event){
        //demande deconnection cible
        if(stateConnectionTarget === false)
        {
            socket.emit('askConnection');           // askConnection : sortie
        }
        else
        {
            socket.emit('idle');                    // idle : sortie
            socket.emit('askDisconnection');        // askDisconnection : sortie
        }
        
        
    });

    $('#dumber').click(function(event){
        if(stateConnectionDumber === false)
        {
            socket.emit('start');                   // start : sortie
        }
        else
        {
            socket.emit('idle');                    // idle : sortie

        }
    });

    $('#detectArena').click(function(event){
	    socket.emit('pressArena');
        if(confirm("La detection d'arene vous convient-elle ?"))
	{
		socket.emit('arenaConfirm');
		//emetre confirmation
	}
	else
	{
		socket.emit('arenaInfirm');
		//emetre anulation
	}
    });


    $('#video').click(function(e) {
        var posX = $(this).offset().left, posY = $(this).offset().top;
        let robotX = (e.pageX - posX)|0, robotY=e.pageY - posY;
        socket.emit('sendPos', Math.floor(robotX*1.33)+ ',' +Math.floor( robotY*1.33)); // robotPos Sortie
    });

    $(window).keydown(function(e) {
        if(stateConnectionDumber && stateConnectionTarget)
        {
                if(keysdown[e.keyCode]) {    
                return;
            }

            keysdown[e.keyCode] = true;



                switch(e.keyCode) {
                case 37: // left
                    $("#keyLeft").css("background-color","blue");
                    socket.emit("MOVELEFT");                        // MOVELEFT MOVEFORWARD MOVEBACK MOVERIGHT STOP : Sortie
                break;

                case 38: // up
                    $("#keyUp").css("background-color","blue");
                    socket.emit("MOVEFORWARD");
                break;

                case 39: // right
                    $("#keyRight").css("background-color","blue");
                    socket.emit("MOVERIGHT");
                break;

                case 40: // down
                    $("#keyDown").css("background-color","blue");
                    socket.emit("MOVEBACK");
                break;

                default: return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        }
    });


    $(window).keyup(function(e) {
            
        if(stateConnectionDumber && stateConnectionTarget)
        {
                switch(e.keyCode) {
                case 37: // left
                    $("#keyLeft").css("background-color","white");
                    socket.emit("MOVESTOP");
                    delete keysdown[e.keyCode];
                break;

                case 38: // up
                    $("#keyUp").css("background-color","white");
                    socket.emit("MOVESTOP");
                    delete keysdown[e.keyCode];
                break;

                case 39: // right
                    $("#keyRight").css("background-color","white");
                    socket.emit("MOVESTOP");
                    delete keysdown[e.keyCode];
                break;

                case 40: // down
                    $("#keyDown").css("background-color","white");
                    socket.emit("MOVESTOP");
                    delete keysdown[e.keyCode];
                break;

                default: return; // exit this handler for other keys
            }
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    function hexToBase64(str) {
        return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
    }

setInterval(function(){
   $('#fps').text(nbrImage + " FPS");
   nbrImage = 0;
}, 1000);



});

