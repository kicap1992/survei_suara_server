const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const mysql = require('mysql');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Connect to the MySQL database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

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
    let { nama, area } = req.body;
    const foto = req.files.foto;
    area = JSON.parse(area);

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

        let nomor_urut = 9;
        // insert to database
        const query = 'INSERT INTO tb_caleg (nama_caleg, nomor_urut_caleg, foto) VALUES (?, ?, ?)';
        connection.query(query, [nama, nomor_urut, foto.name], (err, rows) => {
            if (err) {
                console.log("error insert data caleg", err)
                return res.status(500).send({ message: err.message, status: false });
            }

            for (let i = 0; i < area.length; i++) {
                const thequery = 'INSERT INTO tb_relasi_caleg_area (id_caleg, id_area) VALUES (?, ?)';

                connection.query(thequery, [id, area[i]], (err, rows) => {
                    if (err) {
                        console.log("error insert data relasi "+i, err)
                        return res.status(500).send({ message: err.message, status: false });
                    }
                });
            }

            return res.json({ message: 'success', data: { nama, area, foto }, status: true });
        });

    })

    // console.log(nama)
    // console.log(area)
    // console.log(foto)
    // return res.json({message: 'success', data: {nama, area, foto},status :true });
});

module.exports = router;
