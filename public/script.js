const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: "2000"
})
const myVideo = document.createElement('video')
const peers = {}
const chatbox = document.getElementById("chatbox")
let name = prompt("Please enter your name:","Name")
let msg = ""


//Video Features
myVideo.muted = true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    socket.emit("new_user", {name:name})
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()  
})

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}


//Chat Box Features
socket.on("display_new_user", data => {
    document.getElementById("chatbox").append("<p> style='color:green'>"+data.name+" has joined the chat"+"</p>")
})

socket.on("existing_messages", data => {
    for(i in data){
        document.getElementById("chatbox").append("<p>"+data[i].name+": "+data[i].message+"</p>")
        chatbox.scrollTop = chatbox.scrollHeight;
    }
})

socket.on("update_messages", data => {
    document.getElementById("chatbox").append("<p>"+data.name+": "+data.message+"</p>")
    chatbox.scrollTop = chatbox.scrollHeight;
})
    

function newMsgSent() {
    msg = document.getElementById("msg").value
    socket.emit("new_message", {name:name, message:msg})
    document.getElementById("msg").value = "";
}