const express = require('express');
const path = require('path');
const app = express();

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

app.listen(PORT, () => {
    console.log(`Server starting at http://localhost:${ PORT }`);
})