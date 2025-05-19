document.getElementById('therapist-sessions').onclick = () => {
    window.location.href = '/therapist/sessions';
}
document.getElementById('therapist-appointments').onclick = () => {
    window.location.href = '/therapist/appointments';
}
document.getElementById('therapist-patients').onclick = () => {
    window.location.href = '/therapist/patients';
}
document.getElementById('therapist-activities').onclick = () => {
    window.location.href = '/therapist/activities';
}
document.getElementById('therapist-announcements').onclick = () => {
    window.location.href = '/therapist/announcements';
}
document.getElementById('therapist-chats').onclick = () => {
    window.location.href = '/therapist/chats';
}

document.getElementById('therapist-logout').onclick = async () => {
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