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

// Define your routes here
router.post('/caleg', (req, res) => {
    const { username, password } = req.body;

    if (username === undefined || username === '' || username === null) return res.status(400).send({ message: 'username is required', status: false });

    if (password === undefined || password === '' || password === null) return res.status(400).send({ message: 'password is required', status: false });

    const query = 'SELECT b.* FROM tb_login_caleg a join tb_caleg b on a.id_caleg = b.id_caleg WHERE a.username = ? AND a.password = ?';

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

router.post('/ganti_pass_caleg', async (req, res) => {
    const { id_caleg, password_lama, password_baru } = req.body;

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({ message: 'id_caleg is required', status: false });

    if (password_lama === undefined || password_lama === '' || password_lama === null) return res.status(400).send({ message: 'password_lama is required', status: false });

    if (password_baru === undefined || password_baru === '' || password_baru === null) return res.status(400).send({ message: 'password_baru is required', status: false });

    $cek_password = 'SELECT * FROM tb_login_caleg WHERE id_caleg = ? AND password = ?';

    connection.query($cek_password, [id_caleg, md5(password_lama)], (err, rows) => {
        if (err) {
            console.log('error dalam', err);
            return res.status(500).send({ message: err.message, status: false });
        }
        if (rows.length === 0) {
            return res.status(400).send({ message: 'password lama salah', status: false });
        }
        $query = 'UPDATE tb_login_caleg SET password = ? WHERE id_caleg = ?';
        connection.query($query, [md5(password_baru), id_caleg], (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send({ message: err.message, status: false });
            }
            return res.json({ message: 'success', data: rows, status: true });
        });
    });
});

router.post('/ganti_pass_tim_survei', async (req, res) => {
    const { nik, password_lama, password_baru } = req.body;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });

    if (password_lama === undefined || password_lama === '' || password_lama === null) return res.status(400).send({ message: 'password_lama is required', status: false });

    if (password_baru === undefined || password_baru === '' || password_baru === null) return res.status(400).send({ message: 'password_baru is required', status: false });

    $cek_password = 'SELECT * FROM tb_login_tim_survei WHERE nik = ? AND password = ?';

    connection.query($cek_password, [nik, md5(password_lama)], (err, rows) => {
        if (err) {
            console.log('error dalam', err);
            return res.status(500).send({ message: err.message, status: false });
        }
        if (rows.length === 0) {
            return res.status(400).send({ message: 'password lama salah', status: false });
        }
        $query = 'UPDATE tb_login_tim_survei SET password = ? WHERE nik = ?';
        connection.query($query, [md5(password_baru), nik], (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send({ message: err.message, status: false });
            }
            return res.json({ message: 'success', data: rows, status: true });
        });
    });
});

module.exports = router;
