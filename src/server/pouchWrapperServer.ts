import request from 'request-promise'
import { PouchConnexion } from "../common/pouchWrapper";

export class PouchConnexionServer extends PouchConnexion {
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
}