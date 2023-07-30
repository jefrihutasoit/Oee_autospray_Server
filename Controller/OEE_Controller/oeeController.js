const Oee_models = require('../../Models/OEE_models/OEEscheduleModel.js')
const machine_lists = require("../../Models/machineListmodel.js")
const dt_listHistory = require("../../Models/OEE_models/DownTime_history.js")
const rejectparthistories = require('../../Models/OEE_models/RejectHistory.js')
const moment = require('moment')
const RejectHistory = require('../../Models/OEE_models/RejectHistory.js')


exports.Register_Oee_schedule = async (req, res) => {

    //filter_machine_dulu
    const Machine = await machine_lists.findOne({ id_identification: req.body.Machine.id_identification })
    if (Machine == null) { res.status(403).json({ message: `Machine ${req.body.id_identification} not registered` }); return; }
    //filter active
    const Schedule_list = await Oee_models.findOne({ Machine_id_identification: req.body.Machine.id_identification, Active: true })
    // console.log(Schedule_list.Machine);
    if (Schedule_list != null) { res.status(403).json({ Message: 'You have active schedule for this machine' }); return; }
    //maka lolos
    req.body.Machine.original_name = Machine.original_name
    req.body.Actual.Output = 0
    req.body.Actual.Output_reject = 0
    req.body.Actual.Cycle_time = 0
    req.body.Actual.Down_time_in_seconds = 0
    req.body.Actual.Operating_time = 0
    req.body.Operation_info.status = "Pending"
    req.body.Operation_info.total_run = 0
    req.body.Operation_info.total_stop = 0
    req.body.Operation_info.total_alarm = 0
    req.body.Operation_info.total_standby = 0
    req.body.Operation_info.total_off = 0
    req.body.Operation_info.total_disconnect = 0
    req.body.OEE_data.Performance = 0
    req.body.OEE_data.Availability = 0
    req.body.OEE_data.Quality = 0
    req.body.OEE_data.OEE = 0
    // console.log(req.body);
    try {
        // const db = new Oee_models(req.body)
        const db = new Oee_models({
            Machine: {
                id_identification: req.body.Machine.id_identification,
                original_name: Machine.original_name,
                status: 'Stop'
            },
            Time_data: req.body.Time_data,
            Labour: req.body.Labour,
            OEE_data: req.body.OEE_data,
            Active: true,
            Planning: req.body.Planning,
            Actual: req.body.Actual,
            Machine_id_identification: req.body.Machine.id_identification

        })
        const insertBatch = await db.save()
        batch_selected_id = insertBatch._id
        res.status(200).json({ message: "bikin baru", dbFB: insertBatch })
    } catch (error) {
        res.status(400).json({ message: error.message })
    } finally {
        // res.status(200).json({ data: "oke" })
    }

}

exports.OEE_calculating_runtime = async () => {
    // await Oee_models.find({ "Time_data.batch_start": { $lte: moment().format("DD-MM-YYYY HH:mm:ss") }, Active: true })
    await Oee_models.find({ "Time_data.batch_start": { $lte: moment() }, Active: true })
        .then((Schedule_list) => {
            Schedule_list.forEach(async (Schedule) => {
                var waktu_st = moment(Schedule.Time_data.batch_start)
                var waktu_saat_ini = moment()
                var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
                //cek menentukan menghitung DT
                var tmpTotal_dt = 0;
                var Total_reject = 0;
                await dt_listHistory.aggregate([
                    {
                        $match: {
                            Parent_schedule: Schedule._id
                        }
                    },
                    {
                        $lookup: {
                            from: "Oee_models",
                            localField: "Parent_schedule",  // field in the items collection
                            foreignField: "_id",    // field in the orders collection
                            as: "Total_dt"
                        }
                    }])
                    .then((DT) => {
                        DT.map((DownTime) => {
                            tmpTotal_dt += DownTime.duration
                        })
                    })
                await RejectHistory.aggregate([
                    {
                        $match: {
                            Parent_schedule: Schedule._id
                        }
                    },
                    {
                        $lookup: {
                            from: "Oee_models",
                            localField: "Parent_schedule",  // field in the items collection
                            foreignField: "_id",    // field in the orders collection
                            as: "Total_Reject"
                        }
                    }])
                    .then((Reject) => {
                        Reject.map((Reject) => {
                            Total_reject += Number(Reject.Quantity)
                        })
                    })

                await Oee_models.updateOne({ _id: Schedule._id },
                    {
                        $set: {
                            "Actual.Operating_time": beda_waktu_inS,
                            "Planning.Relative_DT": Schedule.Actual.Down_time_in_seconds > Schedule.Planning.Down_time_in_seconds ? Schedule.Planning.Down_time_in_seconds : Schedule.Actual.Down_time_in_seconds,
                            "OEE_data.Performance": Schedule.Actual.Down_time_in_seconds > Schedule.Planning.Down_time_in_seconds ? (beda_waktu_inS - Schedule.Actual.Down_time_in_seconds) / (beda_waktu_inS - Schedule.Planning.Relative_DT):'1',
                            "OEE_data.Availability": (Schedule.Planning.Cycle_time * Schedule.Actual.Output) / (beda_waktu_inS - Schedule.Planning.Relative_DT),
                            "OEE_data.Quality": ((Schedule.Actual.Output - Schedule.Actual.Output_reject) / (Schedule.Actual.Output)),
                            "OEE_data.OEE": Schedule.OEE_data.Performance * Schedule.OEE_data.Availability * Schedule.OEE_data.Quality,
                            "Actual.Down_time_in_seconds": tmpTotal_dt,
                            "Actual.Output_reject": Total_reject,
                            Active : Schedule.Actual.Operating_time > 30600 ? false : Schedule.Actual.Active,
                            Done_by: Schedule.Actual.Operating_time > 30600 ? "System" :    Schedule.Done_by                    
                        }
                    }
                )
                //handle Downtime
                this.Down_time_recorder(Schedule)
                // console.log(`P : ${Schedule.OEE_data.Performance} A : ${Schedule.OEE_data.Availability} Q: ${Schedule.OEE_data.Quality} OEE:${Schedule.OEE_data.OEE}  runTime: ${beda_waktu_inS}`);
            })
        })
    // console.log(`Hasil filter:${current_schedule}  Moment:${moment().format()}`);
}

//Hanya mengambil MC alarm EMG atau CT terlalu lama, jika status tidak atau maka DT terjadi
exports.Down_time_recorder = async (Data_from_MQTT) => {
    // console.log('DT');
    const Schedule_list = await Oee_models.findOne({ Machine_id_identification: Data_from_MQTT.Machine.id_identification, Active: true })
    if (Schedule_list == null) return;
    else {
        //ada schedule
        //apakah tidak auto?
        // ; console.log('Status:' + Schedule_list.Machine.status);
        if (Data_from_MQTT.Machine.status != 'Run') {// berarti ada DT
            const DT_recorder = await dt_listHistory.findOne({ Parent_schedule: Schedule_list._id, Status: 'Active' })
            if (DT_recorder == null) {
                const db = new dt_listHistory({ duration: 0, Status: 'Active', Parent_schedule: Schedule_list._id, time_issue: moment(), Name: Schedule_list.Machine.id_identification })
                const fb = await db.save()
                // console.log('Bikin baru');
            } else {//update jam nya
                var waktu_st = moment(DT_recorder.time_issue)
                var waktu_saat_ini = moment()
                var beda_waktu_inS = waktu_saat_ini.diff(waktu_st, 'seconds')
                // console.log(beda_waktu_inS);
                await dt_listHistory.updateOne({ _id: DT_recorder._id }, {
                    $set: {
                        duration: beda_waktu_inS
                    }
                })
            }
        } else {//penutup Schedule
            const DT_recorder = await dt_listHistory.updateOne({ Parent_schedule: Schedule_list._id, Status: 'Active' }, {
                $set: {
                    Status: 'inActive'
                }
            })
            // console.log('Close');
        }
        // console.log(Schedule_list._id);
    }
}

exports.Get_schedule = async (prm) => {
    return (await Oee_models.aggregate([
        {
            $match: { Active: true }
        },
        {
            $lookup: {
                from: "dt_listhistories",
                localField: "_id",    // field in the orders collection
                foreignField: "Parent_schedule",  // field in the items collection
                as: "Downtime_list"
            }
        }, {
            $lookup: {
                from: "rejectparthistories",
                localField: '_id',
                foreignField: 'Parent_schedule',
                as: 'RejectHistory'
            }
        }
    ]));
}