const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const md5 = require('md5');
const connection = require('../connection');

// Define your routes here
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM tb_caleg order by id_caleg desc';
        connection.query(query, (err, rows) => {
            if (err) {
                return res.status(500).send({ message: error.message, status: false });
            }
            return res.json({ message: 'success', data: { caleg: rows, jumlah: rows.length }, status: true });
        });
    } catch (error) {
        return res.status(500).send({ message: error.message, status: false });
    }
});

router.post('/', async (req, res) => {
    let { nama, kecamatan , nomor_urut} = req.body;
    const foto = req.files.foto;
    kecamatan = JSON.parse(kecamatan);

    // query get the last auto increment 
    const query = 'SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE table_name = "tb_caleg" ';

    connection.query(query, (err, rows) => {
        if (err) {
            console.log("error select increment", err)
            return res.status(500).send({ message: err.message, status: false });
        }

        // get the last auto increment
        const id = rows[0].AUTO_INCREMENT;

        const uploadDir = path.join(__dirname, '../assets/caleg/' + id);

        // make directory
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        // upload file
        foto.mv(uploadDir + '/' + foto.name, (err) => {
            if (err) {
                console.log("error upload", err)
                return res.status(500).send({ message: err.message, status: false });
            }

        });

        // let nomor_urut = 9;
        // insert to database
        const query = 'INSERT INTO tb_caleg (nama_caleg, nomor_urut_caleg, foto) VALUES (?, ?, ?)';
        connection.query(query, [nama, nomor_urut, foto.name], (err, rows) => {
            if (err) {
                console.log("error insert data caleg", err)
                return res.status(500).send({ message: err.message, status: false });
            }

            const the_login = 'INSERT INTO tb_login_caleg (id_caleg, username, password) VALUES (?, ?, ?)';

            connection.query(the_login, [id, nama+'_'+nomor_urut, md5('12345678')], (err, rows) => {
                if (err) {
                    console.log("error insert data login", err)
                    // return res.status(500).send({ message: err.message, status: false });
                }
            });

            for (let i = 0; i < kecamatan.length; i++) {
                const thequery = 'INSERT INTO tb_relasi_caleg_area (id_caleg, kecamatan_id) VALUES (?, ?)';

                connection.query(thequery, [id, kecamatan[i]], (err, rows) => {
                    if (err) {
                        console.log("error insert data relasi "+i, err)
                        return res.status(500).send({ message: err.message, status: false });
                    }
                });
            }

            return res.json({ message: 'success', data: { nama, kecamatan, foto }, status: true });
        });

    })

    // console.log(nama)
    // console.log(area)
    // console.log(foto)
    // return res.json({message: 'success', data: {nama, area, foto},status :true });
});

router.delete('/:id', async (req, res) => {
    // console.log("ini dijalankan")
    const { id } = req.params;

    if (id === undefined || id === '' || id === null) return res.status(400).send({ message: 'id is required', status: false });

    try {
        const query = 'DELETE FROM tb_caleg WHERE id_caleg = ?';
        connection.query(query, [id], (err, rows) => {
            if (err) {
                return res.status(500).send({ message: error.message, status: false });
            }
            // remove directory
            const uploadDir = path.join(__dirname, '../assets/caleg/' + id);
            fs.rmdirSync(uploadDir, { recursive: true });
            return res.json({ message: 'success', data: rows, status: true });
        });
    } catch (error) {
        return res.status(500).send({ message: error.message, status: false });
    }
});

router.get('/relasi_area/:id', async (req, res) => {
    const { id } = req.params;

    if (id === undefined || id === '' || id === null) return res.status(400).send({ message: 'id is required', status: false });

    try {
        const query = 'SELECT a.kecamatan_id FROM tb_relasi_caleg_area a join tb_caleg b on a.id_caleg = b.id_caleg where a.id_caleg = ?';
        connection.query(query, [id], (err, rows) => {
            if (err) {
                console.log("error dalam query", err)
                return res.status(500).send({ message: err.message, status: false });
            }
            console.log(rows)
            return res.json({ message: 'success', data: { kecamatan: rows, jumlah: rows.length }, status: true });
        });
    } catch (error) {
        console.log("error luar query", error)
        return res.status(500).send({ message: error.message, status: false });
    }
});

router.get('/area/:id_area', async (req, res) => {
    const { id_area } = req.params;

    if (id_area === undefined || id_area === '' || id_area === null) return res.status(400).send({ message: 'id area is required', status: false });

    try {
        const query = 'SELECT b.* FROM tb_relasi_caleg_area a join tb_caleg b on a.id_caleg = b.id_caleg where a.id_area = ?';
        connection.query(query, [id_area], (err, rows) => {
            if (err) {
                console.log("error dalam query", err)
                return res.status(500).send({ message: err.message, status: false });
            }
            return res.json({ message: 'success', data: { caleg: rows, jumlah: rows.length }, status: true });
        });
    } catch (error) {
        console.log("error luar query", error)
        return res.status(500).send({ message: error.message, status: false });
    }


    
    
});

router.get('/suara/:id_caleg' , async (req, res) => {
    const { id_caleg } = req.params;

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({ message: 'id caleg is required', status: false });

    try {
        const query = 'Select a.nik_nomor_hp,a.nama_pemilih,a.img ,b.nik as nik_tim_survei , b.nama as nama_tim_survei, c.nama_caleg, d.name as kecamatan , e.name as kelurahan, a.tps , a.img,  a.created_at from tb_data_survei a join tb_tim_survei b join tb_caleg c join tb_kecamatan d join tb_kelurahan e on a.nik_tim_survei=b.nik and a.id_caleg=c.id_caleg and a.kecamatan_id=d.kecamatan_id and a.kelurahan_id=e.kelurahan_id where a.id_caleg = ? order by a.created_at desc;';
        connection.query(query, [id_caleg], (err, rows) => {
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

router.get('/detail/:id_caleg' , async (req, res) => {
    const { id_caleg } = req.params;

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({ message: 'id caleg is required', status: false });

    const query_1 = 'Select count(*) as jumlah_tim_survei from tb_tim_survei where id_caleg = ?';
    const query_2 = 'Select count(*) as jumlah_suara from tb_data_survei where id_caleg = ?';
    const query_3  = 'Select count(*) as jumlah_area from tb_relasi_caleg_area where id_caleg = ?'

    connection.query(query_1, [id_caleg], (err, rows_1) => {
        if (err) {
            console.log("error dalam query 1", err)
            return res.status(500).send({ message: err.message, status: false });
        }
        connection.query(query_2, [id_caleg], (err, rows_2) => {
            if (err) {
                console.log("error dalam query 2", err)
                return res.status(500).send({ message: err.message, status: false });
            }
            connection.query(query_3, [id_caleg], (err, rows_3) => {
                if (err) {
                    console.log("error dalam query 3", err)
                    return res.status(500).send({ message: err.message, status: false });
                }
                return res.json({ message: 'success', data: { jumlah_tim_survei: rows_1[0].jumlah_tim_survei, jumlah_suara: rows_2[0].jumlah_suara, jumlah_area: rows_3[0].jumlah_area }, status: true });
            });
        });
    });
    
});

module.exports = router;
