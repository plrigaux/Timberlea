import cors from "cors";
import express, { NextFunction, Request, Response } from 'express';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from "./common/fileServerCommon";
import { FS_Response } from './common/interfaces';
import { fileServer } from './fileServer';
import { fileServerCopy } from './fileServerCopy';
import { fileServerMkDir } from './fileServerMkdir';
import { fileServerMkFile } from './fileServerMkFile';
import { fileServerMv } from './fileServerMv';
import { fileServerRem } from './fileServerRem';
import { fileServerUpload } from './fileServerUpload';

export const app = express();


app.use(express.static('public'))
app.use(express.static('client'))
app.use(express.json())
app.use(express.text());


app.use(cors());

app.use(function (req: Request, res: Response, next: NextFunction) {

  console.log(`${req.ip} ${req.method} ${req.url}`)
  console.log(req.headers);
  //console.log(JSON.stringify(req.headers));
  next();
});

app.get(endpoints.ROOT, (req: Request, res: Response) => {
  res.redirect('/client/index.html');
});



app.use(endpoints.FS_UPLOAD, fileServerUpload)
app.use(endpoints.FS_COPY, fileServerCopy)
app.use(endpoints.FS_MV, fileServerMv)
app.use(endpoints.FS_REM, fileServerRem)
app.use(endpoints.FS_MKDIR, fileServerMkDir)
app.use(endpoints.FS_MKFILE, fileServerMkFile)
app.use(endpoints.FS, fileServer)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  
  let resp: FS_Response = {
    error: true,
    message: error.message,
  }

  //console.log("roote", req.url)
  let code : string  = (error as FileServerError).code
  let statusCode = 0

  switch (code) {
    case FSErrorCode.KEY_UNRESOLVED:
    case FSErrorCode.ENOENT:
      resp.message = FSErrorMsg.DESTINATION_FOLDER_DOESNT_EXIST
      statusCode = HttpStatusCode.NOT_FOUND
      break;
    case FSErrorCode.EEXIST:
      resp.message = FSErrorMsg.FILE_ALREADY_EXIST
      statusCode = HttpStatusCode.CONFLICT
      break;
    default:
      console.error(error, error.stack)
      resp.message = `Unknown error code ${code}`
      statusCode = HttpStatusCode.INTERNAL_SERVER
  }

  if (res.headersSent) {
    return next(error)
  }
  
  res.status(statusCode).send(resp)
})