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

module.exports = {
    snapshotParserWithIds
}