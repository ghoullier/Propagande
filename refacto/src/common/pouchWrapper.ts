import PouchDB from 'pouchdb'
import request from 'request-promise'
import * as global from './global'

/**
 * PouchConnexion Object, each client User should have many connexion 
 * one for _users table, 
 * one for users_$name table
 * one for each group registered
 */
export class PouchConnexion {
  couchdb: PouchDB.Database;
  constructor(url: string) {
    this.couchdb = new PouchDB(url);
  }

  /**
   * Set document
   * @param doc 
   */
  async put(doc: object) {
    return await this.couchdb.put(doc);
  }

  /**
   * Get document
   * @param id 
   */
  async get(id: string) {
    return <any>await this.couchdb.get(id)
  }

  /**
   * Add security rule
   * @param doc 
   */
  async addSecurity(doc: any) {
    return await request({
      url: this.couchdb.name + "/_security",
      method: 'PUT',
      body: JSON.stringify(doc),
    });
  }

  /**
   * Add a validation function to couchDB, invoqued by bouchDB engine when add or update a document
   * @param validationName 
   * @param func 
   */
  async addValidation(name: string, func: Function) {
    await this.put({
      "_id": "_design/" + name,
      "validate_doc_update": func.toString
    });
  }

  /**
   * Trigger function when CouchDB remote change
   * @param callback 
   */
  watchChange(callback: Function) {
    this.couchdb.changes({
      live: true,
      since: "now",
      include_docs: true
    }).on('change', (change: any) => {
      callback(change)
    })
  }
}

/**
 * PouchDB methods
 */
export default class PouchWrapper {
  port: Number;
  url: String;
  admin: user;
  constructor(params: {
    admin?: user,
    url?: String
    port?: Number,
  }) {
    const paramD = {
      ...{
        admin: { name: 'none' },
        url: global.DEFAULT_COUCHDB_HOST,
        port: global.DEFAULT_COUCHDB_PORT
      },
      ...params
    }
    this.port = paramD.port;
    this.url = paramD.url;
    this.admin = paramD.admin;
  }

  /**
   * Get a new PouchConnection instance with admin right
   * @param user 
   * @param baseName 
   */
  getNewPouchAdminCouchConnexion(baseName: string) {
    const [protocol, url] = this.url.split("//")
    return new PouchConnexion(`${protocol}//${this.admin.name}:${this.admin.password}@${url}:${this.port}/${baseName}`)
  }

  /**
   * Get a new PouchConnection instance with specified user right
   * @param user 
   * @param baseName 
   */
  getNewPouchConnexion(user: user, baseName: string) {
    const [protocol, url] = this.url.split("//")
    return new PouchConnexion(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`)
  }

  /**
 * Get a new PouchConnection with Anonymous right
 * @param user 
 * @param baseName 
 */
  getNewAnonymousPouchConnexion(baseName: string) {
    return new PouchConnexion(`${this.url}:${this.port}/${baseName}`)
  }

}