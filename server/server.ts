import express, { NextFunction, Request, Response } from 'express';
import path from 'path'
import fs, { Dirent } from 'fs';
import multer from 'multer';
import { FileInfo, FileType } from './structures';
import { currentDirectory } from './directory';

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

app.get('/api/pwd', (req, res) => {


  const notes = '.'

  let dirName = path.dirname(notes) // /users/joe
  let basename = path.basename(notes) // notes.txt
  let extname = path.extname(notes)
  let p = process.cwd()
  res.send(`PWD ${dirName} ${basename} ${extname} ${__dirname} ${__filename} ${p}`)
})



app.get('/api/list', (req, res) => {

  let folder = currentDirectory

  console.log(`folder ${folder}`)
  let fileInfos: FileInfo[] = []
  fs.readdir(folder, { withFileTypes: true }, (err, files: Dirent[]) => {
    files.forEach(file => {

      
      let fi: FileInfo = {
        name: file.name,
        type : file.isFile() ? FileType.File : file.isDirectory() ? FileType.Directory : FileType.Other,
      }

      if (file.isFile()) {
        const stats = fs.statSync(file.name);
        fi.size = stats.size
      }

      console.log(`file ${file}`)
      fileInfos.push(fi)
    });
    res.send(fileInfos)
  });
})

app.put('api/cd', (req : express.Request, res : express.Response) => {

  //set up a new directory
})



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


