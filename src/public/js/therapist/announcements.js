const loadAllAnnouncements = async (keyword) => {
    const fetchAllAnnouncements = await fetch('/get-all-announcements', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword })
    });

    return await fetchAllAnnouncements.json();
}

const loadFunctions = async () => {
    const searchButton = document.getElementById('search-button');
    const addAnnouncementButton = document.getElementById('new-announcement');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const confirmButton = document.getElementById('confirm-button');

    searchButton.addEventListener('click', () => {
        loadTable();
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    addAnnouncementButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    confirmButton.addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const imageInput = document.getElementById('image');
        const imageFile = imageInput.files[0];

        if (!title || !description || !imageFile) {
            showErrorNotification('Fields should not be empty!');
            return;
        }

        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });

        const imageBase64 = await toBase64(imageFile);

        saveAnnouncement(title, description, imageBase64);
    });
}

const saveAnnouncement = async (title, description, image) => {
    showLoadingScreen('Saving announcement');

    const fetchSaveAnnouncement = await fetch('/save-announcement', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            description,
            image
        })
    });

    const respond = await fetchSaveAnnouncement.json();
    hideLoadingScreen();

    if (respond.status === 'success') {
        showSuccessNotification('Announcement added successfully!');
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
        loadTable();
    } else {
        showErrorNotification(respond.message);
    }

}

const removeAnnouncement = async (id) => {
    showLoadingScreen('Removing announcement...')
    const deleteAnnouncement = await fetch('/remove-announcement', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id
        })
    });

    const response = await deleteAnnouncement.json();
    hideLoadingScreen();

    if (response.status === 'success') {
        showSuccessNotification(response.message);
        loadTable();
    } else {
        showErrorNotification(response.message);
    }
};

const loadTable = async () => {
    showLoadingScreen('Loading announcements...');
    const tbody = document.getElementById('tbody');
    const keyword = document.getElementById('search-input').value;
    const allAnnouncements = await loadAllAnnouncements(keyword);

    tbody.innerHTML = '';
    
    for (var i = 0; i < allAnnouncements.length; i++) {
        const announcement = allAnnouncements[i];

        const template = `
            <tr>
                <td>
                    <img src="${ announcement.filePath }" alt="" style="width: auto; height: 200px;">
                </td>
                <td>
                    <h3>${ announcement.title }</h3>
                </td>
                <td>
                    ${ announcement.description }
                </td>
                <td>
                    ${ announcement.announcementDate }
                </td>
                <td>
                    <button id="delete-${ i }" class="delete-button">Remove</button>
                </td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', template);
        const action = document.getElementById(`delete-${ i }`);

        action.addEventListener('click', () => {
            removeAnnouncement(announcement.id);
        });
        
    }
    hideLoadingScreen();
}

loadFunctions();
loadTable();