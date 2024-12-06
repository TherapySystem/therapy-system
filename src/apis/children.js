const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const childrenNode = 'children';

const addChild = async (childInfo) => {
    try {
        await db.ref(childrenNode).child(childInfo.id).set(childInfo);
        return true;
    } catch (error) {
        console.log('error in adding child: ' + error.message);
        return false;
    }
    
}

const getAllChildren = async (keyword = '') => {
    const children = await db.ref(childrenNode).once('value', (snapshot) => {
        return snapshot.val();
    });

    const parsedData = snapshotParser.snapshotParserWithIds(children);

    if (!keyword.trim()) {
        return parsedData;
    }

    const filteredChildren = parsedData.filter(child => {
        const allName = `${ child.childFirstName } ${ child.childMiddleName } ${ child.childLastName } ${ child.parentFirstName } ${ child.parentMiddleName }  ${ child.parentLastName } `;
        return allName.toLowerCase().includes(keyword.toLowerCase());
    });
    
    return filteredChildren;
}

const getChildrenByTherapist = async (keyword, therapistId) => {
    const children = await getAllChildren(keyword); 

    return children.filter(child => {
        return child.therapistId === therapistId;
    });
}

const getChildById = async (id) => {
    const child = await db.ref(childrenNode).child(id).once('value', (snapshot) => {
        return snapshot.val();
    });
    
    return child;
}

const removeChild = async (id) => {
    try {
        await db.ref(childrenNode).child(id).remove();
        return true;
    } catch (error) {
        return false;
    }
}

const checkChildCredentials = async (username, password) => {
    const children = await getAllChildren();
    const child = children.find(child => {
        return child.parentUsername.toLowerCase() === username.toLowerCase() && child.parentPassword === password;
    });
    
    return child;
}

module.exports = {
    addChild,
    getAllChildren,
    getChildrenByTherapist,
    getChildById,
    removeChild,

    checkChildCredentials
}