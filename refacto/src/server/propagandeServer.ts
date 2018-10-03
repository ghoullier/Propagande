import PouchWrapper, { PouchConnexion } from "../common/pouchWrapper"
import { checkServerIdentity } from "tls";
import { DirectCallServer } from "../common/directCall";
import { EventEmitter } from "events";
import * as global from '../common/global'
import {genId} from '../common/utils'
import { runInThisContext } from "vm";
import { onlyAdmin } from "./validations";

/**
 * Propagange Server
 */
export class PropagandeServer {
  private pouchWraper: PouchWrapper;
  private directCall: DirectCallServer;
  private openedFunctions: any;
  private notificationTable: PouchConnexion;
  private usersTable: PouchConnexion;

  constructor(options?: {
    /**user Admin of couchDB */
    admin?: user,
    /** url of couchDB */
    couchUrl?: string,
    /** Port of couchDB */
    couchPort?: number,
  }) {
    const paramsD = {
      ...{
        admin: {
          name: global.DEFAULT_ADMIN_NAME,
          password: global.DEFAULT_ADMIN_PASSWORD
        }
      },
      ...options
    }
    this.pouchWraper = new PouchWrapper({
      admin: paramsD.admin,
    });
    this.notificationTable = this.pouchWraper.getNewPouchAdminCouchConnexion(global.MAIN_NOTIFICATION_TABLE)
    this.directCall = new DirectCallServer(this.onDirectConnection.bind(this));
    this.usersTable = this.pouchWraper.getNewPouchAdminCouchConnexion(global.USERS_TABLE)
    this.openedFunctions = {};
  }

  private onDirectConnection(socket: SocketIO.Socket) {
    socket.on('message', (message: string) => {
      const call: socketCall = JSON.parse(message)
      if (call.reason === 'call') {
        console.log(call);
        const user = null // AUTH USER HERE AND ALSO GET HIS GROUPS
        if (this.openedFunctions[call.functionName]) {
          const sendBack = (params: any) => {
            socket.emit('message', JSON.stringify({
              name: call.id,
              reason: 'callBack',
              params
            }))
          }
          this.openedFunctions[call.functionName](user, call.params, sendBack)
        } else {
          // Non open function called
        }
      }
    })
  }


  /**
   * Get an user by name
   * @param name 
   */
  async getUser(name: string) {
    return await <any>this.usersTable.get('org.couchdb.user:' + name)
  }

  /**
   * Create an user
   * @param user 
   */
  async createUser(user: {
    name: string,
    password: string,
  }) {
    await this.usersTable.put({
      _id: "org.couchdb.user:" + user.name,
      name: user.name,
      roles: [],
      type: "user",
      password: user.password,
    })
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion('user_' + user.name)
    await userBase.get('')
    await Promise.all([
      userBase.addValidation('admin', onlyAdmin),
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
    ])
  }

  /**
   * Update user properties
   * @param user 
   */
  async updateUser(user: any) {
    const actualUser = await this.usersTable.get("org.couchdb.user:" + user.name)
    return await this.usersTable.put({
      ...actualUser, ...user
    })
  }

  /**
   * Assign user to a particular group
   * @param userName 
   * @param groupName 
   */
  async assignUserToGroup(userName: string, groupName: string) {
    const user = await this.getUser(userName)
    if (user.roles.includes(groupName)) {
      return;
    }
    user.roles.push(groupName);
    await this.updateUser(user)
  }

  /**
   * Create a group
   * @param name 
   */
  async createGroup(name: String) {
    const groupeBase = this.pouchWraper.getNewPouchAdminCouchConnexion('group_' + name)
    await groupeBase.get('')
    await Promise.all([
      groupeBase.addValidation('admin', onlyAdmin),
      groupeBase.addSecurity({
        admins: {
          names: [],
          roles: []
        },
        readers: {
          names: [],
          roles: []
        }
      })
    ])
  }

  /**
   * Call every front-end connected
   * @param name 
   * @param params 
   */
  async callClients(name: String, params: any) {
    await this.notificationTable.put({
      _id: genId('mainCall'),
      reason: 'mainCall',
      name,
      params,
    })
  }

  /**
   * Call front of a specified user, all connection from this user will be called
   * @param userName 
   * @param funcName 
   * @param params
   */
  async callClientUser(userName: String, funcName: String, params: any) {
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion("user_" + userName)
    await userBase.put({
      _id: genId('cibledCall'),
      reason: 'cibledCall',
      name: funcName,
      params,
    })
  }

  /**
   * Call every front connected as user member of particular group
   * @param groupName 
   * @param name 
   * @param params 
   */
  async callGroup(groupName: String, functionName: String, params: any) {
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion("group_" + groupName)
    await userBase.put({
      _id: genId('groupCall'),
      reason: 'groupCall',
      name: functionName,
      params,
    })
  }

  /**
   * Make a function callable by every front-end, function must have a name 
   * @param func 
   */
  openFunction(func: Function) {
    if (func.name === "") {
      throw new Error(`Anonymous function aren't openable`)
    }
    this.openedFunctions[func.name] = func;
  }
}

// const main = async () => {
//   try {
//     const chien = new PropagandeServer();

//     const ploc = async (user: any, param: any, back: Function) => {
//       console.log('PLOC');
//       back("kestuveu")
//     }

//     chien.openFunction(ploc)

//     // await chien.callClientUser('courage', 'hello', 'patibulaire')
//     // await chien.callClients('hello', "courage")


//     // await chien.createUser({
//     //   name : 'jeanluc',
//     //   password : 'poulet'
//     // })
//     // await chien.createGroup('lesrien')
//     // await chien.assignUserToGroup("jeanluc", 'lesrien')
//     await chien.callGroup('lesrien', 'hello', "vous etes des riens")

//     console.log('ok');
//   } catch (error) {
//     console.log(error);
//   }
// }

// main()

// // todo
// // mettre appName 
// // mettre lowecase partout
// // choisir url socket & couchDB
// // eviter trimballer password pendant directCalls
// // faire conf couchDB
// // update roles realTimes
