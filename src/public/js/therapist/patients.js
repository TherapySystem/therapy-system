const loadAllPatients = async (keyword = '') => {
    const fetchPatients = await fetch('/get-all-patients', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchPatients.json();
}

const loadTable = async () => {
    showLoadingScreen("Loading patients...");
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allPatients = await loadAllPatients(keyword.trim());

    tbody.innerHTML = '';

    for (var i = allPatients.length - 1; i >= 0 ; i--) {
        const patient = allPatients[i];
        const template = `
        <tr id="patient-${ patient.id }">
            <td id="patient-id">${ patient.id }</td>
            <td id="patient-last-name">${ patient.childLastName }</td>
            <td id="patient-middle-name">${ patient.childMiddleName }</td>
            <td id="patient-first-name">${ patient.childFirstName }</td>
            <td id="patient-availed-service">${ patient.service }</td>
        </tr>`;

        tbody.insertAdjacentHTML('beforeend', template);
    }
    hideLoadingScreen();
}

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', () => {
    loadTable();
});

loadTable();