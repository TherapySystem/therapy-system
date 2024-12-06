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

const addUser = async () => {
    const name = document.getElementById('name');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const role = document.getElementById('role');

    if (name.value || username.value || password.value || role.value) {
        showLoadingScreen('Adding user...');
        const response = await fetch('/add-user', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: name.value,
                username: username.value,
                password: password.value,
                role: role.value
            })
        });
        const result = await response.json();
        console.log(result);
        if (result.status == 'success') {
            showSuccessNotification(result.message);
            name.value = '';
            username.value = '';
            password.value = '';
            role.value = '';
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

const deleteUser = async (id) => {
    showLoadingScreen('Deleting user...');
    const response = await fetch('/delete-user', {
        method: 'DELETE',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id
        })
    });
    const result = await response.json();
    if (result.status == 'success') {
        showSuccessNotification(result.message);
    } else {
        showErrorNotification(result.message);
    }
    hideLoadingScreen();
    loadTable();
}

const loadFunctions = async () => {
    const addButton = document.getElementById('add-user');
    const searchButton = document.getElementById('search-button');

    const closeBtn = document.querySelector(".close");
    const submitButton = document.getElementById('submit-button');

    addButton.addEventListener('click', () => {
        const modal = document.getElementById('modal');
        modal.style.display = 'block';
    });
     
    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    submitButton.addEventListener('click', () => {
        addUser();
    });
    
    searchButton.addEventListener('click', () => {
        loadTable();
    });
    
}

const loadTable = async () => {
    showLoadingScreen("Loading users...");
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allUsers = await loadAllUsers(keyword.trim());

    tbody.innerHTML = '';

    for(var i = 0; i < allUsers.length; i++) {
        const user = allUsers[i];
        const template = `<tr id="user-${ user.id }">
            <td id="users-id">${ user.id }</td>
            <td id="users-name">${ user.name }</td>
            <td id="users-role">${ user.role }</td>
            <td id="users-action">
                <!-- <svg id="action-edit-${ user.id }" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7M11.9999 21.5L14.025 21.095C14.2015 21.0597 14.2898 21.042 14.3721 21.0097C14.4452 20.9811 14.5147 20.9439 14.579 20.899C14.6516 20.8484 14.7152 20.7848 14.8426 20.6574L21.5 14C22.0524 13.4477 22.0523 12.5523 21.5 12C20.9477 11.4477 20.0523 11.4477 19.5 12L12.8425 18.6575C12.7152 18.7848 12.6516 18.8484 12.601 18.921C12.5561 18.9853 12.5189 19.0548 12.4902 19.1278C12.458 19.2102 12.4403 19.2984 12.405 19.475L11.9999 21.5ZM13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg> -->
                <svg id="action-delete-${ user.id }" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 18H22M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M12 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </td>
        </tr>`


        tbody.insertAdjacentHTML('beforeend', template);
        const editButton = document.getElementById(`action-edit-${ user.id }`);
        const deleteButton = document.getElementById(`action-delete-${ user.id }`);

        // editButton.addEventListener('click', () => {
        //     editUser(user.id);
        // });

        deleteButton.addEventListener('click', () => {
            deleteUser(user.id);
        });
    }
    hideLoadingScreen();
};

loadFunctions();
loadTable();