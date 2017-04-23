var socket = io();

socket.on('color', function(data){
    document.body.style.background = data.color; 
});