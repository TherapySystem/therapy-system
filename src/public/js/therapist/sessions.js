const loadMySessions = async (keyword) => {
    const fetchMySessions = await fetch('/get-all-sessions', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchMySessions.json();
}

const loadTable = async () => {
    showLoadingScreen('Loading sessions...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allSessions = await loadMySessions(keyword);

    tbody.innerHTML = '';

    for (var i = 0; i < allSessions.length; i++) {
        const session = allSessions[i];
        const template = `
            <tr id="session-${ session.id }">
                <td id="session-date">${ session.sessionDateTime.substring(0, 11) }</td>
                <td id="session-time">${ session.sessionDateTime.substring(12) }</td>
                <td id="session-child">${ session.child.childFirstName } ${ session.child.childMiddleName } ${ session.child.childLastName }</td>
                <td id="session-parent">${ session.child.parentFirstName } ${ session.child.parentMiddleName } ${ session.child.parentLastName }</td>
                <td id="session-service">${ session.child.service }</td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
    }

    hideLoadingScreen();
}

document.getElementById('search-button').addEventListener('click', () => {
    loadTable();
});

loadTable();