// CREDENTIALS
// TherapySystem123@gmail.com
// TherapySystem12345

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const moment = require('moment');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const db = require('./fb_config/fb_config');
const enrollApi = require('./apis/enroll');
const accountsApi = require('./apis/accounts');
const childrenApi = require('./apis/children');
const sessionsApi = require('./apis/sessions');
const appointmentsApi = require('./apis/appointments');
const billingApi = require('./apis/billings');
const servicesApi = require('./apis/services');
const activitiesApi = require('./apis/activities');
const snapshotParser = require('./apis/snapshotParser');
// const reportsApi = require('./apis/reports');
// const vacanciesApi = require('./apis/vacancies');
const chatsApi = require('./apis/chats');
const announcementApi = require('./apis/announcements');
const notifsApi = require('./apis/notifications');

const { verifyToken, noToken } = require('./middleware/jwt_verifier');

const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY;

const publicPath = path.resolve(__dirname, './public');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded(({ extended: true, limit: '10mb' })));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
    res.header(`Access-Control-Allow-Origin', 'http://localhost:${ PORT }`);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

app.use(express.static(publicPath));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    filename: (req, file, cb) => {
        const childId = req.params.childId || 'unknown';
        const today = moment().format('YYYYMMDD');
        const filename = req.params.profileName ? req.params.profileName : `${childId}_${today}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

io.on('connection', async (socket) => {
    socket.on('joinRoom', async ({ therapistId, childId }) => {
        const chatRoom = `${ therapistId }_${ childId }`;
        socket.join(chatRoom);
        const chats = await chatsApi.getChats(chatRoom);
        socket.emit('loadMessages', chats);
    })

    socket.on('sendMessage', async ({ therapistId, childId, message, senderId }) => {
        const chatRoom = `${ therapistId }_${ childId }`;
        const messageData = {
            chatRoomId: chatRoom,
            message,
            timeStamp: getFormattedDateTime(),
            senderId
        };

        await chatsApi.addChat(messageData);
        io.to(chatRoom).emit('receiveMessage', messageData);
    })
})

app.post('/image-upload/:childId', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    console.log("file: ", req.file);

    const childId = req.params.childId || 'unknown';
    const today = moment().format('YYYYMMDD');
    const filename = `${childId}_${today}${path.extname(req.file.originalname)}`;

    console.log("Upload success! filename: ", filename);
    
    res.send({
        message: 'File uploaded successfully',
        filename: req.file.filename
    });
});

app.get('/', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/home.html'));
})

app.get('/login', noToken, async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/login.html'));
})

app.get('/announcements', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/announcements.html'));
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

app.get('/terms-and-conditions', async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/terms_and_conditions.html'));
})

// ADMIN
app.get('/admin', verifyToken(''), async (req, res) => {
    if (req.user.role == 'secretary') {
        return res.redirect('/secretary');
    } else if (req.user.role == 'therapist') {
        return res.redirect('/therapist');
    } else if (req.user.role == 'cashier') {
        return res.redirect('/cashier');
    }
    // res.sendFile(path.join(publicPath, '../views/admin/home.html'));
    res.redirect('/admin/children');
})

app.get('/admin/children', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/children.html'));
})

app.get('/admin/users', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/users.html'));
})

app.get('/admin/payroll', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/payroll.html'));
})

app.get('/admin/reports', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/reports.html'));
})

app.get('/admin/announcements', verifyToken('admin'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/admin/announcements.html'));
});

// CASHIER
app.get('/cashier', verifyToken('cashier'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/cashier/home.html'));
})

// SECRETARY
app.get('/secretary', verifyToken('secretary'), async (req, res) => {
    res.redirect('/secretary/enrollees');
})

app.get('/secretary/enrollees', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/enrollees.html'));
})

app.get('/secretary/children', verifyToken('secretary'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/secretary/children.html'));
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

app.get('/therapist/appointments', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/appointments.html'));
});

app.get('/therapist/patients', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/patients.html'));
});


app.get('/therapist/chats', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/chats.html'));
});

app.get('/therapist/activities', verifyToken('therapist'), async (req, res) => {
    res.sendFile(path.join(publicPath, '../views/therapist/activities.html'));
});

// Application
app.post('/child-login', async (req, res) => {
    const { username, password } = req.body;
    const child = await childrenApi.checkChildCredentials(username, password);

    if (child) {
        res.send(child.id);
    } else {
        const enrollee = await enrollApi.checkChildCredentials(username, password);
        if (enrollee) {
            res.send('Pending');
        } else {
            res.send('Not found');
        }
    }

});

app.put('/get-child-sessions', async (req, res) => {
    const { childId } = req.body;
    const childSessions = await sessionsApi.getSessionsByChild(childId);
    res.send(childSessions);
});

app.put('/get-child-appointments', async (req, res) => {
    const { childId } = req.body;
    const childAppointments = await appointmentsApi.getAppointmentsByChild(childId);
    res.send(childAppointments);
});

app.put('/get-child-billings', async (req, res) => {
    const { childId } = req.body;
    const childBillings = await billingApi.getBillingsByChild(childId);
    res.send(childBillings);
});

app.put('/get-child-by-id', async (req, res) => {
    const { childId } = req.body;
    const childInfo = snapshotParser.snapshotParseObject(await childrenApi.getChildById(childId));
    console.log(childInfo);
    const therapistInfo = snapshotParser.snapshotParseObject(await accountsApi.getAccountById(childInfo.therapistId));
    childInfo.therapistName = therapistInfo.name;
    res.send(childInfo);
});

app.put('/get-child-profile', async (req, res) => {

});

app.post('/set-child-profile/:profileName', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

});

// Home
app.post('/register-new-patient', async (req, res) => {
    console.log('Registering new patient...');
    const {
        childFirstName,
        childLastName,
        childMiddleName,
        childBirthDate,
        childGender,
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
        childGender,
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
    const response = await enrollApi.addEnrollee(enrolleeInformation);

    var customResponse = {};

    if (response) {
        customResponse = {
            status: 'success',
            message: 'Patient registered successfully!'
        }
    } else {
        customResponse = {
            status: 'error',
            message: 'Something went wrong, try again later'
        }
    }

    console.log(customResponse);

    res.send(customResponse);
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

app.post('/add-user', async (req, res) => {
    const { name, username, password, role } = req.body;
    const response = await accountsApi.addUser(generateUniqueId('U'), name, username, password, role);

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'User added successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.delete('/delete-user', async (req, res) => {
    const { id } = req.body;
    const response = await accountsApi.deleteUser(id);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'User deleted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    res.send(returnResponse);
});

app.post('/record-attendance', async (req, res) => {
    const { employeeAttendance } = req.body;

    const response = await accountsApi.recordAttendanceByBulk(employeeAttendance);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Attendance was recorded successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    res.send(returnResponse);
    
});

app.post('/initiate-payroll', async (req, res) => {
    const { regular, special, fromDate, toDate } = req.body;

    const response = await accountsApi.generatePayroll(regular, special, fromDate, toDate);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Payroll is successfully processed!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.get('/get-reports', async (req, res) => {
    const accounts = await accountsApi.getAllAccounts();
    const children = await childrenApi.getAllChildren();
    const enrollees = await enrollApi.getAllEnrollees();
    const therapists = await accountsApi.getAllAccounts('therapist');

    const billingAmount = await billingApi.getAllBillingAmount();

    const returnObj = {
        totalAccounts: accounts.length,
        totalTherapists: therapists.length,
        totalChildren: children.length,
        totalEnrollees: enrollees.length,
        totalBillingAmount: billingAmount,
    };

    res.send(returnObj);
});

app.get('/get-chart-reports', async (req, res) => {
    const response = {
        "sales" : await billingApi.getBillingsMonthlySales(),
        "enrollees": await childrenApi.getMonthlyEnrollees(),
        "services": await childrenApi.getServiceEnrollees()
    }

    res.send(response);
});

app.put('/get-summary-report', async (req, res) => {

    const { fromDate, toDate } = req.body;

    const children = await childrenApi.getAllChildren();
    const enrollees = await enrollApi.getAllEnrollees();
    const billingAmount = await billingApi.getAllBillingAmount();
    const servicesByGender = await childrenApi.getServiceEnrolleesByGender(fromDate, toDate);

    const fromDateOrig = fromDate;
    const toDateOrig = toDate;

    // const isDateInRange = (targetDateStr) => {
    //     const fromDateStr = fromDateOrig;
    //     const toDateStr = toDateOrig;

    //     const monthMap = {
    //         Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    //         Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    //     };

    //     const [fromMonthStr, fromYearStr] = fromDateStr.split(' ');
    //     const [toMonthStr, toYearStr] = toDateStr.split(' ');

    //     const fromDate = new Date(parseInt(fromYearStr), monthMap[fromMonthStr], 1);
    //     const toDate = new Date(parseInt(toYearStr), monthMap[toMonthStr] + 1, 0);

    //     const year = parseInt(targetDateStr.slice(0, 4));
    //     const month = parseInt(targetDateStr.slice(4, 6)) - 1;
    //     const day = parseInt(targetDateStr.slice(6, 8));
    //     const targetDate = new Date(year, month, day);

    //     return targetDate >= fromDate && targetDate <= toDate;
    // }

    const isDateInRange = (targetDateStr) => {
        const fromDate = new Date(fromDateOrig);
        const toDate = new Date(toDateOrig);

        const year = parseInt(targetDateStr.slice(0, 4));
        const month = parseInt(targetDateStr.slice(4, 6)) - 1;
        const day = parseInt(targetDateStr.slice(6, 8));
        const targetDate = new Date(year, month, day);

        return targetDate >= fromDate && targetDate <= toDate;
    }

    const summaryReport = {
        enrolledMale: 0,
        enrolledFemale: 0,
        pendingMale: 0,
        pendingFemale: 0,
        speechMale: servicesByGender['Speech Therapy']['male'],
        speechFemale:  servicesByGender['Speech Therapy']['female'],
        occupationalMale: servicesByGender['Occupational Therapy']['male'],
        occupationalFemale: servicesByGender['Occupational Therapy']['female'],
        developmentalMale: servicesByGender['Developmental Class']['male'],
        developmentalFemale: servicesByGender['Developmental Class']['female'],
        shadowMale: servicesByGender['Shadow Class']['male'],
        shadowFemale: servicesByGender['Shadow Class']['female'],
        totalSales: billingAmount
    }

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        const firstIdPart = child.id.split("-")[0];
        const date = firstIdPart.substring(1);

        if (!isDateInRange(date)) {
            continue;
        }
        console.log(child);
        if (child.childGender == 'male' || child.childGender == 'Male') {
            summaryReport.enrolledMale++;
        } else if (child.childGender == 'female' || child.childGender == 'Female') {
            summaryReport.enrolledFemale++;
        }
        console.log({
            male: summaryReport.enrolledMale,
            female: summaryReport.enrolledFemale
        });
    }

    for (let i = 0; i < enrollees.length; i++) {
        const enrollee = enrollees[i];

        const firstIdPart = enrollee.id.split("-")[0];
        const date = firstIdPart.substring(1);

        if (!isDateInRange(date)) {
            continue;
        }

        if (enrollee.childGender == 'male' || child.childGender == 'Male') {
            summaryReport.pendingMale++;
        } else if (enrollee.childGender == 'female' || child.childGender == 'Female') {
            summaryReport.pendingFemale++;
        }

    }

    res.send({summaryReport});
});

// Cashier

app.put('/get-billing-image', (req, res) => {
    const { imageName } = req.body;
    const imagePath = path.join(__dirname, '../uploads', `${ imageName }.jpg`);

    console.log('imageName', imageName);
    console.log('imagePath', imagePath);

    const uploadsDir = path.join(__dirname, '../uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
          console.error('Error reading the directory:', err);
        } else {
          console.log('Contents of uploads directory:', files);
        }
    })

    res.sendFile(imagePath, (err) => {
        if (err) {
            console.log('err: ', err);
            res.send('Error sending image');
        }
    });
});

app.put('/get-all-billings', async (req, res) => {
    const { keyword } = req.body;
    const allBillings = await billingApi.getAllBillings(keyword);
    res.send(allBillings);
});

app.post('/save-billing', async (req, res) => {
    const { childId, amount, paymentDate, validSession } = req.body;

    const billingInfo = {
        id: generateUniqueId('B'),
        childId, 
        amount, 
        paymentDate,
        billingType: 'Onsite Payment',
        status: 'Approved',
        validSession
    };

    const response = await billingApi.saveBilling(billingInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Billing added successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/submit-payment', async (req, res) => {
    const { referenceCode, amount, walletType, childId, validSession } = req.body;

    const today = moment().format('YYYYMMDD');
    const filename = `${childId}_${today}`;

    const id = generateUniqueId('B');

    const billingInfo = {
        id,
        childId,
        amount,
        paymentDate: moment().format('MMMM DD YYYY'),
        billingType: 'Online Transfer',
        referenceCode,
        walletType,
        billingImage: filename,
        status: 'Pending',
        validSession: validSession ? validSession : 0
    };

    const response = await billingApi.saveBilling(billingInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Billing added successfully!';
        returnResponse.id = id;
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/billing-status', async (req, res) => {
    const { billingId, status, validSession, childId } = req.body;

    await notifsApi.saveNotif({
        id: generateUniqueId('N'),
        childId,
        isAccepted: status == 'Approved',
        type: 'payment'
    })

    const returnResponse = {};
    
    if (status == 'Approved' || status == 'Declined') {
        const response = await billingApi.setBillingStatus(billingId, status, validSession);
    
        if (response) {
            returnResponse.status = 'success';
            returnResponse.message = 'Billing status successfully changed!';
        } else {
            returnResponse.status = 'error';
            returnResponse.message = 'Something went wrong, try again later';
        }
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Invalid status';
    }

    res.send(returnResponse);
});

// Secretary
app.put('/get-all-enrollees', async (req, res) => {
    const { keyword } = req.body;
    const allEnrollees = await enrollApi.getAllEnrollees(keyword);
    res.send(allEnrollees);
});

app.put('/get-all-children', async (req, res) => {
    const { keyword, therapistId } = req.body;

    if (therapistId) {
        const therapistChildren = await childrenApi.getChildrenByTherapist('', therapistId);
        res.send(therapistChildren);
        return;
    }

    const allChildren = await childrenApi.getAllChildren(keyword);
    res.send(allChildren);
});

app.put('/get-all-therapist', async (req, res) => {
    const{ keyword } = req.body;
    const allTherapist = await accountsApi.getFilterAccountsByKeyword(keyword, 'therapist');
    res.send(allTherapist);
});

app.put('/get-all-sessions', async (req, res) => {
    const { keyword } = req.body;
    const allSessions = await sessionsApi.getSessions(keyword);
    res.send(allSessions);
});

app.put('/get-all-appointments', async (req, res) => {
    const { keyword } = req.body;
    const allAppointments = await appointmentsApi.getAppointments(keyword);
    res.send(allAppointments);
});

app.post('/enrollee-accept', async (req, res) => {
    const { id, service, therapistId } = req.body;
    const response = await enrollApi.acceptEnrollee(id, service, therapistId);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Enrollee accepted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/enrollee-reject', async (req, res) => {
    const { id } = req.body;
    const response = await enrollApi.rejectEnrollee(id);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Enrollee rejected successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(returnResponse);
});

app.delete('/child-delete', async (req, res) => {
    const { id } = req.body;
    const response = await childrenApi.removeChild(id);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Child deleted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
})

app.post('/save-session', async (req, res) => {
    const { therapistId, childId, sessionDateTime } = req.body;
    const sessionInfo = {
        id: generateUniqueId('S'), 
        therapistId, 
        childId, 
        sessionDateTime
    }
    const response = await sessionsApi.saveSession(sessionInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Session saved successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/save-appointment', async (req, res) => {
    const { therapistId, childId, appointmentDateTime } = req.body;
    const appointmentInfo = {
        id: generateUniqueId('A'), 
        therapistId, 
        childId, 
        appointmentDateTime
    }
    const response = await appointmentsApi.saveAppointment(appointmentInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Appointment saved successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/session-done', async (req, res) => {
    const { id } = req.body;

    const response = await sessionsApi.sessionDone(id);

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Session done successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(returnResponse);
});

app.post('/session-cancelled', async (req, res) => {
    const { id } = req.body;

    const response = await sessionsApi.sessionCancelled(id);

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Session done successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(returnResponse);
});

app.post('/appointment-done', async (req, res) => {
    const { id } = req.body;

    const response = await appointmentsApi.appointmentDone(id);

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Appointment done successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(returnResponse);
});

app.post('/appointment-cancelled', async (req, res) => {
    const { id } = req.body;

    const response = await appointmentsApi.appointmentCancelled(id);

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Appointment done successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(returnResponse);
});

// Therapist
app.get('/get-my-id', verifyToken('therapist'), async (req, res) => {
    const { id } = req.user;
    res.send({ id });
});

app.put('/get-all-patients', verifyToken('therapist'), async (req, res) => {
    const { keyword } = req.body;
    const { id } = req.user;

    const therapistChildren = await childrenApi.getChildrenByTherapist(keyword, id);

    res.send(therapistChildren);
});

app.put('/get-all-sessions', verifyToken('therapist'), async (req, res) => {
    const { keyword } = req.body;
    const { id } = req.user;
    
    const therapistSessions = await sessionsApi.getSessionsByTherapist(keyword, id);
    
    res.send(therapistSessions);
});

app.put('/get-service-variables', async (req, res) => {
    const { service } = req.body;
    const variables = servicesApi.getServiceVariables(service);
    
    res.send(variables);
});

app.post('/save-activity', async (req, res) => {
    const { activity } = req.body;
    
    const response = await activitiesApi.addActivity(activity);
    // await activitiesApi.processNewActivityGrade(activity);

    const customResponse = {};

    if (response) {
        customResponse.status = 'success';
        customResponse.message = 'Activity saved successfully!';
    } else {
        customResponse.status = 'error';
        customResponse.message = 'Something went wrong, try again later';
    }
    
    res.send(customResponse);
});

app.put('/get-suggested-activities', async (req, res) => {
    const { childId } = req.body;
    const response = await activitiesApi.getChildSuggestedActivities(childId);
    res.send(response);
});

app.put('/get-activity-ratings', async (req, res) => {
    const { childId } = req.body;
    const response = await activitiesApi.getChildActivityRatings(childId);
    res.send(response);
});

app.put('/get-all-announcements', async (req, res) => {
    const { keyword } = req.body;
    const response = await announcementApi.getAllAnnouncements(keyword);
    res.send(response);
});

app.post('/save-announcement', async (req, res) => {
    const { title, description, image } = req.body;
    const id = generateUniqueId('T');

    if (!image) {
        return res.json({ status: 'error', message: 'Image is required' });
    }

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
        return res.json({ status: 'error', message: 'Invalid image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = id + '.' + mimeType.split('/')[1];
    
    const filePath = `./uploads/${ filename }`;

    fs.writeFileSync(filePath, buffer);

    const announcementDate = getFormattedDateTime();

    const response = await announcementApi.addAnnouncement({
        id,
        title,
        description,
        filePath: filePath.substring(1),
        announcementDate
    });

    const returnResponse = {};

    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Announcement added successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.put('/get-announcement', async (req, res) => {
    const { id } = req.body;
    const response = await announcementApi.getAnnouncementById(id);
    res.send(response);
});

app.delete('/remove-announcement', async (req, res) => {
    const { id } = req.body;
    const response = await announcementApi.removeAnnouncement(id);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Announcement deleted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.get('/uploads/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const imagePath = path.join(__dirname, '../uploads', fileName);

    const uploadsDir = path.join(__dirname, '../uploads');

    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
          console.error('Error reading the directory:', err);
        } else {
          console.log('Contents of uploads directory:', files);
        }
    })

    res.sendFile(imagePath, (err) => {
        if (err) {
            console.log('err: ', err);
            res.send('Error sending image');
        }
    });
});

app.delete('/reject-session-request', async (req, res) => {
    const { sessionRequestId, childId, sessionDateTime, isAccepted } = req.body;

    await notifsApi.saveNotif({
        id: generateUniqueId('N'),
        childId,
        dateTime: sessionDateTime,
        isAccepted,
        type: 'session'
    })

    const response = await sessionsApi.removeSessionRequest(sessionRequestId);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Request submitted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.delete('/reject-appointment-request', async (req, res) => {
    const { appointmentRequestId, childId, appointmentDateTime, isAccepted } = req.body;

    await notifsApi.saveNotif({
        id: generateUniqueId('N'),
        childId,
        dateTime: appointmentDateTime,
        isAccepted,
        type: 'appointment'
    })

    const response = await appointmentsApi.removeAppointmentRequest(appointmentRequestId);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Request submitted successfully!';
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
})

app.post('/submit-session-request', async (req, res) => {
    const { childId, date, time } = req.body;

    const id = generateUniqueId('R');

    const sessionInfo = {
        id,
        childId,
        date,
        time
    }

    const response = await sessionsApi.saveSessionRequest(sessionInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Request submitted successfully!';
        returnResponse.id = id;
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.post('/submit-appointment-request', async (req, res) => {
    const { childId, date, time } = req.body;

    const id = generateUniqueId('R');

    const appointmentInfo = {
        id,
        childId,
        date,
        time
    }

    // const response = await sessionsApi.saveSessionRequest(sessionInfo);
    const response = await appointmentsApi.saveAppointmentRequest(appointmentInfo);
    
    const returnResponse = {};
    
    if (response) {
        returnResponse.status = 'success';
        returnResponse.message = 'Request submitted successfully!';
        returnResponse.id = id;
    } else {
        returnResponse.status = 'error';
        returnResponse.message = 'Something went wrong, try again later';
    }

    res.send(returnResponse);
});

app.get('/get-all-session-requests', async (req, res) => {
    const response = await sessionsApi.getSessionRequests();
    res.send(response);
});

app.get('/get-all-appointment-requests', async (req, res) => {
    const response = await appointmentsApi.getAppointmentRequests();
    res.send(response);
})

app.put('/get-all-notification-data', async (req, res) => {
    const { id } = req.body;
    
    const response = await notifsApi.getNotifByChild(id);

    res.send(response);
});

function generateUniqueId(prefix) {
    const now = new Date();
    const uniqueId = `${prefix}${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}` +
                     `-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}` +
                     `-${now.getMilliseconds().toString().padStart(3, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    return uniqueId;
}

function getFormattedDateTime() {
    const now = new Date();

    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", 
                    "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12; // Convert to 12-hour format, with 12 instead of 0 for midnight/noon

    return `${month} ${date}, ${year} ${hours}:${minutes}${period}`;
}

server.listen(PORT, async () => {
    console.log(`Server starting at http://localhost:${ PORT }`);
})