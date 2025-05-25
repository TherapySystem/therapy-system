const submitRegistration = document.getElementById('submit-registration');
const confirmPassword = document.getElementById('confirmPassword');
const realPassword = document.getElementById('password');
let validPassword = false;

realPassword.addEventListener('input', (event) => {
    const confirmValue = confirmPassword.value;
    const input = event.target.value;

    validPassword = confirmValue == input;
    if (!validPassword) {
        confirmPassword.classList.add('wrong-password');
    } else {
        confirmPassword.classList.remove('wrong-password');
    }
});
confirmPassword.addEventListener('input', (event) => {
    const password = document.getElementById('password').value;
    const input = event.target.value;

    validPassword = password == input;
    if (!validPassword) {
        confirmPassword.classList.add('wrong-password');
    } else {
        confirmPassword.classList.remove('wrong-password');
    }
});

submitRegistration.addEventListener('click', async () => {
    const firstNameChild = document.getElementById('firstNameChild').value;
    const lastNameChild = document.getElementById('lastNameChild').value;
    const middleNameChild = document.getElementById('middleNameChild').value;
    const birthDateChild = document.getElementById('birthDateChild').value;
    const gender = document.getElementById('gender').value;
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const middleName = document.getElementById('middleName').value;
    const birthDate = document.getElementById('birthDate').value;
    const email = document.getElementById('email').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    const address = document.getElementById('address').value;

    const terms = document.getElementById('terms').checked;

    if (validPassword && firstNameChild && lastNameChild && middleNameChild && birthDateChild && username && password && firstName && lastName && middleName && birthDate && gender && email && mobileNumber && address) {
        if (!terms) {
            showErrorNotification("Please agree to the terms and conditions");
            return;
        }
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
                childGender: gender,
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

            var modal = document.getElementById("myModal");
            var span = document.getElementsByClassName("close")[0];

            modal.style.display = "block";
            span.onclick = function() {
                window.location.href = "/register";
            }
        } else {
            showErrorNotification(result.message);
        }

    } else {
        showErrorNotification("Incomplete fields");
    }

});