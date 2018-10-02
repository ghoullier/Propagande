import socketio from "socket.io";
import EventEmitter from 'events';
import PouchWrapper from "./database";



/**
 * Socket io based methods
 */
export default class DirectCall {
  io: socketio.Server;
  event: EventEmitter;
  http: any;
  constructor(onConnection: Function) {
    this.http = require('http').createServer().listen(5555, '0.0.0.0');
    this.io = socketio().listen(this.http);
    this.event = new EventEmitter();
    this.io.on('connection', onConnection)
  }

  // /**
  //  * When call received
  //  * @param params 
  //  */
  // private onMessage(params: {
  //   socket: SocketIO.Socket,
  //   message: any;
  // }) {

  // }

  // private socketCon(socket: SocketIO.Socket) {
  //   socket.on('message', (message: any) => {
  //     this.onMessage({ socket, message })
  //   })
  // }
}

// class Socket {
//     io: any;
//     event: any;
//     constructor(http: any) {
//       this.io = require('socket.io')(http);
//       this.event = new events.EventEmitter();
//       this.io.on('connection', this.socketCon.bind(this));
//     }

//     /**
//      * Making the function available from front
//      */
//     addFunction(func: Function) {
//       this.event.on('sentBack', async (even: any) => {
//         if (even.message.user !== null) {
//           const test = new PouchDB(`http://${even.message.user.name}:${even.message.user.password}@localhost:5984/user_${even.message.user.name}`)
//           even.message.user = even.message.user.name;
//           try {
//             await test.get('');
//           } catch (error) {
//             /**
//              * Incorect user
//              */
//             return;
//           }
//         }
//         const sendBack = (params: any) => {
//           even.socket.emit('message', JSON.stringify({
//             name: even.message.id,
//             reason: 'callBack',
//             params
//           }))
//         }
//         func(even.message.user, even.message.params, sendBack);
//       });
//     }

//     /**
//      * Triggered when one client send one message
//      * @param message 
//      */
//     async onMessage(even: any) {
//       even.message = JSON.parse(even.message);
//       if (even.message.reason === 'call') {
//         this.event.emit('sentBack', even);
//       }
//     }

//     private async socketCon(socket: any) {
//       socket.on('message', (message: any) => {
//         (message);
//         this.onMessage({ socket, message })
//       });
//     }
//   }
