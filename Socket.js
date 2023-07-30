import cors from "cors"
import { Server } from "socket.io"
import express from 'express'
import http from 'http'

const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8000',
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log('user connect:' + socket.id);
    socket.on("from_client", (data) => {
        console.log(data);
        console.log('send back');
        socket.broadcast.emit("fromServer", "jefri")
    })
})

server.listen(8001, () => {
    console.log('Server run');
})


