const express = require('express');
const router = express.Router();
const connection = require('../connection');
const md5 = require('md5');

// GET all survei data
router.get('/', async (req, res) => {
    const query = 'SELECT a.*, b.nama_caleg FROM tb_tim_survei a join tb_caleg b on a.id_caleg = b.id_caleg';

    try {
        connection.query(query, (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send({ message: err.message, status: false });
            }
            return res.json({ message: 'success', data: { survei: rows, jumlah: rows.length }, status: true });
        });
    } catch (error) {
        console.log('error luar', error);
        return res.status(500).send({ message: error.message, status: false });
        
    }
});



// POST a new survei data
router.post('/', async (req, res) => {
    const { nik, nama , id_caleg} = req.body;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });

    if (nama === undefined || nama === '' || nama === null) return res.status(400).send({ message: 'nama is required', status: false });

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({ message: 'id_caleg is required', status: false });





    try {
        const check_query = 'SELECT * FROM tb_tim_survei WHERE nik = ?';
        connection.query(check_query, [nik], (err, rows) => {
            if (err) {
                console.log('error dalam check nik', err);
                return res.status(500).send({message: err.message, status: false});
            }
            if (rows.length > 0) {
                return res.status(400).send({ message: 'nik sudah terdaftar', status: false });
            }
            const query = 'INSERT INTO tb_tim_survei (nik, nama, id_caleg) VALUES (?, ?, ?)';
            connection.query(query, [nik, nama, id_caleg], (err, rows) => {
                if (err) {
                    console.log('error dalam', err);
                    return res.status(500).send({message: err.message, status: false});
                }
                const md5_pass = md5('12345678');

                const query = 'insert into tb_login_tim_survei (nik, password) values (?, ?)';
                connection.query(query, [nik, md5_pass], (err, rows) => {
                    if (err) {
                        console.log('error dalam tambah login', err);
                        return res.status(500).send({message: err.message, status: false});
                    }
                    return res.json({ message: 'success', data: rows, status: true });
                })
                // return res.json({message: 'success', data: rows,status :true });
            });
        });
    } catch (error) {
        console.log('error luar', error);
        return res.status(500).send({ message: error.message, status: false });
    }
});

// DELETE a specific survei data by ID
router.delete('/:nik', async (req, res) => {
    const { nik } = req.params;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({ message: 'nik is required', status: false });

    try {
        const query = 'DELETE FROM tb_tim_survei WHERE nik = ?';
        connection.query(query, [nik], (err, rows) => {
            if (err) {
                return res.status(500).send({message: err.message, status: false});
            }
            return res.json({ message: 'success', data: rows, status: true });
        });
    } catch (error) {
        return res.status(500).send({ message: error.message, status: false });
    }
});

router.get('/suara/:nik' , async (req, res) => {
    const {nik} = req.params;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({message: 'nik is required', status :false });

    try {
        const query = 'Select a.nik_nomor_hp,a.nama_pemilih,a.img ,b.nik as nik_tim_survei , b.nama as nama_tim_survei, c.nama_caleg, d.nama_area, a.created_at from tb_data_survei a join tb_tim_survei b join tb_caleg c join tb_area d on a.nik_tim_survei=b.nik and a.id_caleg=c.id_caleg and a.id_area=d.id_area where a.nik_tim_survei = ? order by a.created_at desc';
        connection.query(query, [nik], (err, rows) => {
            if (err) {
                console.log("error dalam query", err)
                return res.status(500).send({ message: err.message, status: false });
            }
            return res.json({ message: 'success', data: { data: rows, jumlah: rows.length }, status: true });
        });
    } catch (error) {
        console.log("error luar query", error)
        return res.status(500).send({ message: error.message, status: false });
    }

});



module.exports = router;
