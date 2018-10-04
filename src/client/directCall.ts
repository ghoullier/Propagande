import * as global from '../common/global'
import socketClient from "socket.io-client"

/**
 * Socket io based methods for Client
 */
export class DirectCallClient {
  io: any;
  http: any;
  constructor(options : {
    url : string,
    port : number
  }) {
    this.io = socketClient(`${options.url}:${options.port}`).connect()
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