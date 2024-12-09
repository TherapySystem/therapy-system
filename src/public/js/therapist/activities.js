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

const loadServiceVariables = async (service) => {
    const fetchVariables = await fetch('/get-service-variables', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service })
    });

    return await fetchVariables.json();
}

const loadSuggestedActivities = async (childId) => {
    const fetchGetSuggestions = await fetch('/get-suggested-activities', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ childId })
    });

    return await fetchGetSuggestions.json();
}

const loadFunctions = async () => {
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', () => {
        loadTable();
    });
}

const saveActivity = async (activity) => {
    showLoadingScreen("Saving activity remarks...");
    const fetchSaveActivity = await fetch('/save-activity', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activity })
    });

    const response = await fetchSaveActivity.json();

    hideLoadingScreen();
    if (response.status == 'error') {
        showErrorNotification(response.message);
    } else {
        showSuccessNotification(response.message);
        document.getElementById('modal').style.display = 'none';
    }

}

const showSuggestedActivities = (suggestedActivities) => {
    const modal = document.getElementById('activitiesModal');   
    const modalContent = document.getElementById('modal-content-activities'); 

    modalContent.innerHTML = `<span id="closeActivities" class="close">&times;</span>
    <h2 style="margin-bottom:0;">System's Suggested Activities</h2>
    <p style="margin-bottom:20px;"><i>Based on your previous ratings...</i></p>`;

    const keys = Object.keys(suggestedActivities);

    for (var i = 0; i < keys.length; i++) {
        if(keys[i] == 'lastDate') continue;
        const activity = suggestedActivities[keys[i]];
        const { title, description } = activity;

        const template = `
        <div class="general-label-value">
            <h3>${ keys[i] }</h3>
            <p id="m-${keys[i]}"><b>${ title }</b><br>${ description }</p>
        </div>
        <br><br>`;
        modalContent.insertAdjacentHTML('beforeend', template);
    }

    document.getElementById('closeActivities').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.style.display = 'block';
}

const showModal = async (patientInfo) => {
    showLoadingScreen("Loading variables...");
    const modal = document.getElementById('modal');    
    const modalContent = document.querySelector('.modal-content');
    const serviceVariables = await loadServiceVariables(patientInfo.service);

    modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2>New Activity</h2>
            
            <h3>Guide for rating</h3>
            <p><b>Significant Improvement</b> - 5</p>
            <p><b>Slight Improvement</b> - 4</p>
            <p><b>No Improvement or Decline</b> - 3</p>
            <p><b>Slight Decline</b> - 2</p>
            <p><b>Significant Decline</b> - 1</p>`;

    for (var i = 0; i < serviceVariables.length; i++) {
        const variable = serviceVariables[i];
        const template = `
        <h3>${ variable }</h3>
        <div class="input-container">
            <input type="number" id="variable-${ i }" name="variable-${ i }" placeholder=" " min="1" max="5" value="3">
            <label for="variable-${ i }">${ variable }</label>
        </div>`;
        modalContent.insertAdjacentHTML('beforeend', template);
    }

    modalContent.insertAdjacentHTML('beforeend', `<button id="confirm-button">Submit</button>`);

    const closeModal = document.querySelector('.close');
    const confirmButton = document.getElementById('confirm-button');

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    confirmButton.addEventListener('click', () => {
        const variables = {};
        for (var i = 0; i < serviceVariables.length; i++) {
            const variableValue = document.getElementById(`variable-${ i }`).value;
            variables[serviceVariables[i]] = variableValue;
        }
        
        const activity = {
            childId: patientInfo.id,
            date: new Date().toISOString().slice(0, 10),
            variables: variables
        };
        
        saveActivity(activity);
    });

    modal.style.display = 'block';
    hideLoadingScreen();
}

const formatDate = (inputDate) => {
    const [year, month, day] = inputDate.split('-');
    const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    const monthAbbreviation = monthNames[parseInt(month, 10) - 1];
    return `${monthAbbreviation} ${day}, ${year}`;
}

const loadTable = async () => {
    showLoadingScreen("Loading patients...");
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allPatients = await loadAllPatients(keyword.trim());

    tbody.innerHTML = '';

    for (var i = 0; i < allPatients.length; i++) {
        const patient = allPatients[i];

        const suggestedActivities = await loadSuggestedActivities(patient.id);

        const template = `
        <tr id="child-${ patient.id }">
            <td id="child-parent">${ patient.parentFirstName } ${ patient.parentMiddleName } ${ patient.parentLastName }</td>
            <td id="child-child">${ patient.childFirstName } ${ patient.childMiddleName } ${ patient.childLastName }</td>
            <td id="child-service">${ patient.service }</td>
            <td id="child-activity">${ patient.activities ? formatDate(suggestedActivities.lastDate)?? 'No activity' : 'No activity' }</td>
            <td id="child-action">
                <svg id="child-action-${ patient.id }" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 5 .25C3 4.00736 4.00736 3 5.25 3H18.75C19.9926 3 21 4.00736 21 5.25V12.0218C20.5368 11.7253 20.0335 11.4858 19.5 11.3135V5.25C19.5 4.83579 19.1642 4.5 18.75 4.5H5.25C4.83579 4.5 4.5 4.83579 4.5 5.25V18.75C4.5 19.1642 4.83579 19.5 5.25 19.5H11.3135C11.4858 20.0335 11.7253 20.5368 12.0218 21H5.25C4.00736 21 3 19.9926 3 18.75V5.25Z"/>
                    <path d="M10.7803 7.71967C11.0732 8.01256 11.0732 8.48744 10.7803 8.78033L8.78033 10.7803C8.48744 11.0732 8.01256 11.0732 7.71967 10.7803L6.71967 9.78033C6.42678 9.48744 6.42678 9.01256 6.71967 8.71967C7.01256 8.42678 7.48744 8.42678 7.78033 8.71967L8.25 9.18934L9.71967 7.71967C10.0126 7.42678 10.4874 7.42678 10.7803 7.71967Z"/>
                    <path d="M10.7803 13.2197C11.0732 13.5126 11.0732 13.9874 10.7803 14.2803L8.78033 16.2803C8.48744 16.5732 8.01256 16.5732 7.71967 16.2803L6.71967 15.2803C6.42678 14.9874 6.42678 14.5126 6.71967 14.2197C7.01256 13.9268 7.48744 13.9268 7.78033 14.2197L8.25 14.6893L9.71967 13.2197C10.0126 12.9268 10.4874 12.9268 10.7803 13.2197Z"/>
                    <path d="M17.5 12C20.5376 12 23 14.4624 23 17.5C23 20.5376 20.5376 23 17.5 23C14.4624 23 12 20.5376 12 17.5C12 14.4624 14.4624 12 17.5 12ZM18.0011 20.5035L18.0006 18H20.503C20.7792 18 21.003 17.7762 21.003 17.5C21.003 17.2239 20.7792 17 20.503 17H18.0005L18 14.4993C18 14.2231 17.7761 13.9993 17.5 13.9993C17.2239 13.9993 17 14.2231 17 14.4993L17.0005 17H14.4961C14.22 17 13.9961 17.2239 13.9961 17.5C13.9961 17.7762 14.22 18 14.4961 18H17.0006L17.0011 20.5035C17.0011 20.7797 17.225 21.0035 17.5011 21.0035C17.7773 21.0035 18.0011 20.7797 18.0011 20.5035Z"/>
                    <path d="M13.25 8.5C12.8358 8.5 12.5 8.83579 12.5 9.25C12.5 9.66421 12.8358 10 13.25 10H16.75C17.1642 10 17.5 9.66421 17.5 9.25C17.5 8.83579 17.1642 8.5 16.75 8.5H13.25Z"/>
                </svg>
            </td>
        </tr>`;

        tbody.insertAdjacentHTML('beforeend', template);
        const action = document.getElementById(`child-action-${ patient.id }`);
        const row = document.getElementById(`child-${ patient.id }`);

        row.addEventListener('click', () => {
            if (patient.activities) {
                showSuggestedActivities(suggestedActivities);
            } else {
                showErrorNotification('This child has no activities yet...');
            }
        });
        action.addEventListener('click', () => {
            showModal(patient);
        });
    }

    hideLoadingScreen();
}

loadFunctions();
loadTable();