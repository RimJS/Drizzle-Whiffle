const express = require('express')
const app = express()
//const fs = require('fs');
// const options = {
//     key: fs.readFileSync(__dirname+'\\localhost-key.pem'),
//     cert: fs.readFileSync(__dirname+'\\localhost.pem')
// };
const server = require('http').createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const { v4: uuidv4 } = require('uuid')
const multer = require('multer');
const upload = multer();
const bcrypt = require('bcrypt')
const session = require('express-session')
const bodyparser = require('body-parser')
const webpush = require('web-push');
const { getMaxListeners } = require('process')
const webpushkeys = {
    public: 'BKZ9fgsXkZTpcPn1yGwhZPZpwJQv64s5mbVwUcL647git4wlYClkzlN_D7aba8anMwfS4FKwZ1hPGK_i30VUPSQ',
    private: 'QH7SGz2fuvm5YCdJSVRQr0nipXh46NS6kXkFfC4jhEA'
};
//Statuses are online, inroom, incall and offline
var users = {
    a: {
    name: 'John',
    hashedpassword: '$2b$10$u6riWXoC8adVxf1d9G0dJeJ6hvRvH.6y5mVd036fvyHZEqybXxi1K',
    status: 'offline'
  },
  q: {
    name: 'Sashaa',
    hashedpassword: '$2b$10$LfQBWAx9NV1.QmLdm59o/OvPNqC9CX4ez9IxpqfaePkcUU0IOr2Zm',
    status: 'offline'
  }
}
var rooms = {}

webpush.setVapidDetails(
    'mailto:shuklarimjhim7@gmail.com', webpushkeys.public, webpushkeys.private
)

app.use(session({
    secret : "olaaaaa",
    secure: false,
    saveUninitialized : false,
    resave: false
}))
app.use(express.static('scripts'))
app.use(express.static('style'))
app.use(express.urlencoded({ extended: false }))
app.use(upload.none())
app.use(bodyparser.json())
app.set('view engine', 'ejs')


app.get('/test', (req,res)=>{
    webpush.sendNotification(users['a'].subscription, "heeello")
    res.send("sent notif")
})
app.get('/', function(req, res){
    res.redirect('/login')
})
app.get('/login', (req,res)=>{
    res.render('login')
})
app.get('/register', (req,res)=>{
    res.render('register')
})
app.get('/room', (req,res)=>{
    res.redirect(`/room/${uuidv4()}`)
})
app.get('/home', (req,res)=>{
    if(req.session.isloggedin == true){
        res.render('home',{name: users[req.session.username].name, username: req.session.username, issubscribed: "subscription" in users[req.session.username] })
    }
    else{
        res.redirect('/login')
    }
})
app.post('/newsubscription', (req,res)=>{
    users[req.session.username].subscription = req.body
    console.log(users)
    res.send("subscription recieved")
})
app.post('/register', async (req,res)=>{
    console.log(req.body.username+" trying to register")
    if(req.body.name == '' || req.body.username == '' || req.body.password == ''){
        res.json({isregistered : "false", status : "All fields required"})
    }
    else if((req.body.username in users)){
        res.json({isregistered : "false", status : "Username already exists"})
    }
    else{
        const hashedpassword = await bcrypt.hash(req.body.password, 10)
        users[req.body.username] = {name:req.body.name, hashedpassword:hashedpassword, status:'offline'}
        res.json({isregistered : "true", status : "Registered successfully, being redirected to login"})
        console.log(users)
    }   
})
app.post('/login', async (req, res)=>{
    console.log(req.body.username + " trying to login")
    if(req.body.username == '' || req.body.password == ''){
        res.json({isloggedin : "false", status : "Both fields required"})
    }
    else{
        if(!(req.body.username in users)){
            res.json({isloggedin : "false", status : "Username does not exist"})
        }
        else{
            if(users[req.body.username].status=="inroom" || users[req.body.username].status=="incall"){ //interim fix, make user go offline if user leaves home page, rn big security issue
                res.json({isloggedin : "false", status : "Already logged in elsewhere"})
            }
            else{
                const result = await bcrypt.compare(req.body.password, users[req.body.username].hashedpassword)
                if(!result){
                    res.json({isloggedin : "false", status : "Wrong password"})
                }
                else{
                    req.session.isloggedin = true
                    req.session.username = req.body.username
                    users[req.body.username].status = "online"
                    res.json({isloggedin: "true", status: "Logged in successfully"})
                }
            }
        }
    }

})
app.get('/roominfo', (req, res)=>{
    res.json(rooms[req.session.room])
})
app.post('/joinroom', (req,res)=>{
    res.redirect(`/room/${req.body.room}`)
})

app.get('/room/:room', function(req, res){
    if(req.session.isloggedin){
        console.log(req.session.username+" is joining room "+req.params.room)
        req.session.room = req.params.room
        if(rooms[req.params.room] == undefined){
            rooms[req.params.room]={users:{}, usersincall:{}}
            rooms[req.params.room].nos = 0
            rooms[req.params.room].nosincall = 0
        }
        rooms[req.params.room].nos++
        rooms[req.params.room].users[req.session.username] =users[req.session.username].name
        users[req.session.username].status = "inroom"
        users[req.session.username].room = req.params.room
        res.render('app', {key : req.params.room, name:users[req.session.username].name, username:req.session.username})
    }
    else{
        res.redirect('/login')
    }
})

io.on('connection', function(socket){
    socket.on('joinrequest', function(clientdata){
        socket.join(clientdata.room)
        socket.broadcast.to(clientdata.room).emit('clientjoined', clientdata)
        socket.on("joinrequest-call", function(){
            console.log(clientdata.name+" joining call")
            socket.broadcast.to(clientdata.room).emit('clientjoined-call', clientdata)
            rooms[clientdata.room].nosincall++
            rooms[clientdata.room].usersincall[clientdata.username] =users[clientdata.username].name
            users[clientdata.username].status = "incall"
        })
        socket.on("leaverequest-call", function(clientdata){
            socket.broadcast.to(clientdata.room).emit('clientleft-call', clientdata)
            rooms[clientdata.room].nosincall--
            delete rooms[clientdata.room].usersincall[clientdata.username]
            users[clientdata.username].status = "inroom"
        })
        socket.on("endingscreenshare", function(clientdata){
            socket.broadcast.to(clientdata.room).emit('clientleft-screenshare', clientdata)
        })
        socket.on('disconnect', function(reason){
            users[clientdata.username].status = "offline"
            console.log(clientdata.name + " disconnected due to "+reason)
            socket.broadcast.to(clientdata.room).emit('clientleft', clientdata)
            delete users[clientdata.username].room
            if(rooms[clientdata.room]!=undefined){ //check
                rooms[clientdata.room].nos--
            }
            console.log(rooms)
            delete rooms[clientdata.room].users[clientdata.username] //uncomment after locking multiple logins
            if(users[clientdata.username].status=="incall"){
                rooms[clientdata.room].nosincall--
                delete rooms[clientdata.room].usersincall[clientdata.username]
            }
            try{
                if(rooms[clientdata.room].nos == 0){ //dry run and check
                    delete rooms[clientdata.room]
                }
            }
            catch(err){
                console.log("fix this erooorrrr")
            }
        })
        socket.on('text-c2s', function(text){
            socket.broadcast.to(clientdata.room).emit('text-s2c', text)
        })
        socket.on('inviterequest', function(clientdata){
            if(clientdata.invitee in rooms[clientdata.room].users){
                socket.emit('inviteresponse-server', "is already here")
            }
            else if(users[clientdata.invitee]){
                if('subscription' in users[clientdata.invitee]){
                    invite(clientdata.name, clientdata.room, clientdata.invitee)
                    socket.emit('inviteresponse-server', 'has been invited')
                }
                else{
                    socket.emit('inviteresponse-server', "is not subscribed to invitations")
                }
            }
            else{
                socket.emit('inviteresponse-server', "does not exist")
            }
        })
    })
})


function invite(inviter, room, invitee){
    const secret = uuidv4()
    webpush.sendNotification(users[invitee].subscription, JSON.stringify({inviter:inviter, secret:secret, room:room}))
    app.get(`/${secret}/${room}`, (req,res)=>{
        req.session.isloggedin = true
        req.session.username = invitee
        res.redirect(`/room/${room}`)
    })
}

server.listen(process.env.PORT || 80)