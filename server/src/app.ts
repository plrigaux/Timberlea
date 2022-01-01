import express, { NextFunction, Request, Response } from 'express';
import cors from "cors"
import { endpoints } from './common/constants';
import { fileServer } from './fileServer';
import { fileServerUpload } from './fileServerUpload';

export const app = express();


app.use(express.static('public'))
app.use(express.json()) 
app.use(express.text()); 


app.use(cors());

app.use(function (req : Request, res : Response, next : NextFunction) {

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

