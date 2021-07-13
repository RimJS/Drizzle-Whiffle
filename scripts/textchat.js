const chatinput = document.getElementById('chat-input')
const chatscontainer = document.getElementById('chats-container')
const openchatbutton = document.getElementById("openchat-button")
document.getElementById('chat-form').addEventListener('submit', function(e){
    e.preventDefault()
    if((chatinput.value).startsWith('#invite')){
        sendinviterequest((chatinput.value).substr(8))
    }
    else{
        sendmessage(chatinput.value)
    }
    chatinput.value = ''
})

socket.on("clientjoined", function(clientdata){
    notify(clientdata.name, ' joined the room')
})

socket.on("clientleft", function(clientdata){
    notify(clientdata.name, ' left the room')
})

socket.on("clientjoined-call", function(clientdata){
    notify(clientdata.name, ' joined the call')
})

socket.on("clientleft-call", function(clientdata){
    notify(clientdata.name, ' left the call')
})

socket.on('text-s2c', function(text){
    addtheirtext(text.text,text.name)
})

let lastsender = ''
var lastchat = document.createElement('div')
var ischatopen = false
var chatopen = false

openchatbutton.onclick = function(){
    if(!chatopen){
        chatopen = true
        openchatbutton.innerHTML = "<i class=\"fas fa-arrow-left\"></i>"
        const textchatdiv = document.getElementById("text-chat")
        const videochatdiv = document.getElementById("video-chat")
        textchatdiv.style.width = "100%"
        textchatdiv.style.opacity = "100%"
        videochatdiv.style.width = "0%"
    }
    else{
        chatopen = false
        openchatbutton.innerHTML = "<i class=\"fas fa-comments\"></i>"
        const textchatdiv = document.getElementById("text-chat")
        const videochatdiv = document.getElementById("video-chat")
        textchatdiv.style.width = "0"
        textchatdiv.style.opacity = "0"
        videochatdiv.style.width = "100%"

    }
}

function addmytext(text){
    const chatblock = document.createElement('div')
    chatblock.className = 'chatblock'
    const newtext = document.createElement('div')
    newtext.innerHTML=text
    newtext.className = "chattext"
    if(lastsender!='me'){
        addtime()
        const chat = document.createElement('div')
        chat.className = 'mychat'
        chat.append(newtext)
        chatblock.append(chat)
        chatscontainer.append(chatblock)
        lastchat = chat
        lastsender = 'me'
    }
    else{
        lastchat.append(newtext);
    }
    scrolltobottom()
}

function addtheirtext(text, sender){
    const chatblock = document.createElement('div')
    chatblock.className = 'chatblock'
    const newtext = document.createElement('div')
    newtext.className = "chattext"
    newtext.innerHTML=text
    if(lastsender!=sender){
        addtime()
        const newsender = document.createElement('div')
        newsender.className = 'sender'
        const chat = document.createElement('div')
        chat.className = 'theirchat'
        newsender.innerHTML=sender;
        chat.append(newsender)
        chat.append(newtext)
        chatblock.append(chat)
        chatscontainer.append(chatblock)
        lastsender = sender
        lastchat = chat
    }else{
        lastchat.append(newtext)
    }
    scrolltobottom()
}

function sendmessage(text){
    socket.emit('text-c2s', {text: text, name: myname})
    addmytext(text)
}

function notify(name, action){
    lastsender = ''
    addtime()
    const notifier = document.createElement('div')
    notifier.className = 'intext-notifier'
    notifier.innerHTML = `<b>${name}</b> ${action}`
    chatscontainer.append(notifier)
    scrolltobottom()
}

function addtime(){
    const time = document.createElement('div')
    time.className = 'intext-time'
    const date = new Date()
    const h = date.getHours()
    const m = date.getMinutes()
    time.innerHTML = `${h}:${m}`
    chatscontainer.append(time)
}

function scrolltobottom(){
    chatscontainer.scrollTop = chatscontainer.scrollHeight
}

fetch('/roominfo').then(res=>{
    return res.json()
}).then(res=>{
    console.log(res)
    var roomlist = ''
    for(username in res.users){
        clientsinroom[username] = res.users[username]
        if(roomlist=='' && username!=myusername){
            roomlist = `<b>${clientsinroom[username]}</b>`
        }
        else{
            if(username!=myusername){
                roomlist = `${roomlist}, <b>${clientsinroom[username]}</b>`
            }
        }
    }
    var calllist = ''
    for(username in res.usersincall){
        if(calllist=='' && username!=myusername){
            calllist = `<b>${clientsinroom[username]}</b>`
        }
        else{
                calllist = `${calllist}, <b>${clientsinroom[username]}</b>`
        }
    }
    if(res.nos==1){
        notify('Only you are in this room', '')
    }
    else{
        notify('Room occupants: ', roomlist)
    }
    if(res.nosincall==0){
        notify('No one is in the call', '')
    }
    else{
        notify('Call occupants: ', calllist)
    }
}).catch(err=>{
    console.log("Server not responding")
})

function copyroom(){
    navigator.clipboard.writeText(room)
}

function sendinviterequest(username){
    socket.emit('inviterequest',{room : room,  name: myname, username : myusername, invitee:username})
    socket.once('inviteresponse-server', response => {notify(username, response)})
}