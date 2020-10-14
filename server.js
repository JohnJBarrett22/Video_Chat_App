//Imports
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const {v4: uuidV4} = require('uuid')
let messages = {};
let users = {};
let id = 0

//Config
app.set('view engine', 'ejs')
app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/static"));


//Routes
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})
app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId)
        socket.join(roomId)

        socket.to(roomId).broadcast.emit('user-connected', userId)
        
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })

    socket.on('new_user', (data) => {
        users[socket.id] = {name:data.name}
        socket.emit("existing_messages", messages)
        io.emit("display_new_user", {name:data.name})
    })

    socket.on("new_message", (data) => {
        messages[id] = {name:data.name, message:data.message}
        io.emit("update_messages", messages[id])
        id++;
    })
})

server.listen(1337);