const loadMyAppointments = async (keyword) => {
    const fetchMyAppointments = await fetch('/get-all-appointments', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchMyAppointments.json();
}

const loadTable = async () => {
    showLoadingScreen('Loading appointments...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allAppointments = await loadMyAppointments(keyword);

    tbody.innerHTML = '';

    for (var i = 0; i < allAppointments.length; i++) {
        const appointment = allAppointments[i];
        const template = `
            <tr id="session-${ appointment.id }">
                <td id="session-date">${ appointment.appointmentDateTime.substring(0, 11) }</td>
                <td id="session-time">${ appointment.appointmentDateTime.substring(12) }</td>
                <td id="session-child">${ appointment.child.childFirstName } ${ appointment.child.childMiddleName } ${ appointment.child.childLastName }</td>
                <td id="session-parent">${ appointment.child.parentFirstName } ${ appointment.child.parentMiddleName } ${ appointment.child.parentLastName }</td>
                <td id="session-service">${ appointment.child.service }</td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
    }
    hideLoadingScreen();
}

document.getElementById('search-button').addEventListener('click', () => {
    loadTable();
});

loadTable();