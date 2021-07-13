const socket = io('/')

const myvideo = document.getElementById("my-video")
const videogrid = document.getElementById("grid-of-videos")
const fullscreen = document.getElementById("fullscreen")
const joincallbutton = document.getElementById("joincall-button")
const screensharebutton = document.getElementById("screenshare-button")
const mutebutton = document.getElementById("mute-button")
const camerabutton = document.getElementById("camera-button")
const exitfullscreenbutton = document.getElementById('exit-fullscreen-button')
var clientsincall = {} //peerid : name //includes screenshares
var clientsinroom = {} //username : name
var idatfullscreen = '' //Id of video at fullscreen
var nosincall = 1 //Calculated locally, not linked to server, includes screenshares
var incall = false
var sharingscreen = false
var ismuted = false
var iscameraon = true
var peer = new Peer(undefined,{
    secure: true
})

peer.on('open', function(id){
    socket.emit('joinrequest', {room : room, id : id, name: myname, username : myusername})
})


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(function(mystream) {
    myvideo.srcObject = mystream
    myvideo.play()
    mutebutton.onclick = function(){
        mutehandler(mystream)
    }
    camerabutton.onclick = function(){
        camerahandler(mystream)
    }
    joincallbutton.onclick = function(){
        if(incall == false){
            notify("You", "joined the call")
            joincallbutton.innerHTML="<i class=\"fas fa-phone-slash\"></i>"
            joincallbutton.style.backgroundColor="rgb(255, 79, 79)"
            incall = true
            socket.emit("joinrequest-call")
            socket.on('clientjoined-call', function (clientdata){//making call
                console.log(clientdata.name + ' has joined')
                clientsincall[clientdata.id] = clientdata.name
                var call = peer.call(clientdata.id, mystream, {metadata: {name:myname, type:'camera'}})
                //console.log("call made to "+ newclientdata.id)
                const videoelement = adduservid(clientdata.name, clientdata.id) //this element may be removed when desired by videoelement.remove()
                nosincall++
                call.on('stream', function(theirstream){
                    //console.log("getting stream")
                    assignuservid(videoelement, theirstream)           
                    arrangevideos()
                })
            })
            
            peer.on('call', function (call){//recieving call
                console.log("being called by " + call.metadata.name)
                clientsincall[call.peer] = call.metadata.name
                call.answer(mystream)
                var videoelement = null
                if(call.metadata.type == 'camera'){
                    videoelement = adduservid(call.metadata.name, call.peer)
                }else{
                    videoelement = adduservid(call.metadata.name+'\'s screen', call.peer+'screen')
                    notify(call.metadata.name, 'started sharing their screen')
                }
                nosincall++
                call.on('stream', function(theirstream){
                    assignuservid(videoelement, theirstream)
                    arrangevideos()
                })
            })
        }
        else{
            notify("You", "left the call")
            joincallbutton.innerHTML="<i class=\"fas fa-phone\"></i>"
            joincallbutton.style.backgroundColor="#216383"
            incall = false
            socket.emit('leaverequest-call', {room : room, id : peer.id, name: myname, username : myusername})
            socket.removeAllListeners('clientjoined-call')
            if(sharingscreen){
                stopscreenshare()
            }
            peer.removeAllListeners('call')
            for(let id in clientsincall){
                document.getElementById(id).remove()
                if(document.getElementById(id+'screen')!=null){
                    document.getElementById(id+'screen').remove()
                }
                peer.connections[id].forEach(connection => {
                    connection.peerConnection.close()
                });
                peer.connections[id].forEach(connection => {
                    connection.close()
                });
            }
            nosincall = 1
            arrangevideos()
            clientsincall = {}
        }
    }
    
}).catch(function(){
    alert("Please provide access to the camera and microphone, you may turn off your audio/video before entering the call")
    location.reload()
})

socket.on('clientjoined', function(clientdata){
    clientsinroom[clientdata.username] = clientdata.name
})

socket.on('clientleft', function(clientdata){
    //console.log(clientdata.name + " disconnected")
    if(clientdata.id in clientsincall && incall){
        leavecallhandler(clientdata)
    }
    delete clientsinroom[clientdata.username]
})

socket.on('clientleft-call', function(clientdata){
    if(incall){
        leavecallhandler(clientdata)
    }
})



socket.on("clientleft-screenshare", function(clientdata){
    if(incall){
        nosincall--
        if(peer.connections[clientdata.id][1]!=null){
            peer.connections[clientdata.id][1].peerConnection.close()
            peer.connections[clientdata.id][1].close()
        }
        else{
            peer.connections[clientdata.id][0].peerConnection.close()
            peer.connections[clientdata.id][0].close()
        }
        notify(clientdata.name, "has stopped sharing their screen")
        document.getElementById(clientdata.id+'screen').remove()
        if (clientdata.id == idatfullscreen){
            exitfullscreen()
        }
        arrangevideos()
    }
})


screensharebutton.onclick = function(){
    if(!sharingscreen && incall){
        screenshare()
        notify('you', 'have started sharing your screen')
    }
    else if(!sharingscreen && !incall){
        alert("Please join the call to share screen")
    }
    else if(sharingscreen && incall){
        stopscreenshare()
        socket.emit("endingscreenshare", {room : room, id : peer.id, name: myname, username : myusername})
        notify('you', 'have stopped sharing your screen')
    }
    else if(sharingscreen && !incall){

    }
}

function leavecallhandler(clientdata){ //someone else leaving the call
    delete clientsincall[clientdata.id]
    nosincall--
    peer.connections[clientdata.id].forEach(connection => {
        connection.peerConnection.close()
    });
    peer.connections[clientdata.id].forEach(connection => {
        connection.close()
    });
    document.getElementById(clientdata.id).remove()
    if(document.getElementById(clientdata.id+'screen')){
        document.getElementById(clientdata.id+'screen').remove()
        nosincall--
    }
    if (clientdata.id == idatfullscreen){
        exitfullscreen()
    }
    arrangevideos()
}
var hereisastream = null
function screenshare(){
    navigator.mediaDevices.getDisplayMedia().then(function(myscreenstream){
        hereisastream = myscreenstream
        sharingscreen=true
        screensharebutton.innerHTML = "Stop sharing"
        screensharebutton.style.backgroundColor="rgb(255, 79, 79)"
        for(let id in clientsincall){
            makescreensharecall({id:id})
        }
        socket.on('clientjoined-call', makescreensharecall)
        screensharebutton.addEventListener('click', function(){
            const tracks = myscreenstream.getTracks()
            tracks.forEach(track=> track.stop())
        }, {once: true})

    }).catch(err=>{
        console.log(err)
        alert("Please select the screen you want to share")
    })
}

function makescreensharecall(clientdata){
    const call = peer.call(clientdata.id, hereisastream, {metadata: {name:myname, type:'screen'}})
    screensharebutton.addEventListener('click', function(){
        call.close()
    }, {once: true})
}

function stopscreenshare(){
    sharingscreen=false
    console.log("turning off socket")
    socket.off('clientjoined-call', makescreensharecall)
    screensharebutton.innerHTML = "Share screen"
    screensharebutton.style.backgroundColor="#216383"
    // for(let id in clientsincall){
    //     peer.connections[id][1].peerConnection.close()
    //     peer.connections[id][1].close()
    // }
}


function assignuservid(element, stream){
    element.srcObject = stream
    element.play()
    element.onclick = function(){
        startfullscreen(element.parentNode.id, stream)
    }
}

function adduservid(name, id){ 
    const newvideodiv = document.createElement("div")
    newvideodiv.className = "video-container"
    newvideodiv.id = id
    const newnamediv = document.createElement('div')
    newnamediv.innerHTML = name
    newnamediv.className = 'name'
    const newvideo = document.createElement("video")
    newvideodiv.append(newvideo)
    newvideodiv.append(newnamediv)
    videogrid.append(newvideodiv)
    return newvideo
}

function startfullscreen(id, stream){
    idatfullscreen = id
    fullscreen.className = "fullscreen-open"
    const fullscreenvideo = document.createElement('video')
    fullscreenvideo.srcObject = stream;
    fullscreenvideo.play()
    const namediv = document.createElement('div')
    namediv.innerHTML = clientsincall[id]
    namediv.className = 'name'
    fullscreen.append(fullscreenvideo, namediv)
}
function exitfullscreen(){
    fullscreen.innerHTML = `<button id="exit-fullscreen-button" class="control-button" onclick="exitfullscreen()"><i class="fas fa-times" ></i></button>`
    fullscreen.className = ''
    idatfullscreen = ''
}

function stopcapturingscreen(stream){
    const tracks = stream.getTracks()
    tracks[0].stop()
    screensharebutton.removeEventListener('click', this)
}

function mutehandler(stream){
    if(ismuted){
        mutebutton.style.backgroundColor = "#216383"
        mutebutton.innerHTML = "<i class=\"fas fa-microphone\"></i>"
        stream.getAudioTracks()[0].enabled = true;
        ismuted = false
    }
    else{
        mutebutton.style.backgroundColor = "rgb(255, 79, 79)"
        mutebutton.innerHTML = "<i class=\"fas fa-microphone-slash\"></i>"
        stream.getAudioTracks()[0].enabled = false;
        ismuted = true
    }
}
function camerahandler(stream){
    if(!iscameraon){
        camerabutton.style.backgroundColor = "#216383"
        camerabutton.innerHTML = "<i class=\"fas fa-video\"></i>"
        stream.getVideoTracks()[0].enabled = true;
        iscameraon = true
    }
    else{
        camerabutton.style.backgroundColor = "rgb(255, 79, 79)"
        camerabutton.innerHTML = "<i class=\"fas fa-video-slash\"></i>"
        stream.getVideoTracks()[0].enabled = false;
        iscameraon = false
    }
}

function arrangevideos(){
    if(nosincall==1){
        videogrid.style.gridTemplateColumns = "repeat(1, 1fr)"
        videogrid.style.width = "75%"
    }
    else if(nosincall==2){
        videogrid.style.gridTemplateColumns = "repeat(2, 1fr)"
        videogrid.style.width = "90%"
    }
    else if(nosincall>=3 && nosincall<=4){
        videogrid.style.gridTemplateColumns = "repeat(2, 1fr)"
        videogrid.style.width = "75%"
    }
    else if(nosincall>=5 && nosincall<=6){
        videogrid.style.gridTemplateColumns = "repeat(3, 1fr)"
        videogrid.style.width = "90%"
    }
    else if(nosincall>=7 && nosincall<=9){
        videogrid.style.gridTemplateColumns = "repeat(3, 1fr)"
        videogrid.style.width = "75%"
    }
}

