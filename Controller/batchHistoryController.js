var db = require('mongodb').MongoClient
var db_adr = "mongodb://127.0.0.1:27017"
//komitment
//Run => mesin sedang beroprasi
//Standby => mesin ready on
//Alarm => mesin tidak ready-on dan alarm termasuk emg
//Stop => mesin tidak ready on, bisa off
//Disconnect => system tidak terhubung

//-----

const batchhistories = require("../Models/BatchHistoryModel.js")
const machine_lists = require("../Models/machineListmodel.js")
const machine_histories = require("../Models/historyModel.js")
const moment = require("moment")
const { currentShift } = require("../WorkingShiftstatus.js")
const { emitToAll } = require('../index.js')
const trial_db = require("../Models/trial_db.js")

exports.get_history = async (req, res) => {
    const history = await machine_histories.find({ id_identification: req.params.id, start_time: { $lte: moment(req.params.stop), $gte: moment(req.params.start) } }).sort({ _id: -1 }).limit(250)
    const history_pershift = await batchhistories.find({ id_identification: req.params.id, batch_start: { $lte: moment(req.params.stop), $gte: moment(req.params.start) } }).sort({ _id: -1 }).limit(250)
    const machine_info = await machine_lists.find({ id_identification: req.params.id })
    res.status(200).json({ "history": history, "history_shift": history_pershift, "machine_info": machine_info })
}
let batch_selected_id;


exports.trial_push = async (req, res) => {
    console.log(req.body);
    await db.connect(db_adr).then((db_client) => {
        const db = db_client.db("MCmonitoring")
        const collection = db.collection('trial_db')
        res.status(200).json({ db: collection.insertOne(req.body) })
    })
}


exports.new_handle_batch = async (req, res) => {
    let shiftSekarang = currentShift()
    try {
        // if (req.body.status == 'Run' || req.body.status == 'Stop' || req.body.status == 'Alarm' || req.body.status == "Standby" || req.body.status == "Disconnect");
        if (req.body.status == 'Run' || req.body.status == 'Stop' || req.body.status == 'Alarm' || req.body.status == "Standby" || req.body.status == "Disconnect");
        else {
            res.status(400).json({ message: `Status ${req.body.status} is illegal params!` })
            return;
        }

    } catch (error) {
        res.status(400).json({ message: 'fault get request:' + error })
    }
    // const batchHistory = new batchhistories(req.body)
    // console.log(batchHistory.shift);
    //console.log("batch handle");
    //cari dulu mesinnya
    try {
        const Machine = await machine_lists.findOne({ id_identification: req.body.id_identification })
        // console.log(JSON.stringify(Machine) == '[]');
        if (Machine == null) { res.status(403).json({ message: `Machine ${req.body.id_identification} not registered` }); return; }
        else {
            const lastbatcHistory = await batchhistories.findOne({ id_identification: req.body.id_identification, batch_start: { $gte: shiftSekarang.start, $lte: shiftSekarang.end } })
            //console.log("hasil_match batch:" + (lastbatcHistory == null ? 'batch kosong' : 'batch ada'));
            if (lastbatcHistory == null) { //bagian bikin baru kalau sesinya sama sekali belumada
                let cretaebatchJson = {
                    id_identification: req.body.id_identification,
                    original_name: Machine.original_name,
                    batch_start: moment().format("Y-M-D H:m:s"),
                    batch_end: moment().format("Y-M-D H:m:s"),
                    shift: shiftSekarang.shift,

                    data: {
                        status: req.body.status,
                        total_run: 0,
                        total_stop: 0,
                        total_alarm: 0,
                        total_standby: 0,
                        total_disconnect: 0
                    }
                }

                try {
                    const db = new batchhistories(cretaebatchJson)
                    const insertBatch = await db.save()
                    batch_selected_id = insertBatch._id
                    update_operation_history(req.body, batch_selected_id)//update history
                    res.status(200).json({ message: "bikin baru", dbFB: insertBatch })

                } catch (error) {
                    res.status(400).json({ message: error.message })
                }
            } else {//bagian update dan bikin baru
                var waktu_st = moment(lastbatcHistory.batch_end)
                var waktu_saat_ini = moment()
                var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
                // console.log("update");
                const updatebatch = await batchhistories.updateOne({
                    _id: lastbatcHistory._id
                },
                    {
                        batch_end: moment().format("Y-M-D H:m:s"),
                        data: {
                            status: req.body.status,
                            total_run: lastbatcHistory.data.status == 'Run' ? lastbatcHistory.data.total_run + beda_waktu_inS : lastbatcHistory.data.total_run,
                            total_stop: lastbatcHistory.data.status == 'Stop' ? lastbatcHistory.data.total_stop + beda_waktu_inS : lastbatcHistory.data.total_stop,
                            total_alarm: lastbatcHistory.data.status == 'Alarm' ? lastbatcHistory.data.total_alarm + beda_waktu_inS : lastbatcHistory.data.total_alarm,
                            total_standby: lastbatcHistory.data.status == 'Standby' ? lastbatcHistory.data.total_standby + beda_waktu_inS : lastbatcHistory.data.total_standby,
                            // total_off: lastbatcHistory.data.status == 'Off' ? lastbatcHistory.data.total_off + beda_waktu_inS : lastbatcHistory.data.total_off,
                            total_disconnect: lastbatcHistory.data.status == 'Disconnect' ? lastbatcHistory.data.total_disconnect + beda_waktu_inS : lastbatcHistory.data.total_disconnect
                        }
                    }
                )
                batch_selected_id = lastbatcHistory._id
                update_operation_history(req.body, batch_selected_id)//update history
                res.status(200).json({ message: "Update ", dbres: updatebatch })
            }
        }

        // console.log("id sel:" + batch_selected_id);



    } catch (error) {
        res.status(400).json({ message: error.message })
    }

    // try {
    //     const res_batch = await batchHistory.save()
    //     res.status(201).json(res_batch)
    // } catch (error) {
    //     res.status(400).json({ message: error.message })
    // }
}


exports.new_handle_batch_group = async (reqq, res) => {
    var enable_res = false;
    let shiftSekarang = currentShift()
    // res.status(200).json(reqq.body);
    // return;
    reqq.body.forEach(async (data) => {

        let req = {
            body: {
                id_identification: data.id_identification,
                status: data.status
            }

        }
        try {
            if (req.body.status == 'Run' || req.body.status == 'Stop' || req.body.status == 'Alarm' || req.body.status == "Standby" || req.body.status == "Not running" || req.body.status == "Disconnect");
            else {
                if (enable_res) res.status(400).json({ message: `Status ${req.body.status} is illegal params!` })
                enable_res = false;
                return;
            }

        } catch (error) {
            if (enable_res) res.status(400).json({ message: 'fault get request:' + error })
            enable_res = false;
            return;
        }
        console.log(`loop:${req.body.id_identification}`);

        try {
            const Machine = await machine_lists.findOne({ id_identification: req.body.id_identification })
            if (Machine == null) {
                res.status(403).json({ message: `Machine ${req.body.id_identification} not registered` });
                enable_res = false;
                return;
            }
            else {
                const lastbatcHistory = await batchhistories.findOne({ id_identification: req.body.id_identification, batch_start: { $gte: shiftSekarang.start, $lte: shiftSekarang.end } })
                if (lastbatcHistory == null) { //bagian bikin baru kalau sesinya sama sekali belumada
                    let cretaebatchJson = {
                        id_identification: req.body.id_identification,
                        original_name: Machine.original_name,
                        batch_start: moment().format("Y-M-D H:m:s"),
                        batch_end: moment().format("Y-M-D H:m:s"),
                        shift: shiftSekarang.shift,

                        data: {
                            status: req.body.status,
                            total_run: 0,
                            total_stop: 0,
                            total_alarm: 0,
                            total_standby: 0,
                            total_off: 0,
                            total_disconnect: 0,
                        }
                    }

                    try {
                        const db = new batchhistories(cretaebatchJson)
                        const insertBatch = await db.save()
                        batch_selected_id = insertBatch._id
                        update_operation_history(req.body, batch_selected_id)//update history
                        if (enable_res) res.status(200).json({ message: "bikin baru", dbFB: insertBatch })
                        enable_res = false;
                        return;
                    } catch (error) {
                        if (enable_res) res.status(400).json({ message: error.message })
                        enable_res = false;
                        return;
                    }
                } else {//bagian update dan bikin baru
                    var waktu_st = moment(lastbatcHistory.batch_end)
                    var waktu_saat_ini = moment()
                    var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
                    console.log("update");
                    const updatebatch = await batchhistories.updateOne({
                        _id: lastbatcHistory._id
                    },
                        {
                            batch_end: moment().format("Y-M-D H:m:s"),
                            data: {
                                status: req.body.status,
                                total_run: lastbatcHistory.data.status == 'Run' ? lastbatcHistory.data.total_run + beda_waktu_inS : lastbatcHistory.data.total_run,
                                total_stop: lastbatcHistory.data.status == 'Stop' ? lastbatcHistory.data.total_stop + beda_waktu_inS : lastbatcHistory.data.total_stop,
                                total_alarm: lastbatcHistory.data.status == 'Alarm' ? lastbatcHistory.data.total_alarm + beda_waktu_inS : lastbatcHistory.data.total_alarm,
                                total_standby: lastbatcHistory.data.status == 'Standby' ? lastbatcHistory.data.total_standby + beda_waktu_inS : lastbatcHistory.data.total_standby,
                                total_off: lastbatcHistory.data.status == 'Off' ? lastbatcHistory.data.total_off + beda_waktu_inS : lastbatcHistory.data.total_off,
                                total_disconnect: lastbatcHistory.data.status == 'Disconnect' ? lastbatcHistory.data.total_disconnect + beda_waktu_inS : lastbatcHistory.data.total_disconnect
                            }
                        }
                    )
                    batch_selected_id = lastbatcHistory._id
                    update_operation_history(req.body, batch_selected_id)//update history
                    if (enable_res) res.status(200).json({ message: "Update ", dbres: updatebatch })
                    enable_res = false;
                    return;
                }
            }

            console.log("id sel:" + batch_selected_id);



        } catch (error) {
            // if(enable_res) res.status(400).json({ message: error.message })
            console.log(error);
            return;
        }

        // try {
        //     const res_batch = await batchHistory.save()
        //     res.status(201).json(res_batch)
        // } catch (error) {
        //     res.status(400).json({ message: error.message })
        // }
    });
    res.status(200).json({ updated: true });
}



const update_operation_history = async (prm, batch_id) => {
    let shiftSekarang = currentShift()
    let create_array = {
        id_identification: prm.id_identification,
        status: prm.status,
        start_time: moment().format("Y-M-D H:m:s"),
        end_time: moment().format("Y-M-D H:m:s"),
        duration: 0,
        duration_on_second: 0,
        updated_at: moment().format(),
        batch_cloter: batch_id,
        shift: shiftSekarang.shift,
        work_condition: shiftSekarang.status
    }
    //cari aja history yang sama dengan data yang lama
    const tmp_operation_history = await machine_histories.find({ batch_cloter: batch_id, id_identification: prm.id_identification }).sort({ _id: -1 }).limit(1)

    if (tmp_operation_history[0] == null) {
        const tmp_create_new_operation_history = new machine_histories(create_array)
        const dbFB = tmp_create_new_operation_history.save()
        // emitToAll()
        // console.log("bikin his operation baru:" + dbFB);
    } else {
        var waktu_st = moment(tmp_operation_history[0].start_time)
        var waktu_saat_ini = moment()
        var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
        var beda_waktu_inM = waktu_saat_ini.diff(waktu_st, 'minutes')

        const db = await machine_histories.updateOne({ _id: tmp_operation_history[0]._id }, { // update dulu datanya
            end_time: moment().format("Y-M-D H:m:s"),
            duration: beda_waktu_inM === 0 ? beda_waktu_inS + ' Seconds' : beda_waktu_inM + ' Minutes ',
            duration_on_second: beda_waktu_inS,
            updated_at: moment().format()
        })

        if (prm.status != tmp_operation_history[0].status) {
            const tmp_create_new_operation_history = new machine_histories(create_array)
            const dbFB = await tmp_create_new_operation_history.save()
            // res.status(200).json({message:'bikin baru beda status', data:dbFB}) 
            // console.log(`bikin baru beda status: prm>${prm.status} tmphis>${tmp_operation_history[0].status}`+ dbFB);
            //hanya jika ada status baru, seketika langsung emit
        }
    }
    emitToAll
}
exports.update_operation_history = update_operation_history

async function history_handle(prm) {
    let shiftSekarang = currentShift()
    console.log('check history status:' + prm.id_identification);
    try {
        const fbHistory = await machine_histories.find({
            id_identification: prm.id_identification
        }).sort({ '_id': -1 }).limit(1)
        //console.log("Rers:" + fbHistory);
        // return;
        if (fbHistory != '') {//kalau ada eksekusi update dan cek sesi baru
            //cari lamanya
            // console.log('Waktu start:' +);
            var waktu_st = moment(fbHistory[0].start_time)
            var waktu_saat_ini = moment()
            var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
            var beda_waktu_inD = waktu_saat_ini.diff(waktu_st, 'days')
            var beda_waktu_inH = waktu_saat_ini.diff(waktu_st, 'hours')
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


