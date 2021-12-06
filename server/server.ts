import express, { NextFunction, Request, Response } from 'express';

import fs, { Dirent } from 'fs';
import multer from 'multer';
import { fileServer } from './fileServer';

const app = express();
const PORT = 8000;

app.use(express.static('public'))

app.use(function (req : Request, res : Response, next : NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', '*');

  console.log(`${req.ip} ${req.method} ${req.url}`)
  next();
});

app.get('/', (req : Request, res : Response) => {
  res.redirect('/hello.html');
});

app.use('/fs', fileServer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, default_folder);
  },
  filename: function (req, file, cb) {
    var fieldName = 'file';
    req.body[fieldName] ? cb(null, req.body[fieldName]) : cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.any(), (req, res) => {
  console.log('[' + new Date().toISOString() + '] - File uploaded:', req.files);
  res.redirect('/' + default_folder);
  res.end();
});

const default_folder = 'files';

if (!fs.existsSync(default_folder)) {
  fs.mkdirSync(default_folder);
}

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});


