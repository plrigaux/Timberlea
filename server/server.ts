import express, { NextFunction, Request, Response } from 'express';

import fs, { Dirent } from 'fs';
import multer from 'multer';
import { endpoints } from './common/constants';
import { fileServer } from './fileServer';

const app = express();
const PORT = 8000;

app.use(express.static('public'))
app.use(express.json()) 
app.use(express.text()); 


app.use(function (req : Request, res : Response, next : NextFunction) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', '*');

  console.log(`${req.ip} ${req.method} ${req.url}`)

  console.log(req.headers);
  //console.log(JSON.stringify(req.headers));
  next();
});

app.get('/', (req : Request, res : Response) => {
  res.redirect('/hello.html');
});

app.put('/projects/:id', (req, res) => {
  const { id } = req.params;
  //const { title } = req.body;
 
  
 
  return res.json({"ok": 123, "id" : id});
 });

app.use(endpoints.FS, fileServer)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, default_folder);
  },
  filename: function (req, file, cb) {
    var fieldName = 'file';
    req.body[fieldName] ? cb(null, req.body[fieldName]) : cb(null, file.originalname);
  }
});

app.post("/echo", (req, res) => {

  if (req.body === undefined) {
    throw new Error("express.json middleware not installed");
  }
  if (!Object.keys(req.body).length) {
    // E.g curl -v -XPOST http://localhost:5000/echo

    let contentType = req.get("content-Type")
    if (!contentType) {
      return res.status(400).send("no content-type header\n");
    }
    // E.g. curl -v -XPOST -d '{"foo": "bar"}' http://localhost:5000/echo
    if (!contentType.includes("application/json")) {
      return res.status(400).send("content-type not application/json\n");
    }
    // E.g. curl -XPOST -H 'content-type:application/json' http://localhost:5000/echo
    return res.status(400).send("no data payload included\n");
  }

  // At this point 'req.body' is *something*.
  // For example, you might want to `console.log(req.body.foo)`
  console.log(req.body)
  res.json(req.body);
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


