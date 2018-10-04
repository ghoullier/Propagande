import PouchDB from 'pouchdb';
import PouchWrapper, { PouchConnexion } from "../common/pouchWrapper"
import { DirectCallServer } from "./directCall";
import * as global from '../common/global'
import { genId } from '../common/utils'
import { onlyAdmin } from "./validations";
import { PouchConnexionServer } from './pouchWrapperServer'
/**
 * Propagange Server
 */
export class PropagandeServer {
  private pouchWraper: PouchWrapper;
  private directCall: DirectCallServer;
  private openedFunctions: any;
  private notificationTable: PouchConnexionServer;
  private usersTable: PouchConnexionServer;
  public appName: string;
  constructor(options: {
    /**Name of you App */
    appName: string,
    /**user Admin of couchDB */
    admin: userLogin,
    /** url of couchDB, default to localhost */
    couchUrl?: string,
    /** Port of couchDB, default to 5984*/
    couchPort?: number,
    /**Port of your Propagande Socket, default to 5555*/
    propagandePort? : number
  }) {
    const paramsD: any = {
      ...{
        couchUrl: global.DEFAULT_COUCHDB_HOST,
        couchPort: global.DEFAULT_COUCHDB_PORT,
        propagandePort : global.DEFAULT_PROPAGANDE_PORT
      },
      ...options
    }
    this.pouchWraper = new PouchWrapper(this.getNewPouchDb, {
      admin: paramsD.admin,
    });
    this.appName = paramsD.appName;
    this.notificationTable = this.pouchWraper.getNewPouchAdminCouchConnexion(`propagande_${this.appName}_${global.MAIN_NOTIFICATION_TABLE}`)
    this.directCall = new DirectCallServer(this.onDirectConnexion.bind(this));
    this.usersTable = this.pouchWraper.getNewPouchAdminCouchConnexion(global.USERS_TABLE)
    this.openedFunctions = {};
  }

  /**
   * Return couchDb server connexion
   */
  private getNewPouchDb(url: string) {
    return new PouchDB(url)
  }

  /**
   * Socket connexion handler
   * @param socket 
   */
  private onDirectConnexion(socket: SocketIO.Socket) {
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
    // return await <any>this.usersTable.get('org.couchdb.user:' + name)
    return await <any>this.usersTable.get(`org.couchdb.user:propagande_${this.appName}_${name}`)
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
      _id: `org.couchdb.user:propagande_${this.appName}_${name}`,
      name: user.name,
      roles: [],
      type: "user",
      password: user.password,
    })
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion(`propagande_${this.appName}_user_${user.name}`)
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
    const actualUser = await this.usersTable.get(`org.couchdb.user:propagande_${this.appName}_${name}`)
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
    const groupeBase = this.pouchWraper.getNewPouchAdminCouchConnexion(`propagande_${this.appName}_group_${name}`)
    
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
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion(`propagande_${this.appName}_user_${userName}`)
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
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnexion(`propagande_${this.appName}_group_${groupName}`)
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
//     const chien = new PropagandeServer({
//       appName: "chien",
//       admin: {
//         name: 'root',
//         password: 'root'
//       }
//     })

//     const ploc = async (user: any, param: any, back: Function) => {
//       console.log('PLOC');
//       back("kestuveu")
//     }

//     chien.openFunction(ploc)

//     // await chien.callClientUser('courage', 'hello', 'patibulaire')
//     await chien.callClients('hello', "courage")


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
// // @types/propagande