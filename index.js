const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const app = express();
const server = http.createServer(app);


dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.options('*', cors());
app.use(cors());


// Connect to the MySQL database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/area', require('./routes/area_routes'));
app.use('/caleg', require('./routes/caleg_routes'));

// app error handler
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Something broke!');
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});


module.exports = { app, server, connection };

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

