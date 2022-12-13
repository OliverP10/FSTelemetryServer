import express, { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import { BuildLogger } from './Logger';
import bodyParser from 'body-parser';
import cors from 'cors';

export class EchoServer {
    private app: express.Application;
    public logger: Logger;

    constructor() {
        this.logger = BuildLogger('EchoServer');
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json()); // Use body-parser to parse the request body
        this.app.use(this.loggerMiddleware);
        this.app.post('/', this.rootHandler);
        this.listen(4000);
    }

    private loggerMiddleware(req: Request, res: Response, next: NextFunction) {
        console.log(`${req.method} request received for ${req.url} with body:`);
        console.log(JSON.stringify(req.body, null, 2));
        next();
    }

    private rootHandler(req: Request, res: Response) {
        res.send({});
    }

    private listen(port: number) {
        this.app.listen(port, () => {
            this.logger.info(`EchoServer listening on port ${port}`);
        });
    }
}
