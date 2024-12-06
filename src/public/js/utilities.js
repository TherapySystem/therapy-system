const generateDiv = () => {
    const existingDiv = document.getElementById('notification-bubble');
    if (!existingDiv) {
        const div = `<div id="notification-bubble" style="display: none;"></div>`;
        document.body.insertAdjacentHTML('beforeend', div);
    }
}

const generateLoadingDialog = (message) => {
    const existingDialog = document.getElementById('loadingDialog');
    if (!existingDialog) {
        const div = `
        <div id="loadingDialog">
            <div class="content">
            <img class="loading-icon" src="/svg/loading.svg"><p>${message}</p>
            </div>
        </div>`;
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

const showLoadingScreen = (message) => {
    generateLoadingDialog(message);
    const loadingDialog = document.getElementById('loadingDialog');
    loadingDialog.style.display = 'flex';
}

const hideLoadingScreen = () => {
    const loadingDialog = document.getElementById('loadingDialog');
    loadingDialog.style.display = 'none';
}