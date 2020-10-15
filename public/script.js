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

myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

socket.on('user-disconnected', (userId, data) => {
    if (peers[userId]) {
        peers[userId].close()
        console.log(data);
        let para = document.createElement("P");
        para.innerText = data.name+" has left the chat.";
        para.classList.add("red");
        document.getElementById("chatbox").append(para);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
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
    console.log("Triggered")
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video);
}


//Chat Box Features
socket.on("display_new_user", data => {
    let para = document.createElement("P");
    para.innerText = data.name+" has joined the chat.";
    para.classList.add("green");
    document.getElementById("chatbox").append(para);
})

socket.on("existing_messages", data => {
    for(i in data){
        let para = document.createElement("P");
        para.innerText = data[i].name+": "+data[i].message;
        document.getElementById("chatbox").append(para);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
})

socket.on("update_messages", data => {
    let para = document.createElement("P")
    para.innerText = data.name+": "+data.message;
    document.getElementById("chatbox").append(para);
    chatbox.scrollTop = chatbox.scrollHeight;
});

// socket.on("user-disconnected", data => {
//     console.log(data);
//     let para = document.createElement("P");
//     para.innerText = data.name+" has left the chat.";
//     para.classList.add("red");
//     document.getElementById("chatbox").append(para);
//     chatbox.scrollTop = chatbox.scrollHeight;
// })
    
function newMsgSent() {
    msg = document.getElementById("msg").value;
    socket.emit("new_message", {name:name, message:msg});
    document.getElementById("msg").value = "";
}