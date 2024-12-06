const db = require('../fb_config/fb_config');
const snapshotParser = require('./snapshotParser');

const chatsNode = 'chats';

const getChats = async (chatRoomId) => {
    const allChats = await db.ref(chatsNode).child(chatRoomId).once('value');
    return snapshotParser.snapshotParserWithIds(allChats);
}

const addChat = async (chatInfo) => {
    try {
        await db.ref(chatsNode).child(chatInfo.chatRoomId).push(chatInfo);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getChats,
    addChat
}