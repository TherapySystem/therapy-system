const db = require('../fb_config/fb_config');
const children = require('./children');
const accounts = require('./accounts');
const snapshotParser = require('./snapshotParser');

const appointmentNode = 'appointments';

const saveAppointment = async (appointmentInfo) => {
    try {
        await db.ref(appointmentNode).child(appointmentInfo.id).set(appointmentInfo);
        return true;
    } catch (error) {
        return false;
    }
}

const getAppointments = async (keyword) => {
    const appointments = await db.ref(appointmentNode).once('value');
    const unfilteredAppointmentsData = snapshotParser.snapshotParserWithIds(appointments);

    const appointmentsData = [];

    for (var i = 0; i < unfilteredAppointmentsData.length; i++) {
        if (unfilteredAppointmentsData[i].status) {
            continue;
        }
        appointmentsData.push(unfilteredAppointmentsData[i]);
    }
    

    for (let i = 0; i < appointmentsData.length; i++) {
        appointmentsData[i].child = snapshotParser.snapshotParseObject(await children.getChildById(appointmentsData[i].childId));
        appointmentsData[i].therapist = snapshotParser.snapshotParseObject(await accounts.getAccountById(appointmentsData[i].therapistId));
    }

    if (!keyword.trim()) {
        return appointmentsData;
    }

    return appointmentsData.filter(appointment => {
        const names = `
        ${ appointment.child.childLastName } 
        ${ appointment.child.childFirstName } 
        ${ appointment.child.childMiddleName }
        ${ appointment.therapist.name }`;
        return names.toLowerCase().includes(keyword.toLowerCase());
    });
}

const appointmentDone = async (id) => {
    try {
        await db.ref(appointmentNode).child(id).child('status').set('done');
        return true;
    } catch (error) {
        return false;
    }
}

const appointmentCancelled = async (id) => {
    try {
        await db.ref(appointmentNode).child(id).child('status').set('cancelled');
        return true;
    } catch (error) {
        return false;
    }
}

const getAppointmentsByTherapist = async (keyword, id) => {
    const appointments = await getAppointments(keyword);

    return appointments.filter(appointment => appointment.therapistId === id);
}

const getAppointmentsByChild = async (id) => {
    const appointments = await getAppointments('');
    return appointments.filter(appointment => appointment.childId == id); 
}

module.exports = {
    saveAppointment,
    getAppointments,
    getAppointmentsByTherapist,
    getAppointmentsByChild,
    appointmentDone,
    appointmentCancelled
}