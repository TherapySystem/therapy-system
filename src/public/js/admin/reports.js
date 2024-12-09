const getReports = async () => {
    const fetchReports = await fetch('/get-reports', {
        method: 'GET',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        }
    });

    return await fetchReports.json();
}

const loadReports = async () => {
    showLoadingScreen("Loading reports...");
    const reports = await getReports();
    const { totalAccounts, totalTherapists, totalChildren, totalEnrollees, totalBillingAmount } = reports;
    const reportHeaders = document.querySelector('.report-headers');

    const template = `
    <div class="report-item">
        <h3>${ totalAccounts }</h3>
        <h4>Accounts</h4>
    </div>
    <div class="report-item">
        <h3>${ totalTherapists }</h3>
        <h4>Therapists</h4>
    </div>
    <div class="report-item">
        <h3>${ totalChildren }</h3>
        <h4>Enrolled Children</h4>
    </div>
    <div class="report-item">
        <h3>${ totalEnrollees }</h3>
        <h4>Unenrolled Children</h4>
    </div>
    <div class="report-item">
        <h3>${ Number(totalBillingAmount) }</h3>
        <h4>Total Billed Amount</h4>
    </div>`;

    reportHeaders.insertAdjacentHTML('beforeend', template);
    hideLoadingScreen();
}

loadReports();