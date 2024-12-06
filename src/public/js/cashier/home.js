const loadBillings = async (keyword = '') => {
    const fetchBillings = await fetch('/get-all-billings', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchBillings.json();
}

const loadChildren = async (keyword = '') => {
    const fetchChildren = await fetch('/get-all-children', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });
    
    return await fetchChildren.json();
}

const addNewBilling = async () => {
    const childSelection = document.getElementById('child');
    const amountInput = document.getElementById('amount');
    const paymentDate = document.getElementById('paymentDate');

    console.log(paymentDate.value);

    if (!childSelection.value || !amountInput.value || !paymentDate.value) {
        showErrorNotification('Please fill out all fields');
        return;
    }

    const date = new Date(paymentDate.value);

    const options = { 
        month: 'long', 
        day: '2-digit', 
        year: 'numeric'
    };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date).replace(',', '');

    showLoadingScreen("Adding new billing...");
    const fetchSaveBilling = await fetch('/save-billing', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            childId: childSelection.value, 
            amount: amountInput.value, 
            paymentDate: formattedDate
        })
    });

    const response = await fetchSaveBilling.json();
    hideLoadingScreen();

    if (response.status === 'success') {
        showSuccessNotification('New billing added!');
        childSelection.value = '';
        amountInput.value = '';
        paymentDate.value = '';
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        loadTable();
    } else {
        showErrorNotification(response.message);
    }
}

const loadFunctions = async () => {
    showLoadingScreen("Loading data...");
    const newBilling = document.getElementById('new-billing');
    const searchButton = document.getElementById('search-button');
    const confirmButton = document.getElementById('confirm-button');
    const childSelection = document.getElementById('child');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    newBilling.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    searchButton.addEventListener('click', () => {
        loadTable();
    });
    confirmButton.addEventListener('click', () => {
        addNewBilling();
    });

    const allChildren = await loadChildren();
    childSelection.insertAdjacentHTML('beforeend', `<option value="" disabled selected hidden>Choose a Child</option>`);
    for (var i = 0; i < allChildren.length; i++) {
        const childObj = allChildren[i];
        childSelection.insertAdjacentHTML('beforeend', `<option value="${ childObj.id }">${ childObj.childFirstName } ${ childObj.childMiddleName } ${ childObj.childLastName }</option>`);
    }

    hideLoadingScreen();
}

const loadTable = async () => {
    showLoadingScreen('Loading billings...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allBillings = await loadBillings(keyword);

    tbody.innerHTML = '';
    
    for (var i = 0; i < allBillings.length; i++) {
        const billing = allBillings[i];
        const template = `
        <tr id="billing-${ billing.id }">
            <td>${ billing.child.childFirstName } ${ billing.child.childMiddleName } ${ billing.child.childLastName }</td>
            <td>${ billing.child.parentFirstName } ${ billing.child.parentMiddleName } ${ billing.child.parentLastName }</td>
            <td>Php ${ billing.amount }</td>
            <td>${ billing.paymentDate }
        </tr>`;
        tbody.insertAdjacentHTML('beforeend', template);
    }
    hideLoadingScreen();
}

loadFunctions();
loadTable();