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

const setBillingFunction = async (billingId, isApprove) => {
    showLoadingScreen("Adding new billing...");
    const fetchSetBilling = await fetch('/billing-status', {
        method: 'POST',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            billingId,
            status: isApprove ? 'Approved' : 'Declined'
        })
    });

    const response = await fetchSetBilling.json();
    hideLoadingScreen();

    if (response.status === 'success') {
        showSuccessNotification('Billing status changed successfully!');
    } else {
        showErrorNotification(response.message);
    }
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
            <td>${ billing.paymentDate }</td>
            <td>${ billing.paymentType == 'Online Transfer' ? billing.walletType : billing.paymentType }</td>
            <td ${ billing.paymentType == 'Online Transfer' ? `id="paymentType-${billing.id}"` : '' }>${ billing.walletType ? billing.referenceCode : 'N/A' }</td>
            <td>${ 
                billing.status == 'Approved' ? 'Approved' : 
                billing.status == 'Declined' ? 'Declined' : 
                billing.status == 'Pending' ? `<span id="action-${ billing.id }">
                    <svg class="svg-buttons" id="approve-billing-${ billing.id }" width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#20794c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg class="svg-buttons" id="decline-billing-${ billing.id }" width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#910706"/>
                    </svg>
                </span>` : `N/A`
             }</td>
        </tr>`;
        
        tbody.insertAdjacentHTML('beforeend', template);

        if (billing.paymentType == 'Online Transfer') {
            const paymentType = document.getElementById(`paymentType-${ billing.id }`);
            paymentType.addEventListener('click', () => {
                console.log('billing: ', billing.billingImage);
            });
        }

        if (billing.status == 'Pending') {
            const approveBilling = document.getElementById(`approve-billing-${ billing.id }`);
            const declineBilling = document.getElementById(`decline-billing-${ billing.id }`);
            const actionBilling = document.getElementById(`action-${ billing.id }`);
            
            approveBilling.addEventListener('click', async () => {
                await setBillingFunction(billing.id, true);
                actionBilling.innerHTML = 'Approved';
            });

            declineBilling.addEventListener('click', async () => {
                await setBillingFunction(billing.id, false);
                actionBilling.innerHTML = 'Declined';
            });
        }

    }
    hideLoadingScreen();
}

loadFunctions();
loadTable();