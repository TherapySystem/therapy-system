let requestShowing = false;

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

const loadAllAppointments = async (keyword) => {
    const fetchAllAppointments = await fetch('/get-all-appointments', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });
    
    return await fetchAllAppointments.json();
}

const loadAllRequestAppointments = async () => {
    const fetchAllRequestSessions = await fetch('/get-all-appointment-requests', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchAllRequestSessions.json();
}

const saveAppointment = async (therapistId, childId, appointmentDateTime) => {
    showLoadingScreen('Saving appointment...');
    const fetchSaveAppointmelnt = await fetch('/save-appointment', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            therapistId, 
            childId, 
            appointmentDateTime 
        })
    });

    const respond = await fetchSaveAppointmelnt.json();
    hideLoadingScreen();

    if (respond.status === 'success') {
        showSuccessNotification('Appointment saved successfully!');
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        loadTable();
        processAppointmentRequests();
    } else {
        showErrorNotification('Error saving appointment!');
    }
}

const removeAppointmentRequest = async (id, childId, appointmentDateTime, isAccepted) => {
    const respond = await fetch('/reject-appointment-request', {
        method: 'DELETE',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            appointmentRequestId: id,
            childId,
            appointmentDateTime,
            isAccepted
        })
    });

    const result = await respond.json();
    return result;
}

const updateAppointment = async (id, mode) => {
    showLoadingScreen("Updating appointment...");
    const respond = await fetch(mode == 'done' ? '/appointment-done' : '/appointment-cancelled', {
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
        showSuccessNotification('Appointment updated successfully!');
        loadTable();
    } else {
        showErrorNotification('Error updating appointment!');
    }
}

const loadFunctions = async () => {
    const newAppointment = document.getElementById('new-appointment');
    const searchButton = document.getElementById('search-button');
    const confirmButton = document.getElementById('confirm-button');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const switchButton = document.getElementById('switch-button');

    const therapistSelection = document.getElementById('therapist');
    const childSelection = document.getElementById('child');
    const appointmentDateTime = document.getElementById('appointmentDateTime');
    
    switchButton.addEventListener('click', () => {
        const appointmentRequestSection = document.getElementById('appointment-request-section');
        const appointmentTable = document.getElementById('appointments-table');

        appointmentRequestSection.style.display = requestShowing ? 'none' : 'block';
        appointmentTable.style.display = !requestShowing ? 'none' : 'table';
        switchButton.innerText = !requestShowing ? 'Show Appointments' : 'Show Requests';

        requestShowing = !requestShowing;
    });
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    newAppointment.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    searchButton.addEventListener('click', () => {
        loadTable();
    });
    confirmButton.addEventListener('click', () => {

        const therapistId = therapistSelection.value;
        const childId = childSelection.value;
        const dateTime = appointmentDateTime.value;

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

        saveAppointment(therapistId, childId, formattedDate);
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
    showLoadingScreen('Loading appointments...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allAppointments = await loadAllAppointments(keyword);

    tbody.innerHTML = '';

    for (var i = 0; i < allAppointments.length; i++) {
        const appointment = allAppointments[i];
        const newAppointmentDateTime = appointment.appointmentDateTime.split(',')[0] + ' 2025' + appointment.appointmentDateTime.split(',')[1];
        const template = `
            <tr id="appointment-${ appointment.id }">
                <td id="appointment-date">${ appointment.appointmentDateTime.indexOf('2025') == -1 ? newAppointmentDateTime.substring(0, 11) : appointment.appointmentDateTime.substring(0, 11) }</td>
                <td id="appointment-time">${ appointment.appointmentDateTime.indexOf('2025') == -1 ? newAppointmentDateTime.substring(12) : appointment.appointmentDateTime.substring(12) }</td>
                <td id="appointment-therapist">${ appointment.therapist.name }</td>
                <td id="appointment-child">${ appointment.child.childFirstName } ${ appointment.child.childMiddleName } ${ appointment.child.childLastName }</td>
                <td id="appointment-action">
                    <svg id="done-button-${ appointment.id }" width="100%" height="100%" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <line class="cls-1" x1="3" x2="12" y1="16" y2="25"/>
                        <line class="cls-1" x1="12" x2="29" y1="25" y2="7"/>
                    </svg>
                    <svg id="cancel-button-${ appointment.id }" width="100%" height="100%" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <rect id="Icons" x="-256" y="-256" width="1280" height="800" style="fill:none;"/>
                        <path id="denied" d="M32.266,7.951c13.246,0 24,10.754 24,24c0,13.246 -10.754,24 -24,24c-13.246,0 -24,-10.754 -24,-24c0,-13.246 10.754,-24 24,-24Zm-15.616,11.465c-2.759,3.433 -4.411,7.792 -4.411,12.535c0,11.053 8.974,20.027 20.027,20.027c4.743,0 9.102,-1.652 12.534,-4.411l-28.15,-28.151Zm31.048,25.295c2.87,-3.466 4.596,-7.913 4.596,-12.76c0,-11.054 -8.974,-20.028 -20.028,-20.028c-4.847,0 -9.294,1.726 -12.76,4.596l28.192,28.192Z"/>
                    </svg>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
        const doneButton = document.getElementById(`done-button-${ appointment.id }`);
        const cancelButton = document.getElementById(`cancel-button-${ appointment.id }`);
        doneButton.addEventListener('click', () => {
            updateAppointment(appointment.id, 'done');
        });
        cancelButton.addEventListener('click', () => {
            updateAppointment(appointment.id, 'cancelled');
        });
    }

    hideLoadingScreen();
}

const processAppointmentRequests = async () => {
    const appointmentRequests = await loadAllRequestAppointments();

    // if (appointmentRequests.length > 0) {
    //     appointmentRequestSection.style.display = 'block';
    // } else {
    //     return;
    // }

    const tbody = document.getElementById('tbody-a');
    tbody.innerHTML = '';

    for (var i = appointmentRequests.length - 1; i >= 0; i--) {
        const appointment = appointmentRequests[i];
        const template = `
            <tr id="appointment-request-${ appointment.id }">
                <td id="appointment-request-date">${ appointment.date }</td>
                <td id="appointment-request-time">${ appointment.time }</td>
                <td id="appointment-request-therapist">${ appointment.child.therapist.name }</td>
                <td id="appointment-request-child">${ appointment.child.childFirstName } ${ appointment.child.childMiddleName } ${ appointment.child.childLastName }</td>
                <td id="appointment-action">
                    <svg id="accept-button-${ appointment.id }" width="100%" height="100%" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <line class="cls-1" x1="3" x2="12" y1="16" y2="25"/>
                        <line class="cls-1" x1="12" x2="29" y1="25" y2="7"/>
                    </svg>
                    <svg id="reject-button-${ appointment.id }" width="100%" height="100%" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                        <rect id="Icons" x="-256" y="-256" width="1280" height="800" style="fill:none;"/>
                        <path id="denied" d="M32.266,7.951c13.246,0 24,10.754 24,24c0,13.246 -10.754,24 -24,24c-13.246,0 -24,-10.754 -24,-24c0,-13.246 10.754,-24 24,-24Zm-15.616,11.465c-2.759,3.433 -4.411,7.792 -4.411,12.535c0,11.053 8.974,20.027 20.027,20.027c4.743,0 9.102,-1.652 12.534,-4.411l-28.15,-28.151Zm31.048,25.295c2.87,-3.466 4.596,-7.913 4.596,-12.76c0,-11.054 -8.974,-20.028 -20.028,-20.028c-4.847,0 -9.294,1.726 -12.76,4.596l28.192,28.192Z"/>
                    </svg>
                </td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
        const doneButton = document.getElementById(`accept-button-${ appointment.id }`);
        const cancelButton = document.getElementById(`reject-button-${ appointment.id }`);
        doneButton.addEventListener('click', () => {
            const therapistId = appointment.child.therapistId;
            const childId = appointment.childId;
            const appointmentDateTime = `${appointment.date}, ${appointment.time}`;
            saveAppointment(therapistId, childId, appointmentDateTime);
            removeAppointmentRequest(appointment.id, appointment.childId, appointmentDateTime, true);
            loadTable();
            processAppointmentRequests();
        });
        cancelButton.addEventListener('click', async () => {
            showLoadingScreen("Rejecting Appointment request...");
            const appointmentDateTime = `${appointment.date}, ${appointment.time}`;
            const response = await removeAppointmentRequest(appointment.id, appointment.childId, appointmentDateTime, false);
            hideLoadingScreen();

            if (response.status === 'success') {
                showSuccessNotification('Appointment request rejected  successfully!');
                loadTable();
                processAppointmentRequests();
            } else {
                showErrorNotification('Error rejecting Appointment request!');
            }
        });
    }
}

loadFunctions();
loadTable();
processAppointmentRequests();