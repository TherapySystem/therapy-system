const submitRegistration = document.getElementById('submit-registration');
submitRegistration.addEventListener('click', async () => {
    const firstNameChild = document.getElementById('firstNameChild').value;
    const lastNameChild = document.getElementById('lastNameChild').value;
    const middleNameChild = document.getElementById('middleNameChild').value;
    const birthDateChild = document.getElementById('birthDateChild').value;
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const middleName = document.getElementById('middleName').value;
    const birthDate = document.getElementById('birthDate').value;
    const email = document.getElementById('email').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const address = document.getElementById('address').value;


    if (firstNameChild && lastNameChild && middleNameChild && birthDateChild && username && password && firstName && lastName && middleName && birthDate && email && mobileNumber && address) {
        const response = await fetch('/register-new-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                childFirstName: firstNameChild,
                childLastName: lastNameChild,
                childMiddleName: middleNameChild,
                childBirthDate: birthDateChild,
                parentUsername: username,
                parentPassword: password,
                parentFirstName: firstName,
                parentLastName: lastName,
                parentMiddleName: middleName,
                parentBirthDate: birthDate,
                parentEmail: email,
                parentNumber: mobileNumber,
                address: address
            })
        })

        const result = await response.json();

        if (result.status == 'success') {
            showSuccessNotification(result.message);
            setTimeout(() => {
                window.location.href = "/register";
            }, 1000);
        } else {
            showErrorNotification(result.message);
        }

    } else {
        showErrorNotification("Incomplete fields");
    }

});