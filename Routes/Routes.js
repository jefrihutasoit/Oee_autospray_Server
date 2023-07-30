const express = require("express");
// import { getUser, getUserByid, saveUser, updateUser, deleteUser } from "../Controller/userController.js"
const { new_handle_batch, get_history, new_handle_batch_group, trial_push } = require("../Controller/batchHistoryController.js")
const { getGroupCurrentSession, get_allSession } = require('../Controller/groupRequestCurrentDataController.js')
const { registerNewmacchine, getMachine } = require('../Controller/machineController.js')
const { clear_operation_history, clear_shiftly_history } = require('../Controller/db_management.js')
const { register_pn, get_pn, delete_pl, get_dt, register_dt_remarks, delete_dt,
    register_planning_dt,
    get_dt_planning,
    delete_dt_planning,
    register_labour,
    get_labour,
    delete_labour,
    get_operator,
    get_leader,
    get_part,
    register_PartReject_remarks,
    get_PartReject,
    delete_PartReject,
    Register_Part_reject_history,
    Operator_screen_inid_data,
    modify_downtime_information,
    Adjust_output_from_operator
} = require("../Controller/DataManagementController.js");

//OEE management
const { Register_Oee_schedule } = require("../Controller/OEE_Controller/oeeController.js")



const router = express.Router()


//OEE management
router.post('/register_schedule', Register_Oee_schedule)

router.post('/push_data', new_handle_batch_group)
router.post('/trial_push', trial_push)
router.get('/current-session-data/:group', getGroupCurrentSession)
router.get('/current-session-data-option/:option', get_allSession)
router.post('/register-machine', registerNewmacchine)
router.get('/get-machine/:group', getMachine)
router.get('/get-history/:id/:start/:stop', get_history)
router.post('/format_history_operation', clear_operation_history)
router.post('/format_history_shiftly', clear_shiftly_history)


router.post('/register-parts', register_pn)
router.get('/get-parts', get_pn)
router.delete('/drop-parts/:_id', delete_pl)

router.post('/register-dt', register_dt_remarks)
router.get('/get-dt-list', get_dt)
router.delete('/drop-dt/:_id', delete_dt)


//----RejectPart
router.post('/register-rejectcode', register_PartReject_remarks)
router.get('/get-rejectcode-list', get_PartReject)
router.delete('/drop-rejectcode/:_id', delete_PartReject)

//---Operator interface
router.get('/modify_downtime_information/:id/:dt_code', modify_downtime_information)
router.get('/Operator-screen-get-init-data', Operator_screen_inid_data)
router.get('/adjust-output/:operator/:value/:id', Adjust_output_from_operator)
router.post('/Register-reject-part', Register_Part_reject_history)

//---
router.post('/register-dt-planning', register_planning_dt)
router.get('/get-dt-planning-list', get_dt_planning)
router.delete('/drop-dt-planning/:_id', delete_dt_planning)


router.post('/register-labour', register_labour)
router.get('/get-labour', get_labour)
router.delete('/drop-labour/:_id', delete_labour)

//area validasi
router.get('/get-operator/:ID', get_operator)
router.get('/get-leader/:ID', get_leader)

router.get('/get-part/:part_number', get_part)


// router.get('/users/:id', getUserByid)
// router.post('/users/', saveUser)
// router.patch('/users/', updateUser)
// router.delete('/users/:id', deleteUser)

module.exports = router

// exports.router= routes
// exports.router