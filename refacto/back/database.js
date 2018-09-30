"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DEFAULT_HOST = 'http://localhost';
const DEFAULT_PORT = 5984;
class PouchConnection {
    constructor(url) {
        this.url = url;
    }
}
class PouchWrapper {
    constructor(params) {
        const paramD = Object.assign({
            url: DEFAULT_HOST,
            port: DEFAULT_PORT
        }, params);
        this.port = paramD.port;
        this.url = paramD.url;
        this.admin = paramD.admin;
    }
    getNewPouchConnection(user, baseName) {
        const [protocol, url] = this.url.split("//");
        return new PouchConnection(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`);
    }
}
exports.default = PouchWrapper;
