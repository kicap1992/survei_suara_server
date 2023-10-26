const express = require('express');
const router = express.Router();
const connection = require('../connection');

router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM tb_area';
        connection.query(query, (err, rows) => {
            if (err) {
                return res.status(500).send({message: error.message, status :false });
            }
            return res.json({message: 'success', data: {area: rows , jumlah: rows.length},status :true });
        });
    } catch (error) {
        return res.status(500).send({message: error.message, status :false });
    }
});

router.post('/', async (req, res) => {
    const {area} = req.body;

    if ( area === undefined || area === '' || area === null) return res.status(400).send({message: 'area is required', status :false });

    console.log(area);
    // return res.json({message: 'success', data: area,status :true });

    try {
        const query = 'INSERT INTO tb_area (nama_area) VALUES (?)';
        connection.query(query, [area], (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send(err.message);
            }
            return res.json({message: 'success', data: rows,status :true });
        });
    } catch (error) {
        console.log('error luar', error);
        return res.status(500).send({message: error.message, status :false });
    }
});

router.delete('/:id', async (req, res) => {
    // console.log("ini dijalankan")
    const {id} = req.params;

    if (id === undefined || id === '' || id === null) return res.status(400).send({message: 'id is required', status :false });

    try {
        const query = 'DELETE FROM tb_area WHERE id_area = ?';
        connection.query(query, [id], (err, rows) => {
            if (err) {
                return res.status(500).send(err.message);
            }
            return res.json({message: 'success', data: rows,status :true });
        });
    } catch (error) {
        return res.status(500).send({message: error.message, status :false });
    }
});

module.exports = router;