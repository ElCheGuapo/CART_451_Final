const tmi = require('tmi.js');
let chatUsers = [];

var jsRouter = require('./router.js');
var express = require('express');
var mongoose = require('mongoose');
const User = require('./models/user.js');
var app = express();
let server = require('http').createServer(app);

const portNumber = 3000;
const uri = 'mongodb+srv://BukkitDev:HugoleBreton_2023@cluster0.ztak5ab.mongodb.net/?retryWrites=true&w=majority'

//MONGODB code
async function connect() {
    try {
        await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });
        console.log(" ");
        console.log("MongoDB succesfully connected!");
        console.log("_______________________________");
        console.log(" ");
        initializeLocalArray();
    } catch (error) {
        console.error(error);
    }
}

connect();

async function update(name) {
    var tempUser = await User.find({ username: name }).limit(1);
    newChatCount = tempUser[0].chatCount;
    newChatCount += 1;

    try {
        await User.findOneAndUpdate({
            username: name
        }, {
            chatCount: newChatCount
        }, {
            upsert: false
        })
        //console.log("user updated successfully!")
    } catch (error) {
        console.error(error);
    }
}

async function initializeLocalArray() {
    let tempArr = await User.find({ bio: "Twitch Chatter" }).lean();
    if(tempArr.length > 0) {
        for(let i = 0; i <= tempArr.length-1; i++) {
            let tempSplit = JSON.stringify(tempArr[i])
            let indexOfBeginningOfUsername = tempSplit.indexOf(":",34) + 2;
            let indexOfEndOfUsername = tempSplit.indexOf(",",34) - 1;

            let newString = tempSplit.substring(indexOfBeginningOfUsername, indexOfEndOfUsername);
            chatUsers.push(newString)
        }
    }
}

async function pushUsernameToArray(usr) {
    let tempSplit = JSON.stringify(usr);

    let indexOfBeginningOfUsername = tempSplit.indexOf(":") + 2;
    let indexOfEndOfUsername = tempSplit.indexOf(",") - 1;

    let newString = tempSplit.substring(indexOfBeginningOfUsername, indexOfEndOfUsername);
    chatUsers.push(newString);
}

async function fetchUser(name) {
    var tempUser = await User.find({ username: name }).limit(1);
    console.log("______________________");
    console.log("Username: " + tempUser[0].username);
    console.log(" ");
    console.log("Total Messages Sent: " + tempUser[0].chatCount);
    console.log(" ");
    console.log("About: " + tempUser[0].bio);
    console.log("______________________");
}

//EXPRESS code
app.use(express.static(__dirname + '/public'));
app.use('/', jsRouter);

server.listen(portNumber, function(req, res){
    console.log("_______________________________");
    console.log("server is running on port " + portNumber);
    console.log("...");
});

//TMI.js code
const client = new tmi.Client({
	channels: [ 'bukithat' ]
});

client.connect();
client.on('message', (channel, tags, message, self) => {
	// "Alca: Hello, World!"

    //handle ! commands
    if(message == "!showStats") {
        //console.log("Displaying Statistics for: " + `${tags['display-name']}`);
        fetchUser(tags['display-name']);
    }

    //handle User Creating/Updating
    if(chatUsers.length > 0) {
        for(let i = 0; i >= chatUsers.length-1; i++) {
            if(tags['display-name'] == chatUsers[i]) {
                update(tags['display-name']);
                break;
            } else if(i >= chatUsers.length-1) {            
                createUser(tags['display-name']);
                break;
            }
        }
    } else {
        createUser(tags['display-name']);
    }
});

function createUser(name) {
    //Create
    console.log("______________________");
    console.log("creating new User...");
    const newuser = new User({
        username: name,
        chatCount: 1,
        bio: "Twitch Chatter"
    });

    //Local Save
    console.log(" ");
    console.log("uploading user to local storage...");
    pushUsernameToArray(newuser);
    console.log(" ");
    //Cloud Save
    console.log("uploading user to database...");
    newuser.save()
            .then((result)=> {
                console.log(" ");
                console.log("user uploaded in cloud!")
                console.log("______________________");
                //console.log(result);
            })
            .catch((error) => {
                console.log(error);
            });
}





// if(chatUsers > 0) {
//     var data = {
//         username: chatUsers[0].username,
//         count: chatUsers[0].chatCount
//     }
    
//     socket.emit("sendD", data, (response) => {
//         console.log(response); // "got it"
//     });
// }

// var socket = require('socket.io');
// var io = socket(server);

// io.sockets.on('connection', function() {
//     console.log("New connection " + socket);
// });