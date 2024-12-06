const loadAllChildren = async (keyword = '') => {
    const fetchChildren = await fetch('/get-all-children', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    const result = await fetchChildren.json();
    return result;
};

const removeChild = async (id) => {
    showLoadingScreen("Removing child...");

    const response = await fetch(`/child-delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
    });

    const result = await response.json();

    hideLoadingScreen();

    if (result.status == 'success') {
        showSuccessNotification(result.message);
        loadTable();
    } else {
        showErrorNotification(result.message);
    }
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
    document.getElementById('m-availed-service').innerText = `${ enrollee.service }`;

    modal.style.display = 'block';
    
    const closeBtn = document.querySelector(".close");

    closeBtn.onclick = () => {
        modal.style.display = "none";
    }
}

const loadTable = async () => {
    showLoadingScreen("Loading children...");
    const tbody = document.getElementById('tbody');
    // const keyword = document.getElementById('search-input').value;
    const allChildren = await loadAllChildren('');

    tbody.innerHTML = '';

    for (var i = 0; i < allChildren.length; i++) {
        const child = allChildren[i];
        const template = `
            <tr id="child-${ child.id }">
                <td id="child-id">${ child.id }</td>
                <td id="child-last-name">${ child.childLastName }</td>
                <td id="child-middle-name">${ child.childMiddleName }</td>
                <td id="child-first-name">${ child.childFirstName }</td>
                <td id="child-availed-service">${ child.service }</td>
            </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
        
        const row = document.getElementById(`child-${ child.id }`);

        row.addEventListener('click', () => {
            viewEnrolleeDetails(child);
        });
    }

    hideLoadingScreen();
}

loadTable();

