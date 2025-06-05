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

const getMonthlyEnrollees = async () => {
    const allEnrollees = await getAllChildren();

    const monthlyEnrollees = [];
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
        monthlyEnrollees[months[month]] = { "month": month, "value": 0 };
    });
    for (var i = 0; i < allEnrollees.length; i++) {
        const enrollee = allEnrollees[i];

        const month = getMonthFromId(enrollee.id);
        
        const initialValue = monthlyEnrollees[months[month]].value;

        monthlyEnrollees[months[month]].value = initialValue + 1;
    }

    return monthlyEnrollees;
}

const getServiceEnrollees = async () => {
    const allEnrollees = await getAllChildren();

    const services = [
        {"service": "Occupational Therapy", "enrollees": 0},
        {"service": "Shadow Class", "enrollees": 0},
        {"service": "Speech Therapy", "enrollees": 0},
        {"service": "Developmental Class", "enrollees": 0}
    ]

    const serviceIndex = {
        "Occupational Therapy": 0,
        "Shadow Class": 1,
        "Speech Therapy": 2,
        "Developmental Class": 3
    };

    for (var i = 0; i < allEnrollees.length; i++) {
        const enrollee = allEnrollees[i];

        const enrolleeService = enrollee.service;
        services[serviceIndex[enrolleeService]].enrollees += 1;
    }

    return services;
}

const getServiceEnrolleesByGender = async (fromDateOrig, toDateOrig) => {
    const allEnrollees = await getAllChildren();

    const isDateInRange = (targetDateStr) => {
        const fromDate = new Date(fromDateOrig);
        const toDate = new Date(toDateOrig);

        const year = parseInt(targetDateStr.slice(0, 4));
        const month = parseInt(targetDateStr.slice(4, 6)) - 1;
        const day = parseInt(targetDateStr.slice(6, 8));
        const targetDate = new Date(year, month, day);

        return targetDate >= fromDate && targetDate <= toDate;
    }

    // const services = [
    //     {"service": "Occupational Therapy", "gender": { "Male": 0, "Female": 0 }},
    //     {"service": "Shadow Class", "gender": { "Male": 0, "Female": 0 }},
    //     {"service": "Speech Therapy", "gender": { "Male": 0, "Female": 0 }},
    //     {"service": "Developmental Class", "gender": { "Male": 0, "Female": 0 }}
    // ]

    const services = {
        "Occupational Therapy": {
            "male": 0, "female": 0
        },
        "Shadow Class": {
            "male": 0, "female": 0
        },
        "Speech Therapy": {
            "male": 0, "female": 0
        },
        "Developmental Class": {
            "male": 0, "female": 0
        }
    }

    for (var i = 0; i < allEnrollees.length; i++) {
        const enrollee = allEnrollees[i];

        const firstIdPart = enrollee.id.split("-")[0];
        const date = firstIdPart.substring(1);

        if (!isDateInRange(date)) {
            continue;
        }

        const enrolleeService = enrollee.service;
        services[enrolleeService][enrollee.childGender.toLowerCase()] += 1;
    }
    
    return services;

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

const newChildActivity = async (childId, date, variables) => {
    try {
        await db.ref(childrenNode).child(childId).child('activities').child(date).set(variables);
        return true;
    } catch (error) {
        return false;
    }
}

const getChildActivities = async (childId) => {
    const activities = await db.ref(childrenNode).child(childId).child('activities').once('value', (snapshot) => {
        return snapshot.val();
    });

    return activities;
}

function getMonthFromId(id) {
    const monthNumber = parseInt(id.slice(5, 7));
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
}

module.exports = {
    addChild,
    getAllChildren,
    getChildrenByTherapist,
    getChildById,
    removeChild,
    newChildActivity,
    getChildActivities,

    checkChildCredentials,
    
    getMonthlyEnrollees,
    getServiceEnrollees,
    getServiceEnrolleesByGender
}