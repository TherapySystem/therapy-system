const loadAllUsers = async (keyword = '') => {
    const fetchUsers = await fetch('/get-all-users', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    });

    const result = await fetchUsers.json();
    return result;
};

const recordAttendance = async () => {
    const employeeItems = document.querySelectorAll('.employee-item');
    const attendanceDate = document.getElementById('attendanceDate');

    if (!attendanceDate.value) {
        showErrorNotification('Incomplete fields');
        return;
    }

    showLoadingScreen("Recording attendance...");

    const employeeAttendanceData = [];
    const prefix = 'employee-';
    
    for (var i = 0; i < employeeItems.length; i++) {
        const employeeItem = employeeItems[i];
        const id = employeeItem.id.substring(prefix.length, employeeItem.id.length);
        const isChecked = employeeItem.querySelector('input').checked;

        if (isChecked) {
            employeeAttendanceData.push({
                id,
                isChecked
            });
        }
    }
    
    const employeeAttendance = {
        attendanceDate: attendanceDate.value,
        employeeAttendanceData
    };
    
    const response = await fetch('/record-attendance', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            employeeAttendance
        })
    });

    const result = await response.json();

    if (result.status == 'success') {
        showSuccessNotification(result.message);
        const modal = document.getElementById('attendanceModal');
        modal.style.display = 'none';
    } else {
        showErrorNotification(result.message);
    }

    hideLoadingScreen();

}

const initiatePayroll = async () => {

    const regular = document.getElementById('regular');
    const special = document.getElementById('special');
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');

    if (fromDate.value || toDate.value) {
        showLoadingScreen('Initiating payroll...');
        const response = await fetch('/initiate-payroll', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                regular: regular.value,
                special: special.value,
                fromDate: fromDate.value,
                toDate: toDate.value
            })
        });

        const result = await response.json();

        if (result.status == 'success') {
            showSuccessNotification(result.message);

            regular.value = '';
            special.value = '';
            fromDate.value = '';
            toDate.value = '';

            const modal = document.getElementById('modal');
            modal.style.display = 'none';
        } else {
            showErrorNotification(result.message);
        }
        hideLoadingScreen();
        loadTable();
    } else {
        showErrorNotification('Incomplete fields');
    }
}

// const editUser = async (id) => {
//     const modal = document.getElementById('modal');
//     modal.style.display = 'block';

//     const name = document.getElementById('name');
//     const username = document.getElementById('username');
//     const password = document.getElementById('password');
//     const role = document.getElementById('role');
// }

const loadFunctions = async () => {
    const initiatePayrollButton = document.getElementById('initiatePayroll');
    const attendance = document.getElementById('attendance');
    const searchButton = document.getElementById('search-button');
    
    const attendanceModal = document.getElementById('attendanceModal');
    const closeAttendance =  document.querySelector(".closeAttendance");
    const recordButton = document.getElementById('record-button');

    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector(".close");
    const submitButton = document.getElementById('submit-button');

    initiatePayrollButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    attendance.addEventListener('click', () => {
        attendanceModal.style.display = 'block';
    })
     
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
        attendanceModal.style.display = "none";
    });
     
    closeAttendance.addEventListener("click", () => {
        attendanceModal.style.display = "none";
    });

    submitButton.addEventListener('click', () => {
        initiatePayroll();
    });

    recordButton.addEventListener('click', () => {
        recordAttendance();
    });
    
    searchButton.addEventListener('click', () => {
        loadTable();
    });
    
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    return formattedDate;
}

const loadTable = async () => {
    showLoadingScreen("Loading users...");
    const tbody = document.getElementById('tbody');
    const employeeContent = document.getElementById('employee-content');
    const keyword = document.getElementById('search-input').value;
    const allUsers = await loadAllUsers(keyword.trim());

    tbody.innerHTML = '';
    employeeContent.innerHTML = '';

    for(var i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const template = `<tr id="user-${ user.id }">
            <td id="users-id">${ user.id }</td>
            <td id="users-name">${ user.name }</td>
            <td id="users-salary">${ user.salary ? "Php " + user.salary : 'No salary yet' }</td>
            <td id="users-date-coverage">${ user.coverageDate ? formatDate(user.coverageDate.substring(0, 10)) + ' - ' +  formatDate(user.coverageDate.substring(13)) : '' }</td>
        </tr>`;

        const attendanceTemplate = `
                <div class="employee-item" id="employee-${ user.id }">
                    <input type="checkbox" id="checkPresent" name="checkPresent" checked>
                    <label for="checkPresent">${ user.name }</label>
                </div>`;


        tbody.insertAdjacentHTML('beforeend', template);
        employeeContent.insertAdjacentHTML('beforeend', attendanceTemplate);
    }
    hideLoadingScreen();
};

loadFunctions();
loadTable();