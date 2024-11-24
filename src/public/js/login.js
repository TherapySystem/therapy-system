document.getElementById('submit-button').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username.trim() === '' || password.trim() === '') {
        showErrorNotification('Username and password are required!');
        return
    }

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    
    if (result) {

        const { status } = result;
        if (status == 'error') {
            showErrorNotification(result.message);
        } else {
            showSuccessNotification(result.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

    } else {
        showErrorNotification('Server is unreachable!');
    }
});

