const {EventEmitter} = require('events');

class Server extends EventEmitter {

    constructor() {
        super();

        this.openSockets = [];

        this.createNewServer();
    }

    createNewServer() {
        this.ws = require("socket.io")(8321);

        this.ws.httpServer.on('listening', ()=> {
            this.emit('listening', this.ws.httpServer.address());
        });

        this.ws.sockets.on('connection', socket => {
            this.emit('connection', socket.id);

            this.openSockets.push(socket);

            socket.on('download', downloadDetails => {
                this.emit('download', downloadDetails);
            });

            socket.on('close', ()=> {
                this.openSockets.splice(this.openSockets.indexOf(socket), 1)
            });
        });
    }

    stopServer() {
        this.ws.close(()=> {
            this.openSockets.forEach((socket)=> {
                socket.disconnect(true)
            });
            this.openSockets = [];
        });
    }

}

module.exports = Server;
