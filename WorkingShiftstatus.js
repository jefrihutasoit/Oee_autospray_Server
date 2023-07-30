const moment = require('moment')

// menentukan shift
let shiftSekarang = null

let listShift = []


// exports.currentShift = () => {

//     let work_time = "Normal"//;moment().format("dddd") == "Sunday" ? "Overtime" : moment().format("dddd") == "Sunday" ? "Overtime" : "Normal"

//     listShift = [
//         { shift: 1, name: 'Shift1', start: moment('22:40:01', 'H:mm:ss'), end: moment('07:10:00', 'H:mm:ss').add(1, 'days'), status: work_time, hari: moment().format("dddd") },
//         { shift: 2, name: 'Shift2', start: moment('07:10:01', 'H:mm:ss'), end: moment('15:40:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
//         { shift: 3, name: 'Shift3', start: moment('15:40:01', 'H:mm:ss'), end: moment('22:40:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
//     ]
//     listShift.forEach(item => {
//         if (moment().diff(item.start) >= 0 && moment() <= item.end) {
//             shiftSekarang = item;
//         } else;
//     });
//     try {
//         let a = shiftSekarang.name
//     } catch (error) {

//         listShift = [
//             { shift: 1, name: 'Shift1', start: moment('22:40:01', 'H:mm:ss'), end: moment('07:10:00', 'H:mm:ss').subtract(1, 'days'), status: work_time, hari: moment().format("dddd") },
//             { shift: 2, name: 'Shift2', start: moment('07:10:01', 'H:mm:ss'), end: moment('15:40:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
//             { shift: 3, name: 'Shift3', start: moment('15:40:01', 'H:mm:ss'), end: moment('22:40:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
//         ]

//         listShift.forEach(item => {
//             if (moment().diff(item.start) >= 0 && moment() <= item.end) {
//                 shiftSekarang = item;
//                 // console.log('ada yang sama');
//             } else;
//         });
//         try {
//             let a = shiftSekarang.name
//         } catch (error) {
//             console.log("fault shift twice");
//         }
//     }
//     return (shiftSekarang)
// }

exports.currentShift = () => {

    let work_time = moment().format("dddd") == "Saturday" ? "Overtime" : moment().format("dddd") == "Sunday" ? "Overtime" : "Normal"

    listShift = [
        { shift: 1, name: 'Shift1', start: moment('7:00:01', 'H:mm:ss'), end: moment('16:00:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
        { shift: 1, name: 'Shift1', start: moment('16:00:01', 'H:mm:ss'), end: moment('18:59:59', 'H:mm:ss'), status: "Overtime", hari: moment().format("dddd") },
        { shift: 2, name: 'Shift2', start: moment('19:00:01', 'H:mm:ss'), end: moment('03:00:00', 'H:mm:ss').add(1, 'days'), status: work_time, hari: moment().format("dddd") },
        { shift: 2, name: 'Shift2', start: moment('03:00:01', 'H:mm:ss'), end: moment('06:59:59', 'H:mm:ss'), status: "Overtime", hari: moment().format("dddd") },
    ]
    listShift.forEach(item => {
        if (moment().diff(item.start) >= 0 && moment() <= item.end) {
            shiftSekarang = item;
        } else;
    });
    try {
        let a = shiftSekarang.name
    } catch (error) {

        listShift = [
            { shift: 1, name: 'Shift1', start: moment('7:00:01', 'H:mm:ss'), end: moment('16:00:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
            { shift: 1, name: 'Shift1', start: moment('16:00:01', 'H:mm:ss'), end: moment('18:59:59', 'H:mm:ss'), status: "Overtime", hari: moment().format("dddd") },
            { shift: 2, name: 'Shift2', start: moment('19:00:01', 'H:mm:ss').subtract(1, 'days'), end: moment('03:00:00', 'H:mm:ss'), status: work_time, hari: moment().format("dddd") },
            { shift: 2, name: 'Shift2', start: moment('03:00:01', 'H:mm:ss'), end: moment('06:59:59', 'H:mm:ss'), status: "Overtime", hari: moment().format("dddd") },
        ]

        listShift.forEach(item => {
            if (moment().diff(item.start) >= 0 && moment() <= item.end) {
                shiftSekarang = item;
                // console.log('ada yang sama');
            } else;
        });
        try {
            let a = shiftSekarang.name
        } catch (error) {
            console.log("fault shift twice");
        }
    }
    return (shiftSekarang)
}
