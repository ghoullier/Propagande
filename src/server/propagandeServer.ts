import { mkdirSync, existsSync } from "fs"
import Pouchdb from "pouchdb-node"
import express from "express"
import * as global from '../common/global'
import request from "request-promise"
import { Databases } from "../common/interfaces";
import cors from "cors"

interface Admin {
  name: string,
  password: string
}

interface PropagandeServerOptions {
  appName: string
  admin: Admin
  app: express.Application
  expressPort: number
}

/**
 * Return a Promise with a fresh instance of Propagande Server
 */
export const propagandeServer = async (options: PropagandeServerOptions): Promise<PropagandeServer> => {
  const propagande = new PropagandeServer(options)
  await propagande.init()
  return propagande
}

/**
 * CouchDB validation Function to ensure only admin can write database
 */
const onlyAdmin = function (newDoc: any, oldDoc: any, userCtx: any) {
  if (userCtx.roles.indexOf('_admin') !== -1) {
    return;
  }
  else {
    throw ({ forbidden: 'Only admins may edit the database' });
  }
}

/**
 * Propagande Server 
 */
class PropagandeServer {
  app: express.Application
  expressPort: number
  appName: string
  admin: Admin
  databases: Databases = {}
  constructor(options: PropagandeServerOptions) {
    this.app = options.app;
    this.appName = options.appName
    this.expressPort = options.expressPort
    this.admin = options.admin
    existsSync(`./${this.appName}_db`) || mkdirSync(`./${this.appName}_db`)
    const pouch = Pouchdb.defaults(<any>{
      prefix: `./${this.appName}_db/`
    })
    this.app.use(`/${global.POUCH_ROUTE}`, cors({
      credentials: true,
      origin: (origin, callback) => {
        callback(null, true)
      }
    }), require('express-pouchdb')(pouch, {
      mode: "fullCouchDB",
    }))
    this.databases.mainNotif = this.getPouch(global.MAIN_NOTIFICATION_TABLE)
    this.databases.users = new Pouchdb(`http://${this.admin.name}:${this.admin.password}@127.0.0.1:${this.expressPort}/${global.POUCH_ROUTE}_users`)
    this.listenPouchDbCrash()
  }

  /**
   * add validation function to a pouch database, at least only admin write should be on every database
   */
  private async addValidation(pouch: PouchDB.Database, name: string, func: Function) {
    await pouch.put({
      "_id": "_design/" + name,
      "validate_doc_update": func.toString()
    });
  }

  /**
   * Get a pouchDb instance according to propagande configuration
   */
  private getPouch(name: string): PouchDB.Database {
    return new Pouchdb(`http://${this.admin.name}:${this.admin.password}@127.0.0.1:${this.expressPort}/${global.POUCH_ROUTE}propagande_${this.appName}_${name}`)
  }

  /**
   * Add security read document to a database
   */
  async addSecurity(pouch: PouchDB.Database, doc: any) {
    const res = await request({
      url: pouch.name + "/_security",
      method: 'PUT',
      body: JSON.stringify(doc),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
  }

  /**
   * send a propagande-formated notification to a pouch database
   */
  private async sendNotifToPouch(pouch: PouchDB.Database, route: string, params: any) {
    let actual: any = {};
    try {
      actual = await pouch.get('mainCall')
    } catch (error) {
    }
    await pouch.put({
      _id: "mainCall",
      _rev: actual._rev ? actual._rev : undefined,
      route,
      params
    })
  }

  /**
   * Using pouchdb-server, sometime unhandled promise rejection happen, if the client make some bad call
   */
  private listenPouchDbCrash() {
    process.on('unhandledRejection', (reason, promise) => {
      const errorStr = reason.toString()
      let spotted = false;
      for (let err of global.KNOW_POUCHDB_ERRORS) {
        if (errorStr.startsWith(err)) {
          // console.log("Catched PouchDb Error :\n", reason);
          spotted = true;
          break;
        }
      }
      if (!spotted) {
        console.error(reason)
      }
    })
  }

  private async updateUser(name: string, userData: any) {
    const actualUserData = await this.getUser(name)
    return await this.databases.users.put({
      ...actualUserData, ...userData
    })
  }

  private async getUser(name: string): Promise<any> {
    return await <any>this.databases.users.get(`org.couchdb.user:propagande_${this.appName}_${name}`)
  }

  private async addUserToGroup(userName: string, group: string) {
    const userData = await <any>this.databases.users.get(`org.couchdb.user:propagande_${this.appName}_${userName}`)
    if (userData.roles.includes(group)) return
    userData.roles.push(group)
    await this.updateUser(userName, userData)
  }

  /**
   * Create a group
   * @param name 
   */
  async createGroup(name: String) {
    const groupeBase = this.getPouch(`group_${name}`)
    await groupeBase.get('')
    await Promise.all([
      this.addValidation(groupeBase, 'admin', onlyAdmin),
      this.addSecurity(groupeBase, {
        admins: {
          names: [],
          roles: []
        },
        members: {
          names: [],
          roles: [name]
        }
      })
    ])
  }

  /**
   * Assign Users to group
   * @param users 
   * @param group 
   */
  async addUsersToGroup(users: string[], group: string) {
    await Promise.all(users.map((user) => this.addUserToGroup(user, group)))
  }

  /**
   * Create an user
   * @param user 
   */
  async createUser(user: {
    name: string,
    password: string,
  }) {
    try {
      await this.databases.users.put({
        _id: `org.couchdb.user:propagande_${this.appName}_${user.name}`,
        name: `propagande_${this.appName}_${user.name}`,
        roles: [],
        type: "user",
        password: user.password,
      })
      const userBase = this.getPouch(`${user.name}_notifs`)
      await userBase.get('')
      await Promise.all([
        this.addValidation(userBase, 'admin', onlyAdmin),
        this.addSecurity(userBase, {
          admins: {
            names: [],
            roles: []
          },
          members: {
            names: [`propagande_${this.appName}_${user.name}`],
            // roles: []
          }
        })
      ])
    } catch (error) {
      if (error.status === 409) {
        throw new Error(`user "${user.name}" allready exist in app "${this.appName}"`)
      } else {
        throw error
      }
    }
  }

  /**
   * Call route for all user assigned to specified group
   * @param userName 
   * @param route 
   * @param params 
   */
  async callRouteGroup(groupName: string, route: string, params: any) {
    await this.sendNotifToPouch(this.getPouch(`group_${groupName}`), route, params)
  }

  /**
   * Call route for particular user
   * @param userName 
   * @param route 
   * @param params 
   */
  async callRouteUser(userName: string, route: string, params: any) {
    await this.sendNotifToPouch(this.getPouch(`${userName}_notifs`), route, params)
  }

  /**
   * Call route of every client connected
   * @param route 
   * @param params 
   */
  async callRoute(route: string, params: any) {
    await this.sendNotifToPouch(this.databases.mainNotif, route, params)
  }

  async init() {
    const testIfParty = new Pouchdb(`http://127.0.0.1:${this.expressPort}/${global.POUCH_ROUTE}/_users`)
    let isParty = true;
    try {
      await testIfParty.get("_design/_auth")
      // AdminParty 
    } catch (error) {
      isParty = false
    }
    if (isParty) {
      await request.put(`http://127.0.0.1:${this.expressPort}/${global.POUCH_ROUTE}_config/admins/admin`, { body: '"admin"' })
    }
    try {
      await this.addValidation(this.getPouch(global.MAIN_NOTIFICATION_TABLE), "adminWrite", onlyAdmin)
    } catch (e) { }
  }
}

/**
 * Propagande Developer Test
 */
const mainTest = async () => {
  try {
    const app = express();
    app.listen(4000)
    const chien = await propagandeServer({
      appName: "ange",
      admin: {
        name: "admin",
        password: "admin"
      },
      app,
      expressPort: 4000
    })

    await chien.createUser({
      name: 'roulio',
      password: 'chien'
    })

    await chien.createGroup('paidUsers')

    await chien.addUsersToGroup(["roulio"], 'paidUsers')

    console.log('READY');
    while (1) {
      console.log("SEND... " + Date.now());
      await Promise.all([
        chien.callRoute('hello', { chien: "LE CHIEN HEIN" }),
        chien.callRouteUser('roulio', 'hello', { zouave: "les zouaves" }),
        chien.callRouteGroup('paidUsers', 'hello', { miracle: "vous avez paye" }),
      ])

      await new Promise(resolve => setTimeout(resolve, 3000))
      // break
    }
  } catch (error) {
    console.log("ERROR", error);
  }
}

// mainTest()