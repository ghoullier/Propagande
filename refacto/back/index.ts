import Databases from "./database"
import { checkServerIdentity } from "tls";

export default class Propadande {
  private databases : Object;
  constructor() {
    this.databases = {};
  }

  /**
   * Create an user
   * @param user 
   */
  async createUser(user: {
    name: String,
    password: String,
  }) {}

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
  const chien = new Databases({
    admin : {
      name : 'root',
      password : 'root'
    },
    name : "chien",
  });
  chien.getNewPouchConnection({name : "lapin", password : "chien"}, 'rouste')
}

main()