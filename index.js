const mongoose = require('mongoose')
const express = require("express")
const http = require('http')
const cors = require("cors")
const { Server } = require("socket.io")
const routes = require("./Routes/Routes.js")
const { get_allSession_non_API } = require("./Controller/groupRequestCurrentDataController.js")
const { OEE_calculating_runtime } = require("././Controller/OEE_Controller/oeeController.js")
const { update_all } = require('./Controller/TickHandleController.js')
const moment = require('moment')
const { currentShift } = require("./WorkingShiftstatus.js")
const { Get_schedule } = require('./Controller/OEE_Controller/oeeController.js')

const enable_runtime=true;

var number_clinet_connect = 0
// import as nonAPI
const app = express()
app.use(cors())
app.use(express.json());
app.use(routes)

const server = http.createServer(app)
// const DB_URI= 'mongodb://%40AUTOSPRAY:%40AUTOSPRAY@10.35.118.139:27017'
// const DB_URI= 'mongodb://%40AUTOSPRAY:%40AUTOSPRAY@10.35.118.139:27017/PTMIHDPMCmonitoringAUTOSPRAY?authSource=admin'
// const DB_URI= 'mongodb://%40AUTOSPRAY:%40AUTOSPRAY@10.35.116.22:27017/PTMIHDPMCmonitoringAUTOSPRAY?authSource=admin'
const DB_URI= "mongodb://%40AUTOSPRAY:%40AUTOSPRAY@dckr00162752.corp.mattel.com:27017/PTMIHDPMCmonitoringAUTOSPRAY?authSource=admin"

const io = new Server(server, {
    cors: {
        origin: '*',
        // origin: ['*', 'http://localhost:3000', 'http://192.168.1.3'],
        methods: ['GET', "POST"],
    }
})

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

// mongoose.connect(`mongodb://${encodeURIComponent('@AUTOSPRAY')}:${encodeURIComponent('@AUTOSPRAY')}@dckr00162752.corp.mattel.com:27017/HDPOEEMonitoring`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
    
// })

const db = mongoose.connection;
// db.collection("HDPOEEMonitoring")
db.on("error", (error) => console.log("Error connect>" + error))

const enable_socket = true

// db.collection.use("enable_runtime")

// console.log('collection list:'+ JSON.stringify(db.collections));
console.log("Connecting to database...")
db.once('open', () => {
    console.log("Database connected...")
    server.listen(8001, () => {
        if (enable_socket) {
            //persiapkan soket
            io.on("connection", (socket) => {
                number_clinet_connect = socket.client.conn.server.clientsCount
                console.log(`${moment().format("D-M-Y hh:mm:ss")} user connected ${socket.id}`);
                socket.on("from_client", (data) => {
                    console.log(data);
                    emitToAll()
                })
                socket.on("disconnect", function () {
                    number_clinet_connect = socket.client.conn.server.clientsCount
                    console.log(`${moment().format("D-M-Y hh:mm:ss")} user Disconnect`);
                })
            })
            if(enable_runtime){
            setInterval(() => {
                OEE_calculating_runtime()
                update_all()
                emitToAll()
            }, 1500);
        }
        }
        console.log('Server run');
    })
})

const emitToAll = async () => {
    // console.log(moment().format("D-M-Y H:mm:ss"));
    io.emit("fromServer", {
        clockShiftInfo: { dateTime: moment().format("D-M-Y H:mm:ss"), Shift: currentShift().shift },
        mainDashboard: await get_allSession_non_API("current"),
        clientConnect: number_clinet_connect.toFixed(0),
        Schedule: await Get_schedule('Prm')
    })
    // console.log(await Get_schedule('Prm'));
}

exports.emitToAll = emitToAll;