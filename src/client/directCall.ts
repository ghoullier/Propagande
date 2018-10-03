import socketClient from "socket.io-client"

/**
 * Socket io based methods for Client
 */
export class DirectCallClient {
  io: any;
  http: any;
  constructor() {
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