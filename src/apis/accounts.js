const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const accountNode = 'accounts';

const addUser = async (id, name, username, password, role) => {
    const account = {
        id,
        name,
        username,
        password,
        role
    };
    
    try {
        await db.ref(accountNode).child(account.id).set(account);
        return true;
    } catch (error) {
        console.log('error in adding user: ' + error.message);
        return false;
    }
}

const deleteUser = async (id) => {
    try {
        await db.ref(accountNode).child(id).remove();
        return true;
    } catch (error) {
        return false;
    }
}

const checkAccount = async (username, password) => {
    const accounts = await getAllAccounts();
    const account = accounts.find(account => account.username.toLowerCase() === username.trim().toLowerCase() && account.password === password);
    
    if (!account) {
        return null;
    }

    return account;
};

const getAllAccounts = async (role = null, excludeThisRole = false) => {
    const accounts = await db.ref(accountNode).once('value', (snapshot) => {
        return snapshot.val();
    });

    const parsedData = snapshotParser.snapshotParserWithIds(accounts);
    
    if (excludeThisRole && role) {
        return parsedData.filter(account => account.role !== role);
    } else {
        if (!role) {
            return parsedData;
        } else {
            return parsedData.filter(account => account.role === role);
        }
    }
};

const getFilterAccountsByKeyword = async (keyword = '', role = null, excludeThisRole = false) => {
    const allAccounts = await getAllAccounts(role, excludeThisRole);
    
    if (!keyword.trim()) {
        return allAccounts;
    }

    const filteredAccounts = allAccounts.filter(account => account.name.toLowerCase().includes(keyword.toLowerCase()) || account.id.includes(keyword));
    
    return filteredAccounts;
};

const getAccountById = async (id) => {
    const account = await db.ref(accountNode).child(id).once('value', (snapshot) => {
        return snapshot.val();
    });
    
    return account;
}

const recordAttendanceByBulk = async (bulkData) => {

    const updates = {};
    const { attendanceDate, employeeAttendanceData } = bulkData;

    for (var i = 0; i < employeeAttendanceData.length; i++) {
        const employeeId = employeeAttendanceData[i].id;
        updates[`/${accountNode}/${ employeeId }/attendance/${ attendanceDate }`] = true;
    }

    try {
        await db.ref().update(updates);
        return true;
    } catch (error) {
        return false;
    }
}

const generatePayroll = async (regular, special, fromDate, toDate) => {
    const salary = 460;
    const allAccounts = await getAllAccounts();
    const regularAddOn = Number(regular) * 460;
    const specialAddOn = Number(special) * ( salary * 0.3 );

    const updates = {};
    
    for (var i = 0; i < allAccounts.length; i++) {
        const account = allAccounts[i];
        updates[`/${accountNode}/${ account.id }/attendance`] = null;
        updates[`/${accountNode}/${ account.id }/salary`] = (salary * Object.keys(account.attendance).length) + regularAddOn + specialAddOn;
        updates[`/${accountNode}/${ account.id }/coverageDate`] = `${ fromDate } - ${ toDate }`;
    }

    try {
        await db.ref().update(updates);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    addUser,
    deleteUser,
    checkAccount,
    getAllAccounts,
    getFilterAccountsByKeyword,
    getAccountById,

    recordAttendanceByBulk,
    generatePayroll
};