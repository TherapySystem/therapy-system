const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const announcementNode = 'announcements';

const getAllAnnouncements = async (keyword = '') => {
    const announcements = await db.ref(announcementNode).once('value', (snapshot) => {
        return snapshot.val();
    });

    const parsedData = snapshotParser.snapshotParserWithIds(announcements);

    if (!keyword.trim()) {
        return parsedData;
    }

    const filteredAnnouncements = parsedData.filter(announcement => {
        const titleDetails = `${ announcement.title } ${ announcement.description }`;
        return titleDetails.toLowerCase().includes(keyword.toLowerCase());
    });
    
    return filteredAnnouncements;
}

const addAnnouncement = async (announcementInfo) => {
    try {
        await db.ref(announcementNode).child(announcementInfo.id).set(announcementInfo);
        return true;
    } catch (error) {
        console.log('error in adding announcement: ' + error.message);
        return false;
    }
}

const getAnnouncementById = async (id) => {
    const announcement = await db.ref(announcementNode).child(id).once('value', (snapshot) => {
        return snapshot.val();
    });

    return announcement;
}

const removeAnnouncement = async (id) => {
    try {
        await db.ref(announcementNode).child(id).remove();
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getAllAnnouncements,
    getAnnouncementById,
    addAnnouncement,
    removeAnnouncement
}