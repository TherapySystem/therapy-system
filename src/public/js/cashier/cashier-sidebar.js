document.getElementById('cashier-logout').onclick = async () => {
    const response = await fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    });

    const result = await response.json();
    
    if (result) {
        const { status } = result;
        if (status == 'success') {
            showSuccessNotification(result.message);
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000);
        }
    } else {
        showErrorNotification('Something went wrong');
        window.location.href = '/login';
    }
}