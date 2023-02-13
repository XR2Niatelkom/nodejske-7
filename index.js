const express = require("express")
const app = express()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const mysql = require("mysql")
const cors = require("cors")
const { error } = require("console")

app.use(express.static(__dirname));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
const strorage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, './image');
},
filename: (req, file, cb) => {
    cb(null, "image-"+ Date.now()+ path.extname(file.originalname))
  }
})

let upload = multer({strorage: strorage})

const db = mysql.createConnection ({
    host: "localhost",
    user: "root",
    password: "",
    database: "olshop"
})

//end point menambah data barang baru
app.post("/barang", upload.single("image"), (req, res) => {
    let data = {
        nama_barang: req.body.nama_barang,
        harga: req.body.harga,
        stok: req.body.stok,
        deskripsi: req.body.deskripsi,
        Image: req.file.fieldname
    }

    if (!req.file) {
        res.json({
            message: "tidak ada file yang dikirim"
        })
    } else {
        let sql = "insert into barang set ?"

        db.query(sql, data, (error, result) => {
            if(error) throw error
            res.json({
                message: result.affectedRows + " data berhasi disimpan"
            })
        })
    }
})

//endpoint untuk mengubah data barang
app.put("/barang", upload.single("image"), (req,res) => {
    let data = null, sql = null
    let param = { kode_barang: req.body.kode_barang }

    if (!req.file) {
          data = {
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok,
            deskripsi: req.body.deskripsi
          }
    } else {
        data = {
            nama_barang: req.body.nama_barang,
            harga: req.body.harga,
            stok: req.body.stok,
            deskripsi: req.body.deskripsi,
            image: req.file.filename
        }

        sql = "select * from barang where ?"
        db.query(sql,param, (err, result) => {

            if(err) throw err
            let fileName = result[0].image
            let dir = path.join(__dirname, "image", fileName)
            fs.unlink(dir, (error) => {})
        })
    }

    sql = "update barang set ? where ?"
    db.query(sql,[data, param], (error, result) => {
        if(error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil diubah"
            })
        }
    })
})

//endpoint untuk menghapus data barang
app.delete("/barang/:kode_barang", (req, res) => {
    let param = { kode_barang: req.params.kode_barang }
    let sql = "select * from barang where ?"
    db.query(sql, param, (error, result) => {
        if(error) throw error
        let filename = result[0].image
        let dir = path.join(__dirname, "image", filename)
        fs.unlink(dir, (error) => {})
    })

    sql = "delete from barang where ?"
    db.query(sql, param, (error, result) =>{
        if (error) {
            res.json({
                message: error.message
            })
        } else {
            res.json({
                message: result.affectedRows + " data berhasil dihapus"
            })
        }
    })
})

//endpoint ambil data barang 
app.get("/barang", (req,res) => {
    let sql = "select * from barang"
    db.query(sql, (error, result) => {
        if (error) throw error
            res.json({
                data: result,
                count: result.length
            })
        })
    })


app.listen(8000,() => {
    console.log("server run on port 8000");
})  