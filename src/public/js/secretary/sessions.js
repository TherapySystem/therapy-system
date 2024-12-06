const loadTherapist = async () => {
    const fetchTherapist = await fetch('/get-all-therapist', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchTherapist.json();
}

const loadChildren = async (id) => {
    const fetchPatients = await fetch('/get-all-children', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ therapistId: id })
    });

    return await fetchPatients.json();
} 

const loadAllSessions = async (keyword) => {
    const fetchAllSessions = await fetch('/get-all-sessions', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });
    
    return await fetchAllSessions.json();
}

const saveSession = async (therapistId, childId, sessionDateTime) => {
    showLoadingScreen('Saving session...');
    const fetchSaveSession = await fetch('/save-session', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            therapistId, 
            childId, 
            sessionDateTime 
        })
    });

    const respond = await fetchSaveSession.json();
    hideLoadingScreen();

    if (respond.status === 'success') {
        showSuccessNotification('Session saved successfully!');
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        loadTable();
    } else {
        showErrorNotification('Error saving session!');
    }
}

const updateSession = async (id, mode) => {
    showLoadingScreen("Updating session...");
    const respond = await fetch(mode == 'done' ? '/session-done' : '/session-cancelled', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id
        })
    });

    const result = await respond.json();

    hideLoadingScreen();

    if (result.status === 'success') {
        showSuccessNotification('Session updated successfully!');
        loadTable();
    } else {
        showErrorNotification('Error updating session!');
    }
}

const loadFunctions = async () => {
    const newSession = document.getElementById('new-session');
    const searchButton = document.getElementById('search-button');
    const confirmButton = document.getElementById('confirm-button');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');

    const therapistSelection = document.getElementById('therapist');
    const childSelection = document.getElementById('child');
    const sessionDateTime = document.getElementById('sessionDateTime');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    newSession.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    searchButton.addEventListener('click', () => {
        loadTable();
    });
    confirmButton.addEventListener('click', () => {

        const therapistId = therapistSelection.value;
        const childId = childSelection.value;
        const dateTime = sessionDateTime.value;

        if (therapistId === '' || childId === '' || dateTime === '') {
            showErrorNotification('Fields should not be empty!');
            return;
        }

        const date = new Date(dateTime);

        const options = { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
        };
        const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date).replace(',', '');

        saveSession(therapistId, childId, formattedDate);
    });

    const allTherapists = await loadTherapist();

    for (var i = 0; i < allTherapists.length; i++) {
        const therapist = allTherapists[i];
        const template = `<option value="${ therapist.id }">${ therapist.name }</option>`;
        therapistSelection.insertAdjacentHTML('beforeend', template);
    }

    therapistSelection.addEventListener('change', async () => {
        const therapistId = therapistSelection.value;
        const allChildren = await loadChildren(therapistId);

        childSelection.innerHTML = '<option value="" disabled selected hidden>Choose a Child</option>';
        
        for (var i = 0; i < allChildren.length; i++) {
            const child = allChildren[i];
            const template = `<option value="${ child.id }">${ child.childFirstName } ${ child.childMiddleName } ${ child.childLastName }</option>`;
            childSelection.insertAdjacentHTML('beforeend', template);
        }
    });
}

const loadTable = async () => {
    showLoadingScreen('Loading sessions...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allSessions = await loadAllSessions(keyword);

    tbody.innerHTML = '';

    for (var i = 0; i < allSessions.length; i++) {
        const session = allSessions[i];
        const template = `
            <tr id="session-${ session.id }">
                <td id="session-date">${ session.sessionDateTime.substring(0, 11) }</td>
                <td id="session-time">${ session.sessionDateTime.substring(12) }</td>
                <td id="session-therapist">${ session.therapist.name }</td>
                <td id="session-child">${ session.child.childFirstName } ${ session.child.childMiddleName } ${ session.child.childLastName }</td>
                <td id="session-action">
                    <svg id="done-button-${ session.id }" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5.5L5 3.5M21 5.5L19 3.5M9 12.5L11 14.5L15 10.5M20 12.5C20 16.9183 16.4183 20.5 12 20.5C7.58172 20.5 4 16.9183 4 12.5C4 8.08172 7.58172 4.5 12 4.5C16.4183 4.5 20 8.08172 20 12.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg id="cancel-button-${ session.id }" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 5.5L5 3.5M21 5.5L19 3.5M9 9.5L15 15.5M15 9.5L9 15.5M20 12.5C20 16.9183 16.4183 20.5 12 20.5C7.58172 20.5 4 16.9183 4 12.5C4 8.08172 7.58172 4.5 12 4.5C16.4183 4.5 20 8.08172 20 12.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
        const doneButton = document.getElementById(`done-button-${ session.id }`);
        const cancelButton = document.getElementById(`cancel-button-${ session.id }`);
        doneButton.addEventListener('click', () => {
            updateSession(session.id, 'done');
        });
        cancelButton.addEventListener('click', () => {
            updateSession(session.id, 'cancelled');
        });
    }

    hideLoadingScreen();
}

loadFunctions();
loadTable();
