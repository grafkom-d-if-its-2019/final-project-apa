window.onload = function(){
    var socket = io();
    var playerid = document.getElementById('player').getAttribute('value');
    dom = document.getElementById('TutContainer');
    document.addEventListener("keydown", handleOnKeyPress)
    document.getElementById('lompat').onclick = function(){lompat()};
    document.getElementById('kanan').onclick = function(){kanan()};
    document.getElementById('kiri').onclick = function(){kiri()};
    document.getElementById('restart').onclick = function(){restart()};
    function handleOnKeyPress(keyEvent){
        if (keyEvent.keyCode === 82){
            socket.emit('action', {player:playerid, action:82});
        }
        if ( keyEvent.keyCode === 37) {//left
            socket.emit('movement', {player:playerid, movement:37});
        } else if ( keyEvent.keyCode === 39) {//right
            socket.emit('movement', {player:playerid, movement:39});
        }else{
            if ( keyEvent.keyCode === 38){//up, jump
                socket.emit('movement', {player:playerid, movement:38});
            }
        }
    }
    function lompat(){
        socket.emit('movement', {player:playerid, movement:38});
    }
    function kanan(){
        socket.emit('movement', {player:playerid, movement:39});
    }
    function kiri(){
        socket.emit('movement', {player:playerid, movement:37});
    }
    function restart(){
        console.log('restart');
        socket.emit('action', {player:playerid, action:82});
    }
    socket.on('disconnect', function () { console.log('disconnected')});
}