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
const database_1 = __importDefault(require("./database"));
const directCall_1 = __importDefault(require("./directCall"));
const validations_1 = require("./validations");
const DEFAULT_ADMIN_NAME = 'root';
const DEFAULT_ADMIN_PASSWORD = 'root';
const MAIN_NOTIFICATION_TABLE = "notifications";
const USERS_TABLE = '_users';
/**
 * Propagange Server
 */
class PropadandeServer {
    constructor(params) {
        const paramsD = Object.assign({
            admin: {
                name: DEFAULT_ADMIN_NAME,
                password: DEFAULT_ADMIN_PASSWORD
            }
        }, params);
        this.databases = {};
        this.pouchWraper = new database_1.default({
            admin: paramsD.admin,
        });
        this.notificationTable = this.pouchWraper.getNewPouchAdminCouchConnection(MAIN_NOTIFICATION_TABLE);
        this.directCall = new directCall_1.default(this.onDirectConnection.bind(this));
        this.usersTable = this.pouchWraper.getNewPouchAdminCouchConnection(USERS_TABLE);
        this.openedFunctions = {};
    }
    onDirectConnection(socket) {
        socket.on('message', (message) => {
            const call = JSON.parse(message);
            if (call.reason === 'call') {
                const user = null; // AUTH USER HERE AND ALSO GET HIS GROUPS
                if (this.openedFunctions[call.name]) {
                    const sendBack = (params) => {
                        socket.emit('message', JSON.stringify({
                            name: call.id,
                            reason: 'callBack',
                            params
                        }));
                    };
                    this.openedFunctions[call.name](user, call.params, sendBack);
                }
                else {
                    // Non open function called
                }
            }
        });
    }
    /**
     * Generate an unique ID sortable by date of generation
     * @param str
     */
    genId(str) {
        return str + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 11);
    }
    ;
    /**
     * Init the Propagande Server
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(this.databases);
        });
    }
    /**
     * Create an user
     * @param user
     */
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * User creation
             */
            yield this.usersTable.put({
                _id: "org.couchdb.user:" + user.name,
                name: user.name,
                roles: [],
                type: "user",
                password: user.password,
            });
            const userBase = this.pouchWraper.getNewPouchAdminCouchConnection('user_' + user.name);
            yield userBase.get('');
            /**
             * Right security
             */
            yield Promise.all([
                userBase.addValidation('admin', validations_1.onlyAdmin),
                userBase.addSecurity({
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
    /**
     * Assign user to a particular group
     * @param userName
     * @param groupName
     */
    assignUserToGroup(userName, groupName) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Create a group
     * @param name
     */
    createGroup(name) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Call every front-end connected
     * @param name
     * @param params
     */
    callFront(name, params) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.notificationTable.put({
                _id: this.genId('mainCall'),
                reason: 'mainCall',
                name,
                params,
            });
        });
    }
    /**
     * Call front of a specified user, all connection from this user will be called
     * @param userName
     * @param funcName
     * @param params
     */
    callFrontUser(userName, funcName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const userBase = this.pouchWraper.getNewPouchAdminCouchConnection("user_" + userName);
            yield userBase.put({
                _id: this.genId('cibledCall'),
                reason: 'cibledCall',
                name: funcName,
                params,
            });
            // const res = await this.data.putIn(genId('cibledCall'), {
            //   reason: 'cibledCall',
            //   name: funcName,
            //   params,
            // }, "user_" + userName)
        });
    }
    /**
     * Call every front connected as user member of particular group
     * @param groupName
     * @param name
     * @param params
     */
    callGroup(groupName, name, params) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * Make a function callable by every front-end, function must have a name
     * @param func
     */
    openFunction(func) {
        if (func.name === "") {
            throw new Error(`Anonymous function aren't not openable`);
        }
        this.openedFunctions[func.name] = func;
    }
}
exports.default = PropadandeServer;
const main = () => __awaiter(this, void 0, void 0, function* () {
    try {
        const chien = new PropadandeServer();
        yield chien.init();
        const ploc = (user, param, back) => __awaiter(this, void 0, void 0, function* () {
            back("kestuveu");
            console.log('PLOC');
        });
        chien.openFunction(ploc);
        yield chien.callFrontUser('courage', 'hello', 'patibulaire');
        // await chien.callFront('hello', "courage")
        // await chien.createUser({
        //   name: 'courage',
        //   password: "poulet"
        // })
    }
    catch (error) {
        console.log(error);
    }
});
main();
