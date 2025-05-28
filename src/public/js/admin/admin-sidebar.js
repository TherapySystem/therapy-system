// document.getElementById('children-arrow').onclick = () => {
//     const childrenSubMenu = document.getElementById('children-menu');
//     const arrow = document.getElementById('children-arrow');
//     if (childrenSubMenu.style.maxHeight == '50px' || childrenSubMenu.style.maxHeight == '') {
//         arrow.style.transform = 'rotate(180deg)';
//         childrenSubMenu.style.maxHeight = 'max-content';
//     } else {
//         childrenSubMenu.style.maxHeight = '50px';
//         arrow.style.transform = 'rotate(0deg)';
//     }
// }

// document.getElementById('admin-menu-home').onclick = () => {
//     window.location.href = '/admin';
// }
document.getElementById('admin-menu-children').onclick = () => {
    window.location.href = '/admin/children';
}
document.getElementById('admin-menu-users').onclick = () => {
    window.location.href = '/admin/users';
}
document.getElementById('admin-menu-payroll').onclick = () => {
    window.location.href = '/admin/payroll';
}
document.getElementById('admin-menu-reports').onclick = () => {
    window.location.href = '/admin/reports';
}
document.getElementById('admin-announcements').onclick = () => {
    window.location.href = '/admin/announcements';
}

document.getElementById('admin-menu-logout').onclick = async () => {
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