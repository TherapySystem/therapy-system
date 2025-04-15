const db = require('../fb_config/fb_config');
const children = require('./children');
const services = require('./services');
const snapshotParser = require('./snapshotParser');

const addActivity = async (activity) => {
    const { childId, date, variables } = activity;
    return await children.newChildActivity(childId, date, variables);
}

const getChildSuggestedActivities = async (childId) => {
    const child = snapshotParser.snapshotParseObject(await children.getChildById(childId));
    const serviceVariables = services.getServiceVariables(child.service);

    const activities = child.activities;
    if (!activities) {
        return {
            lastDate: null,
            activities: []
        }
    }
    const activityDates = Object.keys(activities);
    const varResults = {};

    for (var i = 0; i < activityDates.length; i++) {
        const activityVars = activities[activityDates[i]];
        for (var j = 0; j < serviceVariables.length; j++) {
            const variable = serviceVariables[j];

            const value = Number(activityVars[variable]) - 3;

            if (varResults[variable]) {
                varResults[variable] += value;
                if (varResults[variable] > 30) varResults[variable] = 30;
                if (varResults[variable] < 0) varResults[variable] = 0;
            } else {
                // 10 is the base, or the default instead of zero
                // if 0 is base, when the child perform poorly
                // no activites behind 0 is available
                varResults[variable] = 9 + value;
            }
        }
    }
    const suggestedActivities = services.getRecommendedActivities(child.service, varResults);
    suggestedActivities.lastDate = activityDates[activityDates.length - 1];
    return suggestedActivities;
}

const getChildActivityRatings = async (childId) => {
    const child = snapshotParser.snapshotParseObject(await children.getChildById(childId));

    const activities = child.activities;
    if (!activities) {
        return {};
    }

    return activities;
}

module.exports = {
    addActivity,
    getChildActivityRatings,
    getChildSuggestedActivities
}