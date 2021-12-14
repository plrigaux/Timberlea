import express, { NextFunction, Request, Response } from 'express';

import fs, { Dirent } from 'fs';
import multer from 'multer';
import { endpoints } from './common/constants';
import { fileServer } from './fileServer';
import { fileServerUpload } from './fileServerUpload';

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


app.use(endpoints.FS, fileServer)
app.use(endpoints.FS_UPLOAD, fileServerUpload)



app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});


