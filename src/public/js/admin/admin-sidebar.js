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

document.getElementById('admin-menu-home').onclick = () => {
    window.location.href = '/admin';
}
document.getElementById('admin-menu-children').onclick = () => {
    window.location.href = '/admin/children';
}
document.getElementById('admin-menu-users').onclick = () => {
    window.location.href = '/admin/users';
}
document.getElementById('admin-menu-reports').onclick = () => {
    window.location.href = '/admin/reports';
}
document.getElementById('admin-menu-logout').onclick = () => {
    alert('Logging out...');
}