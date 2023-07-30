const batchhistories = require("../Models/BatchHistoryModel.js")
const machine_lists = require("../Models/machineListmodel.js")
const machine_histories = require("../Models/historyModel.js")
const moment = require("moment")
const { currentShift } = require("../WorkingShiftstatus.js")

// import batchhistories from "../Models/BatchHistoryModel.js"
// import machine_lists from "../Models/machineListmodel.js"
// import machine_histories from "../Models/historyModel.js"
// import moment from "moment"
// import { currentShift } from "../WorkingShiftstatus.js"

async function getGroupdata() {
    return (await BatchHistory.find())
}



exports.getGroupCurrentSession = async (req, res) => {
    let shiftSekarang = currentShift()
    // console.log("Group: " + req.params.original_name);
    // const data_MC = await batchhistories.find({ original_name: req.params.original_name })
    // res.status(200).json(data_MC);
    // return

    //ambil semua data semu mesin
    //cek dulu coldForging ada apa ngga
    const MCList = await machine_lists.find({ group: req.params.group })
    //console.log("gr:" + JSON.stringify(req.params));
    if (JSON.stringify(MCList) != '[]') {
        //jika ada maka buatkan array tiap mc dan looping
        var Array_batch_top_tiap_mesin = []
        try {
            var TMp
            TMp = await batchhistories.find({
                id_identification: MCList[0].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[1].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[2].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[3].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[4].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[5].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[6].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[7].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[8].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[9].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])
            TMp = await batchhistories.find({
                id_identification: MCList[10].id_identification,
                batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) }
            }).sort({ '_id': -1 }).limit(1)
            Array_batch_top_tiap_mesin.push(TMp[0])

        } catch (error) {
            res.status(200).json(Array_batch_top_tiap_mesin)
            // console.log("end:" + error.message);
        }

    } else {
        res.status(404).json({ message: "Group not found!" })
    }


}


exports.get_allSession = async (req, res) => {
    let shiftSekarang = currentShift()
    let loop_arr = []
    const machine = await machine_lists.find()
    if (req.params.option == 'latest') {
        for (let index = 0; index < machine.length; index++) {
            const find_cloter_history = await batchhistories.findOne({ id_identification: machine[index].id_identification }).sort({ _id: -1 })
            if (find_cloter_history == null) {
                loop_arr.push({
                    data: {
                        status: "Not operate",
                        total_run: 0,
                        total_stop: 0,
                        total_alarm: 0
                    },
                    id_identification: machine[index].id_identification,
                    original_name: machine[index].original_name,
                    batch_start: "",
                    batch_end: "",
                })
                // console.log("index:" + index +"  id:"+ machine[index].id_identification);
            } else loop_arr.push(find_cloter_history)
        }
    } else {
        //exact today
        for (let index = 0; index < machine.length; index++) {
            const find_cloter_history = await batchhistories.findOne({ id_identification: machine[index].id_identification, batch_start: { $gte: shiftSekarang.start, $lte: shiftSekarang.end } }).sort({ _id: -1 })
            if (find_cloter_history == null) {
                loop_arr.push({
                    data: {
                        status: "Not operate",
                        total_run: 0,
                        total_stop: 0,
                        total_alarm: 0
                    },
                    id_identification: machine[index].id_identification,
                    original_name: machine[index].original_name,
                    batch_start: "",
                    batch_end: "",
                })
                //  console.log("index:" + index +"  id:"+ machine[index].id_identification);
            } else loop_arr.push(find_cloter_history)
        }
        //  res.status(200).json(loop_arr)
        // res.status(200).json({message:'current'})
    }
    res.status(200).json(loop_arr)
    return (loop_arr)
}

exports.get_allSession_non_API = async (prm) => {
    let shiftSekarang = currentShift()
    let loop_arr = []
    const machine = await machine_lists.find()
    if (prm == 'latest') {
        for (let index = 0; index < machine.length; index++) {
            const find_cloter_history = await batchhistories.findOne({ id_identification: machine[index].id_identification }).sort({ _id: -1 })
            if (find_cloter_history == null) {
                loop_arr.push({
                    data: {
                        status: "Not running",
                        total_run: 0,
                        total_stop: 0,
                        total_alarm: 0
                    },
                    id_identification: machine[index].id_identification,
                    original_name: machine[index].original_name,
                    batch_start: "",
                    batch_end: "",
                })
                // console.log("index:" + index +"  id:"+ machine[index].id_identification);
            } else loop_arr.push(find_cloter_history)
        }
    } else {
        //exact today
        for (let index = 0; index < machine.length; index++) {
            const find_cloter_history = await batchhistories.findOne({ id_identification: machine[index].id_identification, batch_start: { $gte: shiftSekarang.start, $lte: shiftSekarang.end } }).sort({ _id: -1 })
            if (find_cloter_history == null) {
                loop_arr.push({
                    data: {
                        status: "Not running",
                        total_run: 0,
                        total_stop: 0,
                        total_alarm: 0
                    },
                    id_identification: machine[index].id_identification,
                    original_name: machine[index].original_name,
                    batch_start: "",
                    batch_end: "",
                })
                //  console.log("index:" + index +"  id:"+ machine[index].id_identification);
            } else loop_arr.push(find_cloter_history)
        }
        //  res.status(200).json(loop_arr)
        // res.status(200).json({message:'current'})
    }
    return (loop_arr)
}

exports.getGroupdata