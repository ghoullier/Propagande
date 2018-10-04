import * as global from '../common/global'
import socketServer from "socket.io";

/**
 * Socket io based methods for server
 */
export class DirectCallServer {
  io: socketServer.Server;
  http: any;
  constructor(onConnection?: Function) {
    this.http = require('http').createServer().listen(global.DEFAULT_PROPAGANDE_PORT, '0.0.0.0');
    this.io = socketServer().listen(this.http);
    if (onConnection) {
      this.io.on('connection', onConnection)
    }
  }
}