const snapshotParserWithIds = (snapshotData) => {
    const parsedData = [];

    snapshotData.forEach((data) => {
        const dataObject = {
            id: data.key,
            ...data.val()
        };
        parsedData.push(dataObject);
    });

    return parsedData;
}

const snapshotParseObject = (snapshotData) => {
    const parsedData = {
        id: snapshotData.key,
        ...snapshotData.val()
    };
    
    return parsedData;
}

module.exports = {
    snapshotParserWithIds,
    snapshotParseObject
}