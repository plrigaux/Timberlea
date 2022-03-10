import { Request, Response } from "express";
import { endpoints, HttpStatusCode } from "./common/constants";
import { resolver } from "./filePathResolver";
import { fileServer } from "./fileServer";

fileServer.get(endpoints.DOWNLOAD + '/:path', (req: Request, res: Response) => {
    let filePath = req.params.path

    let filePathResolved = resolver.resolve(filePath)
    //console.log(`filePath`, filePath, filePathResolved)

    let options = { dotfiles: "allow" }

    res.download(filePathResolved.server, filePathResolved.getFileName(), options, (err: Error) => {
        if (err) {
            console.error("download error", filePath, filePathResolved?.server, JSON.stringify(err))
            if (!res.headersSent) {
                res.status(HttpStatusCode.NOT_FOUND).send("File not found: " + filePath) //TODO set an error handler
            }
        } else {
            // decrement a download credit, etc.
        }
    });
})