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
        console.log("MongoDB succesfully connected");
        initializeLocalArray();
    } catch (error) {
        console.error(error);
    }
    try {
        //await User.deleteOne({ username: 'BukitHat' });
        console.log("reset...")
    } catch (error) {
        console.error(error);
    }
}
connect();

async function update(name) {
    var tempUser = await User.find({ username: name }).limit(1);
    newChatCount = tempUser[0].chatCount + 1;

    try {
        await User.findOneAndUpdate({
            username: name
        }, {
            chatCount: newChatCount
        }, {
            upsert: false
        })
        console.log("user updated successfully!")
    } catch (error) {
        console.error(error);
    }
}

async function initializeLocalArray() {
    tempArr = await User.find({ bio: "Twitch Chatter" }).lean();
    if(tempArr.length > 0) {
        for(let i = 0; i <= tempArr.length-1; i++) {
            tempSplit = JSON.stringify(tempArr[i])
            console.log(tempSplit);
            console.log(tempSplit.indexOf(":",34));
            console.log(tempSplit.indexOf(",",34));
            indexOfBeginningOfUsername = tempSplit.indexOf(":",34) + 2;
            indexOfEndOfUsername = tempSplit.indexOf(",",34);

            newString = tempSplit.index[indexOfBeginningOfUsername, indexOfEndOfUsername];
        }
    }
}

//EXPRESS code
app.use(express.static(__dirname + '/public'));
app.use('/', jsRouter);

server.listen(portNumber, function(req, res){
    console.log("server is running on port " + portNumber);
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
        console.log("Displaying Statistics for: " + `${tags['display-name']}`);
    } else {
        console.log(`${tags['display-name']}: ${message}`);
    }

    //handle User Creating/Updating
    if(chatUsers.length > 0) {
        for(let i = 0; i <= chatUsers.length; i++) {

            if(tags['display-name'] == chatUsers[i].username) {
                update(tags['display-name'])
                break;

            } else if(i == chatUsers.length) {
                createUser(tags['display-name']);
            }
        }
    } else {
        createUser(tags['display-name']);
    }
});

function createUser(name) {
    //Create
    console.log("creating new User...");
    const user = new User({
        username: name,
        chatCount: 0,
        bio: "Twitch Chatter"
    });

    //Local Save
    console.log("uploading user to local storage...");
    chatUsers.push(user);

    //Cloud Save
    console.log("uploading user to database...");
    user.save()
            .then((result)=> {
                console.log("user has been successfully saved and uploaded to database!")
                console.log(result);
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