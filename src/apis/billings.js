const db = require('../fb_config/fb_config');
const children = require('./children');
const snapshotParser = require('./snapshotParser');

const billingNode = 'billings';

const saveBilling = async (billingInfo) => {
    try {
        await db.ref(billingNode).child(billingInfo.id).set(billingInfo);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const getAllBillings = async (keyword = '') => {
    const billings = await db.ref(billingNode).once('value');

    const unfilteredParsedData = snapshotParser.snapshotParserWithIds(billings);

    for (var i = 0; i < unfilteredParsedData.length; i++) {
        unfilteredParsedData[i].child = snapshotParser.snapshotParseObject(await children.getChildById(unfilteredParsedData[i].childId));
    }
    
    const parsedData = unfilteredParsedData;
    
    if (keyword == '') {
        return parsedData;
    }

    return parsedData.filter((billing) => {
        const data = `${ billing.child.childFirstName } ${ billing.child.childMiddleName } ${ billing.child.childLastName } ${ billing.child.parentFirstName } ${ billing.child.parentMiddleName } ${ billing.child.parentLastName }`;
        
        if (data.toLowerCase().includes(keyword.toLowerCase())) {
            return billing;
        }
    });
};

const getAllBillingAmount = async () => {
    const billings = await getAllBillings();
    const totalAmount = billings.reduce((total, billing) => {
        return Number(total) + Number(billing.amount);
    }, 0);
    
    return totalAmount;
};

const setBillingStatus = async (billingId, status, validSession) => {
    try {
        await db.ref(billingNode).child(billingId).update({
            status: status,
            validSession: validSession
        });
        return true;
    } catch (error) {
        return false;
    }
}

const getBillingsByChild = async (id) => {
    const billings = await getAllBillings();
    return billings.filter(billing => billing.childId == id); 
}

const getBillingsMonthlySales = async () => {
    const billings = await getAllBillings();

    const sales = [];
    const months = {
        "January": 0,
        "February": 1,
        "March": 2,
        "April": 3,
        "May": 4,
        "June": 5,
        "July": 6,
        "August": 7,
        "September": 8,
        "October": 9,
        "November": 10,
        "December": 11,
    }

    Object.keys(months).forEach(month => {
        sales[months[month]] = { "month": month, "value": 0 };
    });

    for (var i = 0; i < billings.length; i++) {
        const billing = billings[i];

        const amount = billing.amount ? parseInt(billing.amount) : 0;
        const month = billing.paymentDate.split(" ")[0];

        const initialValue = sales[months[month]] ? sales[months[month]].value : 0;

        sales[months[month]] = { "month" : month, "value": initialValue + amount};
    }

    return sales;
}

module.exports = {
    getAllBillings,
    saveBilling,
    getAllBillingAmount,
    setBillingStatus,
    getBillingsByChild,
    getBillingsMonthlySales
}