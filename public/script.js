const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: "2000"
})
const myVideo = document.createElement('video')
myVideo.muted = true
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    socket.on('user-connected')
})


myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})


socket.on('user-connected', userId => {
    console.log('User connected: ' + userId)
})

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}