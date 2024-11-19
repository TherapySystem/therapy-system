document.getElementById('therapist-sessions').onclick = () => {
    window.location.href = '/therapist/sessions';
}
document.getElementById('therapist-patients').onclick = () => {
    window.location.href = '/therapist/patients';
}
document.getElementById('therapist-activities').onclick = () => {
    window.location.href = '/therapist/activities';
}

document.getElementById('therapist-logout').onclick = () => {
    alert('Logging out...');
}