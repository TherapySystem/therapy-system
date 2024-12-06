const loadAllEnrollees = async (keyword = '') => {
    const fetchEnrollees = await fetch('/get-all-enrollees', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    })

    return await fetchEnrollees.json();
}

const loadAllTherapist = async () => {
    const fetchTherapists = await fetch('/get-all-therapist', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchTherapists.json();
}

const viewEnrolleeDetails = (enrollee) => {
    const modal = document.getElementById('modal');

    document.getElementById('m-child-name').innerText = `${ enrollee.childFirstName } ${ enrollee.childMiddleName } ${ enrollee.childLastName }`;
    document.getElementById('m-child-birthdate').innerText = `${ enrollee.childBirthDate }`;
    document.getElementById('m-address').innerText = `${ enrollee.address }`;
    document.getElementById('m-parent-name').innerText = `${ enrollee.parentFirstName } ${ enrollee.parentMiddleName } ${ enrollee.parentLastName }`;
    document.getElementById('m-parent-email').innerText = `${ enrollee.parentEmail }`;
    document.getElementById('m-parent-birthdate').innerText = `${ enrollee.parentBirthDate }`;
    document.getElementById('m-parent-number').innerText = `${ enrollee.parentNumber }`;


    modal.style.display = 'block';
    
    const closeBtn = document.querySelector(".close");
    const acceptBtn = document.getElementById('accept-button');
    const rejectBtn = document.getElementById('reject-button');

    closeBtn.onclick = () => {
        modal.style.display = "none";
    }

    acceptBtn.onclick = () => {
        const service = document.getElementById('service').value;
        const therapistId = document.getElementById('therapists').value;
        if (!service) {
            showErrorNotification('Select a service');
            return;
        }
        acceptEnrollee(enrollee.id, service, therapistId);
        modal.style.display = "none";
    }

    rejectBtn.onclick = () => {
        rejectEnrollee(enrollee.id);
        modal.style.display = "none";
    }
}

const acceptEnrollee = async (id, service, therapistId) => {
    showLoadingScreen('Accepting enrollee...');
    const response = await fetch('/enrollee-accept', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id,
            service,
            therapistId
        })
    });

    const result = await response.json();

    hideLoadingScreen();

    if (result.status == 'error') {
        showErrorNotification(result.message);
        return;
    }
    
    showSuccessNotification(result.message);

    loadTable();
}

const rejectEnrollee = async (id) => {
    showLoadingScreen('Rejecting enrollee...');
    const response = await fetch('/enrollee-reject', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    });

    const result = await response.json();

    hideLoadingScreen();

    if (result.status == 'error') {
        showErrorNotification(result.message);
        return;
    }

    showSuccessNotification(result.message);
    loadTable();
}

const loadTable = async () => {
    showLoadingScreen("Loading enrollees...");
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allEnrollees = await loadAllEnrollees(keyword.trim());
    const allTherapist = await loadAllTherapist();

    tbody.innerHTML = '';

    for(var i = 0; i < allEnrollees.length; i++) {
        const enrollee = allEnrollees[i];
        const template = `
        <tr id="enrollee-${ enrollee.id }">
            <td>${ enrollee.childLastName }</td>
            <td>${ enrollee.childFirstName }</td>
            <td>${ enrollee.childMiddleName }</td>
            <td>${ enrollee.parentFirstName } ${ enrollee.parentMiddleName } ${ enrollee.parentLastName }</td>
        </tr>
        `
        tbody.insertAdjacentHTML('beforeend', template);
        const row = document.getElementById(`enrollee-${ enrollee.id }`);

        row.addEventListener('click', () => {
            viewEnrolleeDetails(enrollee);
        });
    }

    const therapistSelection = document.getElementById('therapists');
    therapistSelection.innerHTML = '<option value="" disabled selected hidden>Choose a Therapist</option>';
    for (var i = 0; i < allTherapist.length; i++) {
        const therapist = allTherapist[i];
        const template = `<option value="${ therapist.id }">${ therapist.name }</option>`;
    
        therapistSelection.insertAdjacentHTML('beforeend', template);
    }

    hideLoadingScreen();
}
const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', () => {
    loadTable();
});
loadTable();