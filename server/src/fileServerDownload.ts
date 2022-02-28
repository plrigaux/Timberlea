import { Request, Response } from "express";
import { endpoints, HttpStatusCode } from "./common/constants";
import { Resolver } from "./filePathResolver";
import { fileServer } from "./fileServer";

fileServer.get(endpoints.DOWNLOAD + '/:path', (req: Request, res: Response) => {
    let filePath = req.params.path

    let filePathResolved = Resolver.instance.resolve(filePath)
    //console.log(`filePath`, filePath, filePathResolved)

    let options = { dotfiles: "allow" }

    res.download(filePathResolved.getPathServer(), filePathResolved.getFileName(), options, (err: Error) => {
        if (err) {
            console.error("download error", filePath, filePathResolved?.getPathServer(), JSON.stringify(err))
            if (!res.headersSent) {
                res.status(HttpStatusCode.NOT_FOUND).send("File not found: " + filePath) //TODO set an error handler
            }
        } else {
            // decrement a download credit, etc.
        }
    });
})