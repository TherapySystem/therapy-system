const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

const db = require('./fb_config/fb_config');
const enrollApi = require('./apis/enroll');
const accountsApi = require('./apis/accounts');
// const childrenApi = require('./apis/children');
// const appointmentsApi = require('./apis/appointments');
// const sessionsApi = require('./apis/sessions');
// const reportsApi = require('./apis/reports');
// const vacanciesApi = require('./apis/vacancies');

const { verifyToken, noToken } = require('./middleware/jwt_verifier');

const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

const publicPath = path.resolve(__dirname, './public');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded());
app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin', 'http://localhost:${ PORT }`);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

app.use(express.static(publicPath));


app.get('/', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/home.html'));
})

app.get('/login', noToken, async (req, res) => {
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

app.get('/unauthorized', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/unauthorized.html'));
})

// ADMIN
app.get('/admin', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/home.html'));
})

app.get('/admin/children', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/children.html'));
})

app.get('/admin/users', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/users.html'));
})

app.get('/admin/reports', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/reports.html'));
})

// SECRETARY
app.get('/secretary', verifyToken('secretary'), async (req, res) => {
    res.redirect('/secretary/children');
})

app.get('/secretary/children', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/children.html'));
})

app.get('/secretary/enrollees', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/enrollees.html'));
})

app.get('/secretary/appointments', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/appointments.html'));
})

app.get('/secretary/sessions', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/sessions.html'));
})

// THERAPIST
app.get('/therapist', verifyToken('therapist'), async (req, res) => {
    res.redirect('/therapist/sessions');
})

app.get('/therapist/sessions', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/sessions.html'));
});

app.get('/therapist/patients', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/patients.html'));
});

app.get('/therapist/activities', verifyToken('therapist'), async (req, res) => {
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

app.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.send({
        status: 'success',
        message: 'Logout successfully!'
    });
});

app.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body;

    if (username && password) {

        var user;

        if (username == 'admin' && password == 'admin') {
            user = { id: 0, role: 'admin', name: 'admin' };
        } else {
            const account = await accountsApi.checkAccount(username, password);
            if (account) {
                user = { id: account.id, role: account.role, name: account.name };
            }
        }

        if (user) {
            const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });

            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
            return res.send({
                status: 'success',
                message: 'Login successful!'
            });
        }
    }

    res.send({
        status: 'error',
        message: 'Username or password is not found in the database'
    });
});

// Admin
app.put('/get-all-users', async (req, res) => {
    const { keyword } = req.body;
    const users = await accountsApi.getFilterAccountsByKeyword(keyword);
    res.send(users);
});

function generateUniqueId(prefix) {
    const now = new Date();
    const uniqueId = `${prefix}${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}` +
                     `-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}` +
                     `-${now.getMilliseconds().toString().padStart(3, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    return uniqueId;
}

app.listen(PORT, async () => {
    console.log(`Server starting at http://localhost:${ PORT }`);
})