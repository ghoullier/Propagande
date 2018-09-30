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
class Propadande {
    constructor() {
        this.databases = {};
    }
    /**
     * Create an user
     * @param user
     */
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () { });
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
        });
    }
    /**
     * Call all front connected as an user
     * @param userName
     * @param funcName
     * @param params
     */
    callFrontUser(userName, funcName, params) {
        return __awaiter(this, void 0, void 0, function* () {
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
     * Make a function callable by every front-end
     * @param func
     */
    openFunction(func) {
    }
}
exports.default = Propadande;
const main = () => __awaiter(this, void 0, void 0, function* () {
    const chien = new database_1.default({
        admin: {
            name: 'root',
            password: 'root'
        },
        name: "chien",
    });
    chien.getNewPouchConnection({ name: "lapin", password: "chien" }, 'rouste');
});
main();
