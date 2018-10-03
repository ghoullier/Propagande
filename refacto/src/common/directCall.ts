import socketServer from "socket.io";
import socketClient from "socket.io-client"
import * as global from '../common/global'
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

/**
 * Socket io based methods for Client
 */
export class DirectCallClient {
  io: any;
  http: any;
  constructor(onConnection?: Function) {
    this.io = socketClient('http://localhost:5555').connect()
  }

  /**
   * Register a function to be called when message
   * @param callBack 
   */
  addMessageCallback(callBack: Function) {
    this.io.on('message', (message: any) => {
      callBack(JSON.parse(message));
    })
  }

  /**
   * Send a socket Message
   * @param message 
   */
  emit(message: any) {
    this.io.emit('message', JSON.stringify(message));
  }
}