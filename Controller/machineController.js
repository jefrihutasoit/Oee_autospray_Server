const machine_lists = require("../Models/machineListmodel.js")
const { emitToAll } = require('../index.js')

exports.registerNewmacchine = async (req, res) => {

    try {
        console.log(req.body);
        const DB = new machine_lists(req.body)
        const FB = await DB.save()
        res.status(200).json(FB)
        console.log("mesin ditambahkan");
    } catch (error) {
        console.log("failed save");
        res.status(500).json(error.message)
    }

}

exports.getMachine = async (req, res) => {

    console.log("get machine");
    if (req.params.group != 0) {
        try {
            const FB = await machine_lists.find({ group: req.params.group })
            res.status(200).json(FB)
        } catch (error) {
            console.log("failed get mc");
            res.status(500).json(error.message)
        }
    } else {
        try {
            const FB = await machine_lists.find()
            res.status(200).json(FB)
        } catch (error) {
            console.log("failed get mc");
            res.status(500).json(error.message)
        }
    }
    // setTimeout(() => {
    //     emitToAll
    // }, 3000);
}


// export const removeNewmacchine = async (req, res) => {

//     try {
//         const bodyReq = req.body
//         const FB = await machine_lists.deleteMany({},{

//         })
//     } catch (error) {
//         console.log("failed save");
//         res.status(500).json(error.message)
//     }

// }
