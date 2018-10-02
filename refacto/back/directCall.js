"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = __importDefault(require("socket.io"));
/**
 * Socket io based methods
 */
class DirectCall {
    constructor(onConnection) {
        this.http = require('http').createServer().listen(5555, '0.0.0.0');
        this.io = socket_io_1.default().listen(this.http);
        this.io.on('connection', onConnection);
    }
}
exports.default = DirectCall;
