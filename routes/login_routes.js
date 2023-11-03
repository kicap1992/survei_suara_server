const express = require('express');
const router = express.Router();
const connection = require('../connection');
const md5 = require('md5');

// Define your routes here
router.post('/tim_survei', (req, res) => {
    const { username, password } = req.body;

    if (username === undefined || username === '' || username === null) return res.status(400).send({ message: 'username is required', status: false });

    if (password === undefined || password === '' || password === null) return res.status(400).send({ message: 'password is required', status: false });

    const query = 'SELECT b.* FROM tb_login_tim_survei a join tb_tim_survei b on a.nik = b.nik WHERE a.nik = ? AND a.password = ?';

    connection.query(query, [username, md5(password)], (err, rows) => {
        if (err) {
            console.log('error dalam', err);
            return res.status(500).send({ message: err.message, status: false });
        }
        if (rows.length === 0) {
            return res.status(400).send({ message: 'username atau password salah', status: false });
        }
        return res.json({ message: 'success', data: rows[0], status: true });
    });
    
});

module.exports = router;
