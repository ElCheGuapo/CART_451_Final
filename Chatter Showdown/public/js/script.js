var socket;

function setup() {
    createCanvas(960, 540);
    background(60);

    socket = io.connect('/', {
        extraHeaders: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    
    socket.on("sendD", (arg, callback) => {
        console.log(arg); // "world"
        callback("got it");
    });
}

function draw() {

    circle(width/2 - 50, height/2 - 50, 100, 100);
}