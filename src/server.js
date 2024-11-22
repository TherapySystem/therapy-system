const express = require('express');
const path = require('path');
const db = require('./fb_config/fb_config');
const app = express();

const enrollApi = require('./apis/enroll');

const PORT = 3000;


const publicPath = path.resolve(__dirname, './public');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(publicPath));

app.get('/', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/home.html'));
})

app.get('/login', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/login.html'));
})

app.get('/vacancies', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/vacancies.html'));
})

app.get('/about-us', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/about_us.html'));
})

app.get('/register', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/register.html'));
})

// ADMIN

app.get('/admin', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/home.html'));
})

app.get('/admin/children', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/children.html'));
})

app.get('/admin/users', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/users.html'));
})

app.get('/admin/reports', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/reports.html'));
})

// SECRETARY
app.get('/secretary/children', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/children.html'));
})

app.get('/secretary/enrollees', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/enrollees.html'));
})

app.get('/secretary/appointments', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/appointments.html'));
})

app.get('/secretary/sessions', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/sessions.html'));
})

// THERAPIST
app.get('/therapist/sessions', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/sessions.html'));
});

app.get('/therapist/patients', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/patients.html'));
});

app.get('/therapist/activities', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/activities.html'));
});

// Home
app.post('/register-new-patient', async (req, res) => {
    console.log('Registering new patient...');
    const {
        childFirstName,
        childLastName,
        childMiddleName,
        childBirthDate,
        parentUsername,
        parentPassword,
        parentFirstName,
        parentLastName,
        parentMiddleName,
        parentBirthDate,
        parentEmail,
        parentNumber,
        address
    } = req.body;

    const enrolleeInformation = {
        id: generateUniqueId('E'),
        childFirstName,
        childLastName,
        childMiddleName,
        childBirthDate,
        parentUsername,
        parentPassword,
        parentFirstName,
        parentLastName,
        parentMiddleName,
        parentBirthDate,
        parentEmail,
        parentNumber,
        address
    };

    console.log('Enrollee Information: ', enrolleeInformation);

    if (await enrollApi.addEnrollee(enrolleeInformation)) {
        console.log('Result: success');
        res.redirect('/register')
    } else {
        console.log('Result: failed');
        res.send({
            status: 'error',
            message: 'Something went wrong, try again later'
        });
    }
});

app.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body;

    if (username && password) {
        if (username == 'admin' && password == 'admin') {
            
        }
    }

    res.send({
        status: 'error',
        message: 'Username or password is not found in the database'
    });
});

function generateUniqueId(prefix) {
    const now = new Date();
    const uniqueId = `${prefix}${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}` +
                     `-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}` +
                     `-${now.getMilliseconds().toString().padStart(3, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    return uniqueId;
}

app.listen(PORT, () => {
    console.log(`Server starting at http://localhost:${ PORT }`);
})