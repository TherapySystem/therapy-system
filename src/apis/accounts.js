const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const accountNode = 'accounts';

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
    allAccounts.filter(account => account.name.toLowerCase().includes(keyword.toLowerCase()) || account.id.includes(keyword));
    
    return allAccounts;
};

module.exports = {
    checkAccount,
    getAllAccounts,
    getFilterAccountsByKeyword
};