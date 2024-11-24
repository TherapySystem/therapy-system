const loadAllUsers = async (keyword = '') => {
    const fetchUsers = await fetch('/get-all-users', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword })
    })

    const result = await fetchUsers.json();
    return result;
};

const loadTable = async () => {
    const table = document.getElementById('users-table');
    const keyword = document.getElementById('search-input').value;
    const allUsers = await loadAllUsers(keyword.trim());
    console.log(allUsers);
};

loadTable();