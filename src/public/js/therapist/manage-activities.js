const serviceCriterias = {};

const loadActivities = async (service) => {
    const fetchActivities = await fetch('/get-activities', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service })
    });

    return await fetchActivities.json();
}

const saveActivity = async () => {
    const selectedService = document.getElementById('service_add').value;
    const selectedCriteria = document.getElementById('criteria_add').value;
    const selectedLevel = document.getElementById('level_add').value;
    const activityName = document.getElementById('actName').value;
    const activityDescription = document.getElementById('actDescription').value;
    const activityLink = document.getElementById('actLink').value;

    if (selectedService && selectedCriteria && selectedLevel && activityName && activityDescription && activityLink) {
        showLoadingScreen('Saving activity...');
        const response = await fetch('/add-new-activity', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service: selectedService,
                criteria: selectedCriteria,
                level: selectedLevel,
                name: activityName,
                description: activityDescription,
                link: activityLink
            })
        });

        const result = await response.json();
        hideLoadingScreen();

        if (result.status == 'error') {
            showErrorNotification(result.message);
            return;
        } 

        document.getElementById('modal').style.display = 'none';
        showSuccessNotification(result.message);
        loadTable();
    } else {
        showErrorNotification('Incomplete fields!')
    }
}

const updateActivity = async (id) => {
    const selectedService = document.getElementById('service_add').value;
    const selectedCriteria = document.getElementById('criteria_add').value;
    const selectedLevel = document.getElementById('level_add').value;
    const activityName = document.getElementById('actName').value;
    const activityDescription = document.getElementById('actDescription').value;
    const activityLink = document.getElementById('actLink').value;

    if (selectedService && selectedCriteria && selectedLevel && activityName && activityDescription && activityLink) {
        showLoadingScreen('Updating activity...');
        const response = await fetch('/update-activity', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                service: selectedService,
                criteria: selectedCriteria,
                level: selectedLevel,
                name: activityName,
                description: activityDescription,
                link: activityLink
            })
        });

        const result = await response.json();
        hideLoadingScreen();

        if (result.status == 'error') {
            showErrorNotification(result.message);
            return;
        } 

        document.getElementById('modal').style.display = 'none';
        showSuccessNotification(result.message);
        clearFields();
        loadTable();
    } else {
        showErrorNotification('Incomplete fields!')
    }
}

const deleteActivity = async (service, criteria, level, number) => {
    showLoadingScreen('Deleting activity...');
    const response = await fetch('/delete-activity', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            service,
            criteria,
            level,
            number
        })
    });

    const result = await response.json();
    hideLoadingScreen();

    if (result.status == 'error') {
        showErrorNotification(result.message);
        return;
    } 

    document.getElementById('modal').style.display = 'none';
    showSuccessNotification(result.message);
    loadTable();
}

const editActivity = async (activityInfo) => {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';

    changeButtons(false);

    document.getElementById('title').innerText = 'Edit Activity';
    const addServiceElement = document.getElementById('service_add');
    const addCriteriaElement = document.getElementById('criteria_add');
    const addLevelElement = document.getElementById('level_add');
    const actNameElement = document.getElementById('actName');
    const actDescriptionElement = document.getElementById('actDescription');
    const actLinkElement = document.getElementById('actLink');

    console.log(activityInfo);

    addServiceElement.value = activityInfo.service;

    const criterias = serviceCriterias[activityInfo.service];
    addCriteriaElement.innerHTML = ``;
    for (var i = 0; i < criterias.length; i++) {
        const template = `<option value="${criterias[i]}" ${ activityInfo.criteria == criterias[i] ? 'selected' : '' }>${criterias[i]}</option>`;
        addCriteriaElement.insertAdjacentHTML('beforeend', template);
    }

    addLevelElement.value = activityInfo.level;

    actNameElement.value = activityInfo.name;
    actDescriptionElement.value = activityInfo.description;
    actLinkElement.value = activityInfo.link;

    addServiceElement.disabled = true;
    addCriteriaElement.disabled = true;
    addLevelElement.disabled = true;

    const updateButton = document.getElementById('update-button');
    updateButton.addEventListener('click', () => {
        updateActivity(activityInfo.id);
    });
}

const clearFields = () => {
    const addServiceElement = document.getElementById('service_add');
    const addCriteriaElement = document.getElementById('criteria_add');
    const addLevelElement = document.getElementById('level_add');
    const activityName = document.getElementById('actName');
    const activityDescription = document.getElementById('actDescription');
    const activityLink = document.getElementById('actLink');

    activityName.value = '';
    activityDescription.value = '';
    activityLink.value = '';

    addServiceElement.disabled = false;
    addCriteriaElement.disabled = false;
    addLevelElement.disabled = false;

    changeButtons(true);
}

const changeButtons = (isNormal) => {
    document.getElementById('confirm-button').style.display = isNormal ? 'block' : 'none';
    document.getElementById('update-button').style.display = !isNormal ? 'block' : 'none';
}

const loadFunctions = async () => {
    const serviceElement = document.getElementById('service');
    const addActivity = document.getElementById('add-activity');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');

    const addServiceElement = document.getElementById('service_add');
    const addCriteriaElement = document.getElementById('criteria_add');

    const confirmButton = document.getElementById('confirm-button');

    confirmButton.addEventListener('click', () => {
        saveActivity();
    })

    addServiceElement.addEventListener('change', () => {
        const serviceValue = addServiceElement.value;
        const criterias = serviceCriterias[serviceValue];
        addCriteriaElement.innerHTML = '';
        for (var i = 0; i < criterias.length; i++) {
            const template = `<option value="${criterias[i]}">${criterias[i]}</option>`;
            addCriteriaElement.insertAdjacentHTML('beforeend', template);
        }
    });

    addActivity.addEventListener('click', () => {
        modal.style.display = 'block';
        changeButtons(true);
        document.getElementById('title').innerText = 'Add Activity';
    })

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';

        clearFields();

    })

    serviceElement.addEventListener('change', () => {
        loadTable();
    })
}

const loadTable = async () => {
    showLoadingScreen("Loading activities...");
    const services = ['Occupational Therapy', 'Speech Therapy', 'Developmental Class', 'Shadow Class'];
    const tbody = document.getElementById('tbody');
    const serviceValue = document.getElementById('service').value;
    tbody.innerHTML = '';

    if (serviceValue == 'All') {
        for (var i = 0; i < services.length; i++) {
            const service = services[i];
            const allActivities = await loadActivities(service);
            
            if (!serviceCriterias[service]) {
                const criterias = Object.keys(allActivities);
                serviceCriterias[service] = criterias
            }

            loadSingleService(service, allActivities);
        }
        console.log(serviceCriterias);
    } else {
        const allActivities = await loadActivities(serviceValue);
        console.log(allActivities);
        loadSingleService(serviceValue, allActivities);
    }

    hideLoadingScreen();
}

const loadSingleService = (service, allActivities) => {
    const tbody = document.getElementById('tbody');
    const levelPrefixes = ['lp', 'p', 'hp'];
    const serviceToPrefix = {
        'Occupational Therapy': 'ot',
        'Speech Therapy': 'st',
        'Developmental Class': 'dc',
        'Shadow Class': 'sc'
    }
    const criterias = Object.keys(allActivities);

    for (var i = 0; i < criterias.length; i++) {
        const actCriteria = allActivities[criterias[i]];
        for (var j = 0; j < levelPrefixes.length; j++) {
            const actLevel = actCriteria[levelPrefixes[j]];
            const totalActs = Object.keys(actLevel);
            console.log(totalActs);
            for (var k = 1; k <= totalActs.length - 1; k++) {
                const act = actLevel[totalActs[k]];
                console.log(act);

                const identifier = `${serviceToPrefix[service]}-${i}-${j}-${k}`;

                const template = `
                <tr>
                    <td>${service}</td>
                    <td>${act.criteria}</td>
                    <td>${act.level}</td>
                    <td>${act.name}</td>
                    <td>${act.link}</td>
                    <td style="display: flex; flex-direction: row;">
                        <svg id="delete-${identifier}" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 11V17" stroke="#d63d43" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 11V17" stroke="#d63d43" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M4 7H20" stroke="#d63d43" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z" stroke="#d63d43" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#d63d43" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg id="edit-${identifier}" width="30px" height="30px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                            <path fill="#00aa69" d="M1468.214 0v564.698h-112.94V112.94H112.94v1694.092h1242.334v-225.879h112.94v338.819H0V0h1468.214Zm129.428 581.311c22.137-22.136 57.825-22.136 79.962 0l225.879 225.879c22.023 22.023 22.023 57.712 0 79.848l-677.638 677.637c-10.616 10.504-24.96 16.49-39.98 16.49h-225.88c-31.17 0-56.469-25.299-56.469-56.47v-225.88c0-15.02 5.986-29.364 16.49-39.867Zm-155.291 314.988-425.895 425.895v146.031h146.03l425.895-425.895-146.03-146.03Zm-764.714 346.047v112.94H338.82v-112.94h338.818Zm225.88-225.88v112.94H338.818v-112.94h564.697Zm734.106-315.44-115.424 115.425 146.03 146.03 115.425-115.423-146.031-146.031ZM1129.395 338.83v451.758H338.82V338.83h790.576Zm-112.94 112.94H451.759v225.878h564.698V451.77Z" fill-rule="evenodd"/>
                        </svg>
                    </td>
                </tr>
                `;

                tbody.insertAdjacentHTML('beforeend', template);

                const deleteButton = document.getElementById(`delete-${identifier}`);
                const editButton = document.getElementById(`edit-${identifier}`);

                deleteButton.addEventListener('click', () => {
                    deleteActivity(service, act.criteria, act.level, act.id);
                })

                editButton.addEventListener('click', () => {
                    editActivity(act);
                })

            }
        } 
    }
}

loadFunctions();
loadTable();