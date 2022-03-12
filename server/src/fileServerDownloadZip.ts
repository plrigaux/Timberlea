import { Request, Response } from "express";
import { endpoints, HttpStatusCode } from "./common/constants";
import { resolver } from "./filePathResolver";
import { fileServer } from "./fileServer";
import archiver from "archiver";

fileServer.get(endpoints.DOWNZIP + '/:path', (req: Request, res: Response) => {
    let filePath = req.params.path

    let filePathResolved = resolver.resolve(filePath)

    const arch = archiver('zip')
    arch.pipe(res);

    res.attachment(filePathResolved.basename + '.zip').type('zip');
    arch.on('end', () => res.end()); // end response when archive stream ends
    arch.on('error', function (err) {
        throw err;
    });

    arch.directory(filePathResolved.server, false);

    arch.append('abc', { name: 'abc.txt' });
    arch.append('cdf', { name: 'cdf.txt' })

    arch.finalize();
})
