const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dbDir = path.join(__dirname, 'database');

[uploadsDir, dbDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Database file path
const dbPath = path.join(dbDir, 'files.json');

// Initialize database
function initDB() {
    if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}));
    }
}

function readDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

initDB();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        const filename = uniqueId + ext;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 * 1024 // 5GB limit
    }
});

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const shareCode = req.file.filename.replace(path.extname(req.file.filename), '');
    
    const fileData = {
        id: fileId,
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadDate: new Date().toISOString(),
        expiresIn: 7 // days
    };

    const db = readDB();
    db[shareCode] = fileData;
    writeDB(db);

    res.json({
        success: true,
        fileId: fileId,
        shareCode: shareCode,
        downloadUrl: `/download?id=${shareCode}`,
        expiresIn: fileData.expiresIn
    });
});

// Download page endpoint (shows download page with button)
app.get('/download', (req, res) => {
    // Serve the download page
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// Actual file download endpoint
app.get('/download-file', (req, res) => {
    const db = readDB();
    const code = req.query.id;
    const fileData = db[code];

    if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, fileData.filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, fileData.originalName);
});

// Get file info endpoint
app.get('/info', (req, res) => {
    const db = readDB();
    const code = req.query.id;
    const fileData = db[code];

    if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.json({
        id: fileData.id,
        name: fileData.originalName,
        size: fileData.size,
        type: fileData.mimetype,
        uploadDate: fileData.uploadDate
    });
});

// Delete file endpoint
app.delete('/delete', (req, res) => {
    const db = readDB();
    const code = req.query.id;
    const fileData = db[code];

    if (!fileData) {
        return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadsDir, fileData.filename);
    
    // Delete file from disk
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Remove from database
    delete db[code];
    writeDB(db);

    res.json({ success: true, message: 'File deleted successfully' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Database file: ${dbPath}`);
});

