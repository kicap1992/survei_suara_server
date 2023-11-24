const express = require('express');
const router = express.Router();
const connection = require('../connection');
const path = require('path');
const fs = require('fs');

// Define your routes here
router.get('/:nik', async (req, res) => {
    const { nik } = req.params;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });

    const query = 'Select a.nik_nomor_hp,a.nama_pemilih,a.img ,b.nik as nik_tim_survei , b.nama as nama_tim_survei, c.nama_caleg, d.name as kecamatan, e.name as kelurahan, a.tps, a.created_at from tb_data_survei a join tb_tim_survei b join tb_caleg c join tb_kecamatan d join tb_kelurahan e on a.nik_tim_survei=b.nik and a.id_caleg=c.id_caleg and a.kecamatan_id=d.kecamatan_id and a.kelurahan_id = e.kelurahan_id where a.nik_tim_survei = ? order by a.created_at desc';

    connection.query(query, [nik], (err, rows) => {
        if (err) {
            return res.status(500).send({ message: err.message, status: false });
        }
        return res.json({ message: 'success', data: { data: rows, jumlah: rows.length }, status: true });
    });
});

router.get('/counter/:nik', async (req, res) => {
    const { nik } = req.params;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });

    const query = 'Select count(*) as jumlah from tb_data_survei where nik_tim_survei = ?';

    connection.query(query, [nik], (err, rows) => {
        if (err) {
            return res.status(500).send({ message: error.message, status: false });
        }
        console.log(rows[0].jumlah)
        return res.json({ message: 'success', data: rows[0].jumlah, status: true });
    });
});

router.post('/', async (req, res) => {
    const { ktp, nama, idCaleg, idKecamatan, idKelurahan, nik, noTPS } = req.body;
    const foto = req.files.foto;

    if (ktp === undefined || ktp === '' || ktp === null) return res.status(400).send({ message: 'ktp is required', status: false });
    if (nama === undefined || nama === '' || nama === null) return res.status(400).send({ message: 'nama is required', status: false });
    if (idCaleg === undefined || idCaleg === '' || idCaleg === null) return res.status(400).send({ message: 'idCaleg is required', status: false });
    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });
    if (noTPS === undefined || noTPS === '' || noTPS === null) return res.status(400).send({ message: 'noTPS is required', status: false });
    if (idKecamatan === undefined || idKecamatan === '' || idKecamatan === null) return res.status(400).send({ message: 'idKecamatan is required', status: false });
    if (idKelurahan === undefined || idKelurahan === '' || idKelurahan === null) return res.status(400).send({ message: 'idKelurahan is required', status: false });
    if (foto === undefined || foto === '' || foto === null) return res.status(400).send({ message: 'foto is required', status: false });

    const query = 'SELECT * FROM tb_data_survei WHERE nik_nomor_hp = ?';

    connection.query(query, [ktp], (err, rows) => {
        if (err) {
            console.log('error dalam pertama', err);
            return res.status(500).send({ message: err.message, status: false });
        }
        if (rows.length > 0) {
            return res.status(400).send({ message: 'nik/no_telpon sudah terdaftar', status: false });
        }
        const query = 'INSERT INTO tb_data_survei (nik_nomor_hp, nama_pemilih, id_caleg, kecamatan_id, kelurahan_id, nik_tim_survei,img ,tps) VALUES (?,?,?,?,?,?,?,?)';

        connection.query(query, [ktp, nama, idCaleg, idKecamatan, idKelurahan, nik, 'assets/pemilih/' + ktp + '/' + foto.name,noTPS], (err, rows) => {
            if (err) {
                console.log('error dalam kedua', err);
                return res.status(500).send({ message: err.message, status: false });
            }
            const uploadDir = path.join(__dirname, '../assets/pemilih/' + ktp);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            foto.mv(uploadDir + '/' + foto.name, (err) => {
                if (err) {
                    console.log('error dalam ketiga', err);
                    return res.status(500).send({ message: err.message, status: false });
                }
                return res.json({ message: 'success', data: { ktp, nama, idCaleg, idKecamatan, idKelurahan, nik, foto ,noTPS}, status: true });
            });
        });
    });

})

module.exports = router;
