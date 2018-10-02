import socketio from "socket.io";

/**
 * Socket io based methods
 */
export default class DirectCall {
  io: socketio.Server;
  http: any;
  constructor(onConnection: Function) {
    this.http = require('http').createServer().listen(5555, '0.0.0.0');
    this.io = socketio().listen(this.http);
    this.io.on('connection', onConnection)
  }
}