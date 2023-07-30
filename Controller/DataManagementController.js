// import { query } from 'express'
const part_list = require('../Models/PartModel.js')
const dt_list = require('../Models/down_time_list.js')
const dt_planning_list = require('../Models/planning_dtModel.js')
const Labour_list = require('../Models/Labour.js')
const RejectCodeList = require('../Models/RejectCodeListModel.js')
const RejectHistory = require('../Models/OEE_models/RejectHistory.js')
const dt_listHistory = require("../Models/OEE_models/DownTime_history.js")
const Oee_models = require('../Models/OEE_models/OEEscheduleModel.js')
const mongoose = require("mongoose")
const moment = require("moment")



exports.Adjust_output_from_operator = async(req, res)=>{
    console.log(`Adjust:  ${req.params.value} ${req.params.operator }`);
    try {
      if(  req.params.operator ==="plush"){
        const db = await Oee_models.updateOne({_id:req.params.id},{$inc:{
            'Actual.Output':req.params.value
        }})
        setTimeout(()=>{   res.status(200).json(db)}, 1400)
     
      //  console.log(db);
      }else if( req.params.operator ==="minus"){
        const db = await Oee_models.updateOne({_id:req.params.id},{$inc:{
            'Actual.Output':-req.params.value
        }})
        setTimeout(()=>{   res.status(200).json(db)}, 1400)
      //  console.log(db);
      }else{
        setTimeout(()=>{   res.status(400)}, 1400)
      }
    //   res.status(200)
    } catch (error) {
        setTimeout(()=>{   res.status(400)}, 1400)
    }
}

exports.Operator_screen_inid_data = async (req, res) => {
    const Reject_code = await RejectCodeList.find().sort({ _id: -1 })
    const Downtime_reason_list = await dt_list.find();
    // const dt_planning_list = await dt_planning_list.find()

    res.status(200).json({
        Reject_code: Reject_code,
        Downtime_list: Downtime_reason_list,
    })
}

exports.modify_downtime_information = async (req, res) => {
    const Downtime_reason_list = await dt_list.findOne({ dt_code: req.params.dt_code });
    if (Downtime_reason_list != null) {
        try {
            const update = {
                $set: {
                    dt_code: req.params.dt_code,
                    dt_description: Downtime_reason_list.dt_description
                }
            }
            const options = { upsert: true };
            const db = await dt_listHistory.updateOne({ _id: req.params.id }, update, options);
            res.status(200).json(db)
        } catch (error) {
            res.status(400).json(error)
        }
    } else {
        res.status(401).json({ message: 'No data' })
    }
    console.log(req.params);
}

exports.register_PartReject_remarks = async (req, res) => {
    const query = { Code: req.body[0].Code };
    const update = {
        $set: {
            Code: req.body[0].Code,
            Description: req.body[0].Description,
        }
    };
    const options = { upsert: true };
    const db = await RejectCodeList.updateOne(query, update, options);

    res.status(200).json(db)

}
// 
exports.get_PartReject = async (req, res) => {
    res.status(200).json(await RejectCodeList.find().sort({ _id: -1 }))
}
exports.delete_PartReject = async (req, res) => {
    res.status(200).json(await RejectCodeList.deleteOne({ _id: req.params._id }))
}

exports.Register_Part_reject_history = async (req, res) => {
    const Reject_code = await RejectCodeList.findOne({ Code: req.body.Code })

    if (Reject_code != null) {
        const DB = new RejectHistory({
            Code: req.body.Code,
            Remarks: Reject_code.Description,
            Quantity: req.body.Quantity,
            Parent_schedule: mongoose.Types.ObjectId(req.body.Parent_schedule),
            Date: moment()
        })
        await DB.save()
    } else {
        // console.log('Kosong');
    }
    res.status(200).json("Oke")
}


exports.register_labour = async (req, res) => {
    const query = { ID: req.body[0].ID };
    const update = {
        $set: {
            ID: req.body[0].ID,
            Name: req.body[0].Name,
            Role: req.body[0].Role,

        }
    };
    const options = { upsert: true };
    const db = await Labour_list.updateOne(query, update, options);
    res.status(200).json(db)
}

exports.register_planning_dt = async (req, res) => {
    const query = { dt_description: req.body[0].dt_description };
    const update = {
        $set: {
            dt_description: req.body[0].dt_description,
            dt_duration: req.body[0].dt_duration,
        }
    };
    const options = { upsert: true };
    const db = await dt_planning_list.updateOne(query, update, options);
    res.status(200).json(db)
}


exports.register_planning_dt = async (req, res) => {
    const query = { dt_description: req.body[0].dt_description };
    const update = {
        $set: {
            dt_description: req.body[0].dt_description,
            dt_duration: req.body[0].dt_duration,
        }
    };
    const options = { upsert: true };
    const db = await dt_planning_list.updateOne(query, update, options);
    res.status(200).json(db)
}


exports.register_pn = async (req, res) => {
    console.log(req.body);
    const query = { part_number: req.body[0].part_number };
    const update = {
        $set: {
            part_number: req.body[0].part_number,
            description1: req.body[0].description1,
            description2: req.body[0].description2,
            output_percycle: req.body[0].output_percycle,
            default_ct: req.body[0].default_ct,
            default_target_output: req.body[0].default_target_output,
        }
    };
    const options = { upsert: true };
    const db = await part_list.updateOne(query, update, options);

    res.status(200).json(db)

}

exports.register_dt_remarks = async (req, res) => {
    const query = { dt_code: req.body[0].dt_code };
    const update = {
        $set: {
            dt_code: req.body[0].dt_code,
            dt_description: req.body[0].dt_description,
        }
    };
    const options = { upsert: true };
    const db = await dt_list.updateOne(query, update, options);

    res.status(200).json(db)

}
// 
exports.get_dt = async (req, res) => {
    // console.log('dt list');
    res.status(200).json(await dt_list.find().sort({ _id: -1 }))
}
exports.delete_dt = async (req, res) => {
    res.status(200).json(await dt_list.deleteOne({ _id: req.params._id }))
}
// 
exports.get_pn = async (req, res) => {
    res.status(200).json(await part_list.find().sort({ _id: -1 }))
}
exports.delete_pl = async (req, res) => {
    res.status(200).json(await part_list.deleteOne({ _id: req.params._id }))
}
// 
exports.get_dt_planning = async (req, res) => {
    res.status(200).json(await dt_planning_list.find().sort({ _id: -1 }))

}
exports.delete_dt_planning = async (req, res) => {
    res.status(200).json(await dt_planning_list.deleteOne({ _id: req.params._id }))
}

// 
exports.get_labour = async (req, res) => {
    res.status(200).json(await Labour_list.find().sort({ _id: -1 }))
}
exports.delete_labour = async (req, res) => {
    res.status(200).json(await Labour_list.deleteOne({ _id: req.params._id }))
}

exports.get_operator = async (req, res) => {
    // console.log('validate data');
    res.status(200).json({ data: await Labour_list.findOne({ ID: req.params.ID, Role: 'Operator' }) })
}
exports.get_leader = async (req, res) => {
    // console.log('validate data');
    res.status(200).json({ data: await Labour_list.findOne({ ID: req.params.ID, Role: 'Leader' }) })
}

exports.get_part = async (req, res) => {
    console.log('pn');
    res.status(200).json({ data: await part_list.findOne({ part_number: req.params.part_number }) })
}


