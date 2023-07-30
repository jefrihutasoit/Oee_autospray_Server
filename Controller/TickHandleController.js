const batchhistories = require("../Models/BatchHistoryModel.js")
const moment = require("moment")
const { update_operation_history } = require('../Controller/batchHistoryController.js')
const { currentShift } = require("../WorkingShiftstatus.js")
// import batchhistories from "../Models/BatchHistoryModel.js"
// import moment from "moment"
// import {update_operation_history} from '../Controller/batchHistoryController.js'
// import { currentShift } from "../WorkingShiftstatus.js"



const update_all = async () => {
    // console.log("update all");
    let shiftSekarang = currentShift()
    // console.log( moment().format("H:mm:ss") + " Shift saat ini:"+ shiftSekarang.shift+ " Status:" + shiftSekarang.status);

    const updatebatch = await batchhistories.find({ batch_start: { $lte: moment(shiftSekarang.end) }, batch_start: { $gte: moment(shiftSekarang.start) } }).then((retVal) => {
        retVal.forEach(async (eachVal) => {
            //console.log("hasil Loop:" + eachVal.batch_end);
            var waktu_st = moment(eachVal.batch_end)
            var waktu_saat_ini = moment()
            var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')

            await batchhistories.updateMany({ _id: eachVal._id }, {
                batch_end: moment().format("Y-M-D H:m:s"),
                data: {
                    status: eachVal.data.status,
                    total_run: eachVal.data.status == "Run" ? eachVal.data.total_run + beda_waktu_inS : eachVal.data.total_run,
                    total_stop: eachVal.data.status == "Stop" ? eachVal.data.total_stop + beda_waktu_inS : eachVal.data.total_stop,
                    total_alarm: eachVal.data.status == "Alarm" ? eachVal.data.total_alarm + beda_waktu_inS : eachVal.data.total_alarm,
                    total_standby: eachVal.data.status == "Standby" ? eachVal.data.total_standby + beda_waktu_inS : eachVal.data.total_standby,
                    // total_off: eachVal.data.status == "Off" ? eachVal.data.total_off + beda_waktu_inS : eachVal.data.total_off,
                    total_disconnect: eachVal.data.status == "Disconnect" ? eachVal.data.total_disconnect + beda_waktu_inS : eachVal.data.total_disconnect,
                }
            },
                //update operation history
                update_operation_history({
                    id_identification: eachVal.id_identification,
                    status: eachVal.data.status
                }, eachVal._id),
            )
        })
    })
    // console.log("hasil perubahan tick:" + JSON.stringify(updatebatch));//+ " id:" + lastbatcHistory[0]._id);

}

exports.update_all = update_all


const history_handle = async (prm) => {
    try {
        const fbHistory = await machine_histories.find({
            id_identification: prm.id_identification
        }).sort({ '_id': -1 }).limit(1)

        if (fbHistory != '') {//kalau ada eksekusi update dan cek sesi baru
            var waktu_st = moment(fbHistory[0].start_time)
            var waktu_saat_ini = moment()
            var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
            var beda_waktu_inM = waktu_saat_ini.diff(waktu_st, 'minutes')

            const db = await machine_histories.updateOne({ _id: fbHistory[0]._id }, { // update dulu datanya
                end_time: moment().format("Y-M-D H:m:s"),
                duration: beda_waktu_inM === 0 ? beda_waktu_inS + ' Seconds' : beda_waktu_inM + ' Minutes ',
                duration_on_second: beda_waktu_inS,
                updated_at: moment().format()
            })
            // console.log("update");
            // res(200).json({message:`Updated status machine ${req.body.id_identification}`})
            // console.log("just update:" + db);

            if (prm.status != fbHistory[0].status) {//kalau tidak sama langsung bikin record baru

                let create_array = {
                    id_identification: prm.id_identification,
                    status: prm.status,
                    start_time: moment().format("Y-M-D H:m:s"),
                    end_time: moment().format("Y-M-D H:m:s"),
                    duration: 0,
                    duration_on_second: 0,
                    updated_at: moment().format()
                }
                try {//eksekusi bikin
                    const db = new machine_histories(create_array)
                    const fb = await db.save()
                    console.log("update dan bikin baru: " + fb);
                    res.status(200).json({ message: `Create new for ${prm.id_identification}` })
                } catch (error) {
                    console.log("Error bikin history:" + error.message);
                }
                // console.log("update dan bikin baru");
            }

        } else {//langsung bikin baru kalau ngga ada
            let create_array = {
                id_identification: prm.id_identification,
                status: prm.status,
                start_time: moment().format("Y-M-D H:m:s"),
                end_time: moment().format("Y-M-D H:m:s"),
                duration: 0,
                duration_on_second: 0,
                updated_at: moment().format()
            }
            try {//eksekusi bikin
                const db = new machine_histories(create_array)
                const fb = await db.save()
                console.log("bikin baru: " + fb);
            } catch (error) {
                console.log("Error bikin history:" + error.message);
            }
            console.log("hnanya bikin baru");

        }
    } catch (error) {
        console.log("error cari history:" + error.message);
    }

}

exports.history_handle = this.history_handle


