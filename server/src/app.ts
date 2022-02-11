import express, { NextFunction, Request, Response } from 'express';
import cors from "cors"
import { endpoints } from './common/constants';
import { fileServer } from './fileServer';
import { fileServerUpload } from './fileServerUpload';
import { fileServerCopy } from './fileServerCopy';
import { fileServerMv } from './fileServerMv';

export const app = express();


app.use(express.static('public'))
app.use(express.static('client'))
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
  res.redirect('/client/index.html');
});


app.use(endpoints.FS, fileServer)
app.use(endpoints.FS_UPLOAD, fileServerUpload)
app.use(endpoints.FS_COPY, fileServerCopy)
app.use(endpoints.FS_MV, fileServerMv)