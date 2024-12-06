
document.getElementById('secretary-children').onclick = () => {
    window.location.href = '/secretary/children';
}

document.getElementById('secretary-enrollees').onclick = () => {
    window.location.href = '/secretary/enrollees';
}

document.getElementById('secretary-appointments').onclick = () => {
    window.location.href = '/secretary/appointments';
}

document.getElementById('secretary-sessions').onclick = () => {
    window.location.href = '/secretary/sessions';
}

document.getElementById('secretary-logout').onclick = async () => {
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