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
const express_1 = __importDefault(require("express"));
const request_promise_1 = __importDefault(require("request-promise"));
const events = require('events');
const PUBLIC_PATH = 'public';
const genId = function (str) {
    return str + "_" + Math.random().toString(36).substr(2, 11);
};
const validate_onlyAdmin = function (newDoc, oldDoc, userCtx) {
    if (userCtx.roles.indexOf('_admin') !== -1) {
        return;
    }
    else {
        throw ({ forbidden: 'Only admins may edit the database' });
    }
};
const ADMIN_LOGIN = 'root';
const ADMIN_PASSWORD = 'root';
class Data {
    constructor() {
        this.admin = { name: ADMIN_LOGIN, password: ADMIN_PASSWORD };
        this.db = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/notifications`);
        this.userDb = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/_users`);
    }
    initDataBase() {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * Create Admin if non existing
             */
            try {
                yield this.getUser({
                    name: "whoeverReadThisIsAJackass",
                });
            }
            catch (error) {
                if (error.status === 401) {
                    const res = yield request_promise_1.default.put(`http://localhost:5984/_config/admins/${this.admin.name}`, {
                        body: this.admin.password,
                        json: true
                    });
                }
            }
        });
    }
    addValidation(baseName, validationName, func) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = {
                "_id": "_design/" + validationName,
                "validate_doc_update": func.toString()
            };
            const db = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/${baseName}`);
            yield db.put(doc);
        });
    }
    addSecurity(baseName, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield request_promise_1.default({
                url: `http://${this.admin.name}:${this.admin.password}@localhost:5984/${baseName}/_security`,
                method: 'PUT',
                body: JSON.stringify(doc),
            });
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(user.roles);
            const uu = yield this.userDb.get("org.couchdb.user:" + user.name);
            return yield this.userDb.put(Object.assign({}, uu, user));
            // return await this.userDb.put({
            //   _id: "org.couchdb.user:" + user.name,
            //   _rev,
            //   name: user.name,
            //   roles: user.roles,
            //   type: "user",
            //   password: user.password,
            //   data: user.data
            // })
        });
    }
    getUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userDb.get("org.couchdb.user:" + user.name);
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userDb.put({
                _id: "org.couchdb.user:" + user.name,
                name: user.name,
                roles: [],
                type: "user",
                password: user.password,
                data: user.data
            });
            const base = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/user_${user.name}`);
            yield base.get('');
            yield Promise.all([
                this.addValidation("user_" + user.name, 'validate', validate_onlyAdmin),
                this.addSecurity("user_" + user.name, {
                    admins: {
                        names: [],
                        roles: []
                    },
                    readers: {
                        names: [user.name],
                        roles: []
                    }
                })
            ]);
        });
    }
    createGroup(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const base = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/group_${name}`);
            yield base.get('');
            yield Promise.all([
                this.addValidation("group_" + name, 'validate', validate_onlyAdmin),
                this.addSecurity("group_" + name, {
                    admins: {
                        names: [],
                        roles: []
                    },
                    readers: {
                        names: [],
                        roles: [name]
                    }
                })
            ]);
        });
    }
    update(id, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _rev } = yield this.userDb.get(id);
            try {
                yield this.db.put(Object.assign({}, doc, { _id: id, _rev }));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * Put in specified database
     * @param id
     * @param doc
     * @param dbName
     */
    putIn(id, doc, dbName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const base = new pouchdb_node_1.default(`http://${this.admin.name}:${this.admin.password}@localhost:5984/${dbName}`);
                yield base.put(Object.assign({}, doc, { _id: id }));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    /**
     * Putin db
     * @param id
     * @param doc
     */
    put(id, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.put(Object.assign({}, doc, { _id: id }));
            }
            catch (err) {
                (err);
            }
        });
    }
}
class Socket {
    constructor(http) {
        this.io = require('socket.io')(http);
        this.event = new events.EventEmitter();
        this.io.on('connection', this.socketCon.bind(this));
    }
    /**
     * Making the function available from front
     */
    addFunction(func) {
        this.event.on('sentBack', (even) => __awaiter(this, void 0, void 0, function* () {
            if (even.message.user !== null) {
                const test = new pouchdb_node_1.default(`http://${even.message.user.name}:${even.message.user.password}@localhost:5984/user_${even.message.user.name}`);
                even.message.user = even.message.user.name;
                try {
                    yield test.get('');
                }
                catch (error) {
                    /**
                     * Incorect user
                     */
                    return;
                }
            }
            const sendBack = (params) => {
                even.socket.emit('message', JSON.stringify({
                    name: even.message.id,
                    reason: 'callBack',
                    params
                }));
            };
            func(even.message.user, even.message.params, sendBack);
        }));
    }
    /**
     * Triggered when one client send one message
     * @param message
     */
    onMessage(even) {
        return __awaiter(this, void 0, void 0, function* () {
            even.message = JSON.parse(even.message);
            if (even.message.reason === 'call') {
                this.event.emit('sentBack', even);
            }
        });
    }
    socketCon(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            socket.on('message', (message) => {
                (message);
                this.onMessage({ socket, message });
            });
        });
    }
}
class Front {
    constructor(http, data) {
        this.socket = new Socket(http);
        this.data = data;
    }
    openFunction(func) {
        this.socket.addFunction(func);
    }
    callGroup(groupName, name, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.putIn(genId('groupCall'), {
                reason: 'mainCall',
                name,
                params
            }, "group_" + groupName);
            console.log("group_" + groupName);
        });
    }
    callFront(name, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.put(genId('mainCall'), {
                reason: 'mainCall',
                name,
                params,
            });
        });
    }
    callFrontUser(userName, funcName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.data.putIn(genId('cibledCall'), {
                reason: 'cibledCall',
                name: funcName,
                params,
            }, "user_" + userName);
        });
    }
}
class Server {
    constructor() {
        this.app = express_1.default();
        this.http = require('http').Server(this.app);
        this.data = new Data();
        this.front = new Front(this.http, this.data);
        this.initRoutes();
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data.createUser(user);
        });
    }
    updateUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.data.updateUser(user);
        });
    }
    initRoutes() {
        this.app.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
            res.redirect('index.html');
        }));
    }
    assignUserToGroup(userName, groupName) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.data.getUser({ name: userName });
            if (user.roles.includes(groupName)) {
                return;
            }
            user.roles.push(groupName);
            yield this.data.updateUser(user);
        });
    }
    createGroup(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.data.createGroup(name);
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.data.initDataBase();
            this.app.set("port", 3000);
            this.app.use(express_1.default.static(PUBLIC_PATH));
            this.server = yield new Promise(resolve => this.http.listen(3000, resolve));
        });
    }
}
const main = () => __awaiter(this, void 0, void 0, function* () {
    const server = new Server();
    yield server.init();
    // await server.createGroup('hero');
    // await server.assignUserToGroup('frank', 'hero');
    yield server.front.callGroup('hero', 'hello', "Vous etes des champions ! ");
    server.front.callFront('hello', 'Node restarted');
    const ploc = (user, param, back) => __awaiter(this, void 0, void 0, function* () {
        console.log("call from : ", user);
        // server.front.callFrontUser('modez', 'hello', "ratata")
        server.front.callFront('hello', "from " + user);
        // back("yes")
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // back("wait... NO")
    });
    server.front.openFunction(ploc);
    // try {
    //   const res = await server.createUser({
    //     name: "frank",
    //     password: "poulet"
    //   })
    // } catch (error) {
    //   console.log(error);
    // }
});
main();
