// const mongoose= require( 'mongoose')
// const exprees = require ("express")
// const http = require("http")
// const cors= require('cors')
// const {Server}= require("socket.io")

import mongoose from "mongoose"
import express from "express"
import http from 'http'
import cors from "cors"
import { Server } from "socket.io"
import routes from "./Routes/Routes.js"
import getGroupdata from "./Controller/groupRequestCurrentDataController.js"
import update_all from './Controller/TickHandleController.js'
import moment from 'moment'
import { log } from "console"
// var moment = require('moment');

const app = express()
// app.use(cors())

//controller magament
// import {getUser} from 'Controller/batchHistoryController.js'


const server = http.createServer(app)



const io = new Server(server, {
    cors: {
        // origin: "http://localhost:8000",
        origin:['*',"http://192.168.1.157:3000"],
        methods: ['GET', "POST"],
    }
})


//connect dulu ke db
mongoose.connect("mongodb://127.0.0.1:27017/MCmonitoring", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on("error", (error) => console.log("Error connect>" + error))

db.once('open', () => {
    console.log("Database connected...")
    app.use(cors())
    app.use(express.json());
    app.use(routes)
    app.listen(8001, () => {
        console.log("Server up running...")
        //  setInterval(() => {
        //      console.log("run tick");
        //      update_all()
        //  }, 2000)
    })

    //lalu start server
    io.on("connection", (socket) => {
        console.log(`user connected ${socket.id}`);
        socket.on("from_client", (data) => {
            console.log(data);
            // blash_data(socket);
            //untuk kirim ke coba broadcast
            socket.broadcast.emit("fromServer", "data.message")
        })
    })

})

async function blash_data(socket) {
    socket.broadcast.emit("from_server_Blash_all_group_session", 'await getGroupdata()')
}

// try {
//     socket.broadcast.emit("from_server_Blash_all_group_session", await getGroupdata())
// } catch (error) {

//     console.log("borad cast error: " + error.message);
// }
// console.log(getGroupdata());
// console.log(await getGroupdata());

// console.log("test time : " + moment().format("Y-M-D H:m:s"));
// if (moment('2022-12-18 20:57:34') <= moment()) console.log('ya ooo');
// else console.log('compare time tidak');

