const loadAllAnnouncement = async () => {
    const fetchAnnouncements = await fetch('/get-all-announcements', {
        method: 'PUT',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchAnnouncements.json();
}

const showAnnouncements = async () => {
    showLoadingScreen("Loading announcements...");
    const announcementArea = document.getElementById('announcement-area');
    const allAnnouncements = await loadAllAnnouncement();

    if (allAnnouncements.length != 0) {
        document.getElementById('empty').innerHTML = '';
    }

    announcementArea.innerHTML = '';

    for (var i = allAnnouncements.length - 1; i >= 0; i--) {
        const announcement = allAnnouncements[i];

                // <div class="announcement-image" style="background-image: url(' ${ announcement.filePath } ');"></div>

        const template = `
            <div class="announcement-item">
                <div><img src="${ announcement.filePath }"alt="" style="width: auto; height: 300px;"></div>
                <div class="announcement-details">
                    <span class="announcement-title">${ announcement.title }</span>
                    <br>
                    ${ announcement.description }
                    <br>
                    <span class="announcement-date">${ announcement.announcementDate }</span>
                </div>
            </div>
        `;

        announcementArea.insertAdjacentHTML('beforeend', template);
    }

    hideLoadingScreen();

}

showAnnouncements();