let chatUsers = []
let leaderboard = []
let currentVs = []
let currentMoves = ['null', 'null']
let VipMessage = [];
let duelActive = false

const tmi = require('tmi.js')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.set('view engine', 'ejs')

let server = require('http').createServer(app);

const User = require('./models/user.js')
const jsRouter = require('./router.js')

const portNumber = 3000;
const uri = 'mongodb+srv://BukkitDev:HugoleBreton_2023@cluster0.ztak5ab.mongodb.net/?retryWrites=true&w=majority'
const channelName = "BukitHat"

//EXPRESS code
app.use('/more', jsRouter);
app.get('/', (req, res) => {
    res.render('index', { text: 'CUM' });
})
app.get('/leaderboard', (req, res) => {
    res.render('leaderboard', { users: leaderboard });
})
app.get('/RPS', (req, res) => {
    res.render('RPS', { PlayerMoves: currentMoves });
})
app.get('/vip', (req, res) => {
    res.render('vip', { data: VipMessage });
})
server.listen(portNumber, function(req, res){
    console.log("_______________________________");
    console.log("server is running on port " + portNumber);
    console.log("...");
});

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
    chatUsers = []
    let tempArr = await User.find({ bio: "Twitch Chatter" }).sort({
        chatCount: -1
    }).lean();
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

async function refreshLeaderboard() {
    leaderboard = [];
    connect();
    if(chatUsers.length >= 3) {
        for (let i = 0; i < 3; i++) {
            leaderboard.push(chatUsers[i])
        }
    } else {
        for (let i = 0; i < chatUsers.length; i++) {
            leaderboard.push(chatUsers[i])
        }
    }
    //console.log(leaderboard);    
}

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
    const availableMoves = ["!rock","!paper","!scissors"]

    //handle ! commands
    if (tags['display-name'] == VipMessage[0] && !availableMoves.includes(message)) {
        VipMessage.push(message);
        console.log(VipMessage);
    }
    if(message == "!showStats") {
        //console.log("Displaying Statistics for: " + `${tags['display-name']}`);
        fetchUser(tags['display-name']);
    } else if(tags['display-name'] == channelName && message.includes("!beginDuel")) {
        VipMessage.push('BukitHat');
        let tempArr = message.split(".");
        RockPaperScissorsInit(tempArr[1], tempArr[2]);
        client.say(channel, `LETS FIGHT!!` + tempArr[1] + tempArr[2]);

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
            client.say(channel, `@${tags.username}, welcome!`);
        }
    } else {
        createUser(tags['display-name']);
        client.say(channel, `@${tags.username}, welcome!`);
    }

    RockPaperScissors();
    if(!duelActive) {
        refreshLeaderboard();
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

async function RockPaperScissorsInit(user1, user2) {
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

    duelActive = true

}

async function RockPaperScissors() {
    if(duelActive && currentMoves[0] != 'null' && currentMoves[1] != 'null') {

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
            VipMessage = []
            VipMessage.push(currentVs[1].username)
            console.log("player 2 wins!");
            duelActive = false;
            currentVs = [];
        } else if(currentVs[1].chatPower <= 0) {
            VipMessage = []
            VipMessage.push(currentVs[0].username)
            console.log("player 1 wins!");
            duelActive = false;
            currentVs = [];
        }
        currentMoves = []
        for(let i = 0; i < 2; i++) {
            currentMoves.push("null");
        }
        console.log(currentMoves);
    }
}