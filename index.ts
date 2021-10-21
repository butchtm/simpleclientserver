
import * as dotenv from 'dotenv';
import * as socketIo from 'socket.io';
import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as cors from 'cors';
import * as sourceMapSupport from 'source-map-support';
import * as fs from 'fs';

dotenv.config();
//sourceMapSupport.install();

export class App {
    public static readonly PORT:number = parseInt(process.env.PORT) || 8080;
    private app: express.Application;
    private io: socketIo.Server;
    private server: http.Server;
    
    constructor() {
        this.createApp();
        this.createServer();
        this.sockets();
        this.listen();
    }

    private createApp(): void {
        this.app = express();
        this.app.use(cors());
        this.app.set('trust proxy', true);
  
        this.app.use(function(req: any, res: any, next: any) {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

            if (req.secure) {
                // request was via https, so do no special handling
                next();
            } else {
                if(req.headers.host != 'localhost:' + App.PORT && req.headers.host != process.env.EXTERNAL_IP){
                    // request was via http, so redirect to https
                    res.redirect('https://' + req.headers.host + req.url)
                } else {
                    next();
                }
            }

        });
        this.app.use('/', express.static(path.join(__dirname, 'public')));
    }

    private createServer(): void {
        this.server = http.createServer(this.app);
    }

    private sockets(): void {
        this.io = require('socket.io')(this.server);
    }

    private listen(): void {
        let me = this;
        this.server.listen(App.PORT, () => {
            console.log('Running server on port: %s', App.PORT);
        });

    }
}

export let app = new App();
