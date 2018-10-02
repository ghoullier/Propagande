import PouchWrapper from "./database"
import { checkServerIdentity } from "tls";
import DirectCall from "./directCall";

const DEFAULT_ADMIN_NAME = 'root';
const DEFAULT_ADMIN_PASSWORD = 'root';

const MAIN_NOTIFICATION_TABLE = "notifications"

/**
 * move this
 */
interface user {
  name: string
  password?: string
}

interface socketCall{
  reason : string;
  name : string,
  params : any,
  user? : user
}


export default class PropadandeServer {
  private databases: any
  private pouchWraper: PouchWrapper;
  private directCall: DirectCall;
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
    this.databases = {};
    this.pouchWraper = new PouchWrapper({
      admin: paramsD.admin,
    });
    this.databases[MAIN_NOTIFICATION_TABLE] = this.pouchWraper.getNewPouchAdminCouchConnection(MAIN_NOTIFICATION_TABLE)
    this.directCall = new DirectCall(this.onDirectConnection.bind(this));
  }

  private onDirectConnection(socket : SocketIO.Socket){
    socket.on('message', (call : socketCall) => {
      console.log(call);
    })
  }

  /**
   * Init the Propagande Server 
   */
  async init() {
    // console.log(this.databases);

  }

  /**
   * Create an user
   * @param user 
   */
  async createUser(user: {
    name: String,
    password: String,
  }) {

  }

  /**
   * Assign user to a particular group
   * @param userName 
   * @param groupName 
   */
  async assignUserToGroup(userName: string, groupName: string) {

  }

  /**
   * Create a group
   * @param name 
   */
  async createGroup(name: String) {

  }

  /**
   * Call every front-end connected
   * @param name 
   * @param params 
   */
  async callFront(name: String, params: any) {

  }

  /**
   * Call all front connected as an user
   * @param userName 
   * @param funcName 
   * @param params 
   */
  async callFrontUser(userName: String, funcName: String, params: any) {

  }

  /**
   * Call every front connected as user member of particular group
   * @param groupName 
   * @param name 
   * @param params 
   */
  async callGroup(groupName: String, name: String, params: any) {

  }

  /**
   * Make a function callable by every front-end
   * @param func 
   */
  openFunction(func: Function) {

  }
}

const main = async () => {
  const chien = new PropadandeServer();
  await chien.init();

  const ploc = async (user: any, param: any, back: Function) => {
    console.log("call from : ", user);
  
  }
  chien.openFunction(ploc)

  // await new Promise(resolve => setTimeout(resolve, 10000))
  // const chien = new Databases({
  //   admin: {
  //     name: 'root',
  //     password: 'root'
  //   },
  //   name: "chien",
  // });

  // chien.getNewPouchConnection({
  //   name: "lapin",
  //   password: "chien"
  // }, 'rouste')
}

main()