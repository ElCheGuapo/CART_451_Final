const tmi = require('tmi.js');
let chatUsers = [];
let leaderboard = [];
let currentVs = [];
const availableMoves = ["!rock","!paper","!scissors"];
let currentMoves = [];
let duelActive = false;

var jsRouter = require('./router.js');
var express = require('express');
var mongoose = require('mongoose');
const User = require('./models/user.js');
var app = express();
let server = require('http').createServer(app);

const portNumber = 3000;
const uri = 'mongodb+srv://BukkitDev:HugoleBreton_2023@cluster0.ztak5ab.mongodb.net/?retryWrites=true&w=majority'
const channelName = "BukitHat"
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
    options: { debug: true },
	identity: {
		username: 'RoshanBot',
		password: 'oauth:8t0cuokz0dtdb3n172kbl2abx0fkm6'
	},
	channels: [ channelName ]
});

client.connect();
client.on('message', (channel, tags, message, self) => {
    //handle ! commands
    if(message == "!showStats") {
        //console.log("Displaying Statistics for: " + `${tags['display-name']}`);
        fetchUser(tags['display-name']);
    } else if(tags['display-name'] == channelName && message.includes("!beginDuel")) {
        let tempArr = message.split(".");
        duelActive = true
        RockPaperScissorsInit(tempArr[1], tempArr[2]);
        // if (chatUsers.includes(tempArr[1]) && chatUsers.includes(tempArr[2])) {
        //     console.log("this works");
        // }

    } else if (duelActive) {
        if(currentVs[0].username == (tags['display-name'])) {
            if(availableMoves.includes(message)) {
                currentMoves[0] = message;
                client.say(channel, `@${tags.username}, has selected their move`);
            }
            
        } else if(currentVs[1].username == (tags['display-name'])) {
            if(availableMoves.includes(message)) {
                currentMoves[1] = message;
                client.say(channel, `@${tags.username}, has selected their move`);
            }
        }
    }


    //handle User Creating/Updating
    if(chatUsers.length > 0) {
        if(chatUsers.includes(tags['display-name'])) {
            update(tags['display-name']);
        } else {
            createUser(tags['display-name']);
        }
    } else {
        createUser(tags['display-name']);
    }

    RockPaperScissors();
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

async function RockPaperScissorsInit(user1, user2) {
    if(duelActive){
        
        let tempUser1 = await User.find({ username: user1 }).lean();
        let tempUser2 = await User.find({ username: user2 }).lean();
        Player_1 = {
            username: tempUser1[0].username,
            chatPower: tempUser1[0].chatCount
        }
        Player_2 = {
            username: tempUser2[0].username,
            chatPower: tempUser2[0].chatCount
        }

        currentVs.push(Player_1);
        currentVs.push(Player_2);

    }

}

async function RockPaperScissors() {
    if(duelActive && currentMoves.length == 2) {

        //check who wins round
        if(currentMoves[0] == "!rock" && currentMoves[1] == "!rock") {
            console.log("tie");

        } else if(currentMoves[0] == "!rock" && currentMoves[1] == "!paper") {
            console.log("player 2 wins");
            currentVs[0].chatPower -= currentVs[1].chatPower

        } else if(currentMoves[0] == "!rock" && currentMoves[1] == "!scissors") {
            console.log("player 1 wins");
            currentVs[1].chatPower -= currentVs[0].chatPower

        } else if(currentMoves[0] == "!scissors" && currentMoves[1] == "!paper") {
            console.log("player 1 wins");
            currentVs[1].chatPower -= currentVs[0].chatPower

        } else if(currentMoves[0] == "!scissors" && currentMoves[1] == "!rock") {
            console.log("player 2 wins");
            currentVs[0].chatPower -= currentVs[1].chatPower

        } else if(currentMoves[0] == "!scissors" && currentMoves[1] == "!scissors") {
            console.log("tie");
        } else if(currentMoves[0] == "!paper" && currentMoves[1] == "!rock") {
            console.log("player 1 wins");
            currentVs[1].chatPower -= currentVs[0].chatPower

        } else if(currentMoves[0] == "!paper" && currentMoves[1] == "!scissors") {
            console.log("player 2 wins");
            currentVs[0].chatPower -= currentVs[1].chatPower

        } else if(currentMoves[0] == "!paper" && currentMoves[1] == "!paper") {
            console.log("tie");
        }

        //check for win
        if(currentVs[0].chatPower <= 0) {
            console.log("player 2 wins!");
            duelActive = false;
            currentVs = [];
        } else if(currentVs[1].chatPower <= 0) {
            console.log("player 1 wins!");
            duelActive = false;
            currentVs = [];
        }
        currentMoves = [];
    }
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