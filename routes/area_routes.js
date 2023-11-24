const express = require('express');
const router = express.Router();
const connection = require('../connection');

// router.get('/', async (req, res) => {
//     try {
//         const query = 'SELECT * FROM tb_area';
//         connection.query(query, (err, rows) => {
//             if (err) {
//                 return res.status(500).send({message: error.message, status :false });
//             }
//             return res.json({message: 'success', data: {area: rows , jumlah: rows.length},status :true });
//         });
//     } catch (error) {
//         return res.status(500).send({message: error.message, status :false });
//     }
// });

// router.post('/', async (req, res) => {
//     const {area} = req.body;

//     if ( area === undefined || area === '' || area === null) return res.status(400).send({message: 'area is required', status :false });

//     console.log(area);
//     // return res.json({message: 'success', data: area,status :true });

//     try {
//         const query = 'INSERT INTO tb_area (nama_area) VALUES (?)';
//         connection.query(query, [area], (err, rows) => {
//             if (err) {
//                 console.log('error dalam', err);
//                 return res.status(500).send({message: err.message, status :false });
//             }
//             return res.json({message: 'success', data: rows,status :true });
//         });
//     } catch (error) {
//         console.log('error luar', error);
//         return res.status(500).send({message: error.message, status :false });
//     }
// });

// router.delete('/:id', async (req, res) => {
//     // console.log("ini dijalankan")
//     const {id} = req.params;

//     if (id === undefined || id === '' || id === null) return res.status(400).send({message: 'id is required', status :false });

//     try {
//         const query = 'DELETE FROM tb_area WHERE id_area = ?';
//         connection.query(query, [id], (err, rows) => {
//             if (err) {
//                 return res.status(500).send({message: error.message, status :false });
//             }
//             return res.json({message: 'success', data: rows,status :true });
//         });
//     } catch (error) {
//         return res.status(500).send({message: error.message, status :false });
//     }
// });

router.get('/kecamatan', async (req, res) => {
    try {
        const query = 'SELECT * FROM tb_kecamatan';
        connection.query(query, (err, rows) => {
            if (err) {
                return res.status(500).send({message: error.message, status :false });
            }
            return res.json({message: 'success', data: {kecamatan: rows , jumlah: rows.length},status :true });
        });
    } catch (error) {
        return res.status(500).send({message: error.message, status :false });
    }
})

router.get('/kelurahan/:id_kecamatan', async (req, res) => {
    const {id_kecamatan} = req.params;

    if (id_kecamatan === undefined || id_kecamatan === '' || id_kecamatan === null) return res.status(400).send({message: 'id_kecamatan is required', status :false });

    try {
        const query = 'SELECT * FROM tb_kelurahan where kecamatan_id = ?';
        connection.query(query, [id_kecamatan], (err, rows) => {
            if (err) {
                return res.status(500).send({message: error.message, status :false });
            }
            return res.json({message: 'success', data: {kelurahan: rows , jumlah: rows.length},status :true });
        });
    } catch (error) {
        return res.status(500).send({message: error.message, status :false });
    }
})

router.get('/cek_area/:nik', async (req, res) => {
    const {nik} = req.params;

    if (nik === undefined || nik === '' || nik === null) return res.status(400).send({message: 'nik is required', status :false });

    try {
        const query = 'SELECT DISTINCT b.* FROM tb_tim_survei a join tb_kecamatan b join tb_relasi_caleg_area c on a.id_caleg = c.id_caleg and b.kecamatan_id = c.kecamatan_id  where a.nik = ?';

        connection.query(query, [nik], (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send({message: err.message, status :false });
            }
            return res.json({message: 'success', data: {kecamatan: rows , jumlah: rows.length},status :true });
        });
       
    } catch (error) {
        console.log('error luar', error);
        return res.status(500).send({message: error.message, status :false });
    }
});

router.get('/cek_area_caleg/:id_caleg', async (req, res) => {
    const {id_caleg} = req.params;

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({message: 'id_caleg is required', status :false });

    try {
        const query = 'SELECT DISTINCT b.* FROM tb_relasi_caleg_area a join tb_kecamatan b on a.kecamatan_id = b.kecamatan_id where a.id_caleg = ?';

        connection.query(query, [id_caleg], (err, rows) => {
            if (err) {
                console.log('error dalam', err);
                return res.status(500).send({message: err.message, status :false });
            }
            return res.json({message: 'success', data: {kecamatan: rows , jumlah: rows.length},status :true });
        });
       
    } catch (error) {
        console.log('error luar', error);
        return res.status(500).send({message: error.message, status :false });
    }
});

router.get('/suara/:id_area/:id_caleg' , async (req, res) => {
    const {id_area, id_caleg} = req.params;

    if (id_area === undefined || id_area === '' || id_area === null) return res.status(400).send({message: 'id area is required', status :false });

    if (id_caleg === undefined || id_caleg === '' || id_caleg === null) return res.status(400).send({message: 'id caleg is required', status :false });

    try {
        const query = 'Select a.nik_nomor_hp,a.nama_pemilih,a.img ,b.nik as nik_tim_survei , b.nama as nama_tim_survei, c.nama_caleg, d.name as kecamatan,e.name as kelurahan , a.tps, a.created_at from tb_data_survei a join tb_tim_survei b join tb_caleg c join tb_kecamatan d join tb_kelurahan e on a.nik_tim_survei=b.nik and a.id_caleg=c.id_caleg and a.kecamatan_id=d.kecamatan_id and a.kelurahan_id = e.kelurahan_id where a.kecamatan_id = ? and a.id_caleg = ? order by a.created_at desc';
        connection.query(query, [id_area, id_caleg], (err, rows) => {
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