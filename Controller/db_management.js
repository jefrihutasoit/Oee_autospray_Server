const batchhistories = require("../Models/BatchHistoryModel.js")
const machine_histories = require("../Models/historyModel.js")


exports.clear_operation_history = async (req, res) => {
    if (req.body.option == "all") {
        console.log("del his op all");
        try {
            const db_res = await machine_histories.deleteMany()
            res.status(200).json(db_res)
        } catch (error) {
            res.status(400).json(error.message)
        }
    } else {
        console.log("del his op with option");
        try {
            const db_res = await machine_histories.deleteMany(req.body.option)
            res.status(200).json(db_res)
        } catch (error) {
            res.status(400).json(error.message)
        }
    }
}
exports.clear_shiftly_history = async (req, res) => {
    if (req.params.option == "all") {
        try {
            const db_res = await batchhistories.deleteMany()
            res.status(200).json(db_res)
        } catch (error) {
            res.status(400).json(error.message)
        }
    } else {
        try {
            const db_res = await batchhistories.deleteMany(req.body.option)
            res.status(200).json(db_res)
        } catch (error) {
            res.status(400).json(error.message)
        }
    }

} 