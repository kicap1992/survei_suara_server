const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const app = express();
const server = http.createServer(app);
const connection = require('./connection');


dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.options('*', cors());
app.use(cors());




app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/area', require('./routes/area_routes'));
app.use('/caleg', require('./routes/caleg_routes'));
app.use('/survei', require('./routes/survei_routes'));
app.use('/login', require('./routes/login_routes'));
app.use('/tim_survei', require('./routes/tim_survei_routes'));

app.get('/assets/caleg/:id/:filename', (req, res) => {
    res.sendFile(__dirname + '/assets/caleg/' + req.params.id + '/' + req.params.filename);
  })

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

