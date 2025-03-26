const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const multer = require('multer');
const connectdb = require('./config/db');
const File = require('./models/File');

dotenv.config();

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

const upload = multer({ dest: 'uploads' });

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/upload", upload.single('file'), async (req, res) => {
    try {
        const fileData = {
            path: req.file.path,
            Originalname: req.file.originalname // Fixed property name
        };

        if (req.body.password) {
            fileData.password = await bcrypt.hash(req.body.password, 10);
        }

        const file = await File.create(fileData);

        res.render("index", {
            filelink: `${req.headers.origin}/file/${file.id}`,
            fileId: file.id,
            hasPassword: !!fileData.password
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).send("Error uploading file.");
    }
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).send("File not found");
        }

        if (file.password && !req.body.password) {
            return res.render("password", { error: false, fileId: file.id });
        }

            const isMatch = await bcrypt.compare(req.body.password, file.password);
            if (!isMatch) {
                return res.render("password", { error: true, fileId: file.id });
            }
            
        

        file.downloadcount = (file.downloadcount || 0) + 1;
        await file.save();

        console.log(`File downloaded ${file.downloadcount} times`);

        res.download(file.path, file.Originalname);
    } catch (error) {
        console.error("Download error:", error);
        res.status(500).send("Error downloading file.");
    }
}

connectdb()
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.port || 3000, () => {
            console.log(`Server is running on port ${process.env.port || 3000}`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
