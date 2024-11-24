const generateDiv = () => {
    const existingDiv = document.getElementById('notification-bubble');
    if (!existingDiv) {
        const div = `<div id="notification-bubble" style="display: none;"></div>`;
        document.body.insertAdjacentHTML('beforeend', div);
    }
}

const showErrorNotification = (message, duration = 3000) => {
    generateDiv();
    const bubble = document.getElementById('notification-bubble');
    bubble.textContent = message;
    bubble.style.display = 'block';

    setTimeout(() => {
        bubble.style.display = 'none';
    }, duration);
}

const showSuccessNotification = (message, duration = 3000) => {
    generateDiv();
    const bubble = document.getElementById('notification-bubble');
    bubble.textContent = message;
    bubble.style.display = 'block';
    bubble.style.backgroundColor = '#6fbd3c';

    setTimeout(() => {
        bubble.style.display = 'none';
    }, duration);
}