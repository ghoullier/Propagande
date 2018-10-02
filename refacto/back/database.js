"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pouchdb_node_1 = __importDefault(require("pouchdb-node"));
const DEFAULT_HOST = 'http://localhost';
const DEFAULT_PORT = 5984;
class PouchConnection {
    constructor(url) {
        this.couchdb = new pouchdb_node_1.default(url);
    }
    put(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.couchdb.put(doc);
        });
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
    /**
     * Get a new PouchConnection instance with admin right
     * @param user
     * @param baseName
     */
    getNewPouchAdminCouchConnection(baseName) {
        const [protocol, url] = this.url.split("//");
        return new PouchConnection(`${protocol}//${this.admin.name}:${this.admin.password}@${url}:${this.port}/${baseName}`);
    }
    /**
     * Get a new PouchConnection instance with specified user right
     * @param user
     * @param baseName
     */
    getNewPouchConnection(user, baseName) {
        const [protocol, url] = this.url.split("//");
        return new PouchConnection(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`);
    }
}
exports.default = PouchWrapper;
