const db = require('../fb_config/fb_config');
const children = require('./children');
const snapshotParser = require('./snapshotParser');

const billingNode = 'billings';

const saveBilling = async (billingInfo) => {
    try {
        await db.ref(billingNode).child(billingInfo.id).set(billingInfo);
        return true;
    } catch (error) {
        return false;
    }
}

const getAllBillings = async (keyword) => {
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

module.exports = {
    getAllBillings,
    saveBilling
}