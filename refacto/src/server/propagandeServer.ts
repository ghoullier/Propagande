import PouchWrapper, { PouchConnection } from "./database"
import { checkServerIdentity } from "tls";
import DirectCall from "./directCall";
import { EventEmitter } from "events";
import { runInThisContext } from "vm";
import { onlyAdmin } from "./validations";

const DEFAULT_ADMIN_NAME = 'root';
const DEFAULT_ADMIN_PASSWORD = 'root';

const MAIN_NOTIFICATION_TABLE = "notifications"
const USERS_TABLE = '_users'


//move this
interface user {
  name: string
  password?: string
}

interface socketCall {
  reason: string;
  name: string,
  params: any,
  id: string;
  user?: user
}

/**
 * Propagange Server
 */
export class PropagandeServer {
  private pouchWraper: PouchWrapper;
  private directCall: DirectCall;
  private openedFunctions: any;
  private notificationTable: PouchConnection;
  private usersTable: PouchConnection;

  constructor(params?: {
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
          name: DEFAULT_ADMIN_NAME,
          password: DEFAULT_ADMIN_PASSWORD
        }
      },
      ...params
    }
    this.pouchWraper = new PouchWrapper({
      admin: paramsD.admin,
    });
    this.notificationTable = this.pouchWraper.getNewPouchAdminCouchConnection(MAIN_NOTIFICATION_TABLE)
    this.directCall = new DirectCall(this.onDirectConnection.bind(this));
    this.usersTable = this.pouchWraper.getNewPouchAdminCouchConnection(USERS_TABLE)
    this.openedFunctions = {};
  }

  private onDirectConnection(socket: SocketIO.Socket) {
    socket.on('message', (message: string) => {
      const call: socketCall = JSON.parse(message)
      if (call.reason === 'call') {
        const user = null // AUTH USER HERE AND ALSO GET HIS GROUPS
        if (this.openedFunctions[call.name]) {
          const sendBack = (params: any) => {
            socket.emit('message', JSON.stringify({
              name: call.id,
              reason: 'callBack',
              params
            }))
          }
          this.openedFunctions[call.name](user, call.params, sendBack)
        } else {
          // Non open function called
        }
      }
    })
  }

  /**
   * Generate an unique ID sortable by date of generation
   * @param str 
   */
  private genId(str: string) {
    return str + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 11);
  };

  /**
   * Init the Propagande Server 
   */
  async init() {
    // console.log(this.databases);
  }

  /**
   * 
   * @param name Get an user by name
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
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnection('user_' + user.name)
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
  async updateUser(user : any){
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
    const groupeBase = this.pouchWraper.getNewPouchAdminCouchConnection('group_' + name)
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
  async callFront(name: String, params: any) {
    await this.notificationTable.put({
      _id: this.genId('mainCall'),
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
  async callFrontUser(userName: String, funcName: String, params: any) {
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnection("user_" + userName)
    await userBase.put({
      _id: this.genId('cibledCall'),
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
    const userBase = this.pouchWraper.getNewPouchAdminCouchConnection("group_" + groupName)
    await userBase.put({
      _id: this.genId('groupCall'),
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
//     const chien = new PropadandeServer();

//     const ploc = async (user: any, param: any, back: Function) => {
//       back("kestuveu")
//       console.log('PLOC');
//     }
//     chien.openFunction(ploc)

//     // await chien.callFrontUser('courage', 'hello', 'patibulaire')
//     // await chien.callFront('hello', "courage")


//     // await chien.createUser({
//     //   name : 'jeanluc',
//     //   password : 'poulet'
//     // })
//     // await chien.createGroup('lesrien')
//     // await chien.assignUserToGroup("jeanluc", 'lesrien')
//     // await chien.callGroup('lesrien', 'hello', "vous etes des riens")

//     console.log('ok');
//   } catch (error) {
//     console.log(error);
//   }
// }

// main()

// todo
// mettre org.machin et tout
// mettre lowecase partout
// choisir url socket & couchDB
