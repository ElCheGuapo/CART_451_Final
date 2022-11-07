const tmi = require('tmi.js');
const user = require('./user.js');
let chatUsers = [];

var jsRouter = require('./router.js');
var express = require('express');
var app = express();
let server = require('http').createServer(app);

const portNumber = 3000;

const client = new tmi.Client({
	channels: [ 'bukithat' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	// "Alca: Hello, World!"

    if(message == "!showStats") {
        console.log("Displaying Statistics for: " + `${tags['display-name']}`);
    } else {
        console.log(`${tags['display-name']}: ${message}`);
    }
	
    if(chatUsers.length > 0) {
        for(let i = 0; i <= chatUsers.length; i++) {
            if(tags['display-name'] == chatUsers[i].username) {
                chatUsers[i].chatCount ++;
                console.log(chatUsers[i].chatCount);
                break;
            } else if(i == chatUsers.length) {
                let newChatter = new user(tags['display-name'], 0, "temp");
                chatUsers.push(newChatter);
                console.log("new user created");
            }
        }
    } else {
        let newChatter = new user(tags['display-name'], 0, "temp");
        chatUsers.push(newChatter);
        console.log("Creating new new user...");
        console.log("Adding user to database...")
        console.log(newChatter);
    }
});

app.use(express.static(__dirname + '/public'));
app.use('/', jsRouter);

server.listen(portNumber, function(req, res){
    console.log("server is running on port " + portNumber);
});

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', function() {
    console.log("New connection " + socket);
});

if(chatUsers > 0) {
    var data = {
        username: chatUsers[0].username,
        count: chatUsers[0].chatCount
    }
    
    socket.emit("sendD", data, (response) => {
        console.log(response); // "got it"
    });
}
