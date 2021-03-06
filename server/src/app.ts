console.log("NODE_ENV", process.env.NODE_ENV)

import cors from "cors";
import express, { NextFunction, Request, Response } from 'express';
import { endpoints, FSErrorCode, FSErrorMsg, HttpStatusCode } from './common/constants';
import { FileServerError } from "./common/fileServerCommon";
import { FS_Response } from './common/interfaces';
import { fileServer } from './fileServer';
import './fileServerCopy';
import './fileServerMkdir';
import './fileServerMkFile';
import './fileServerMv';
import './fileServerRem';
import './fileServerUpload';
import './fileServerDownload';
import './fileServerChangeDir';
import './fileServerFileDetails';
import './fileServerDownloadZip';

export const app = express();


app.use(express.static('public'))
app.use(express.static('client'))
app.use(express.json())
app.use(express.text());

if (process.env.NODE_ENV !== "production") {
  app.use(cors());
}

app.use(function (req: Request, res: Response, next: NextFunction) {

  console.log(`${req.ip} ${req.method} ${req.url}`)
  console.log(req.headers);
  //console.log(JSON.stringify(req.headers));
  next();
});

app.get(endpoints.ROOT, (req: Request, res: Response) => {
  res.redirect('/client/index.html');
});

app.use(endpoints.FS, fileServer)

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {

  let resp: FS_Response = {
    message: error.message,
  }

  console.log("roote", error)
  const code: string = (error as FileServerError).code
  let statusCode = 0
  if ((error as FileServerError).suplemental) {
    resp.suplemental = (error as FileServerError).suplemental
  }

  //console.log("code", code)
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
    case FSErrorCode.EBADR:
      resp.message = FSErrorMsg.BAD_REQUEST
      statusCode = HttpStatusCode.BAD_REQUEST
      break;
    case FSErrorCode.EACCES:
      resp.message = FSErrorMsg.DESTINATION_FOLDER_NOT_ACCESSIBLE
      statusCode = HttpStatusCode.FORBIDDEN
      break;
    case FSErrorCode.EPERM:
    case FSErrorCode.EISDIR:
    case FSErrorCode.ERR_FS_EISDIR: //rem directory
      resp.message = FSErrorMsg.OPERATION_NOT_PERMITTED
      statusCode = HttpStatusCode.FORBIDDEN
      break;
    case FSErrorCode.ENOTDIR:
      resp.message = FSErrorMsg.DESTINATION_FOLDER_NOT_DIRECTORY
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