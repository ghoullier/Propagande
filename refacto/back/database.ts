import PouchDB from 'pouchdb-node';

const DEFAULT_HOST = 'http://localhost';
const DEFAULT_PORT = 5984;

interface user {
  name: string
  password?: string
}

class PouchConnection {
  couchdb: PouchDB.Database;
  constructor(url: string) {
    this.couchdb = new PouchDB(url);
  }

  async put(doc: object) {
    return await this.couchdb.put(doc);
  }
}

export default class PouchWrapper {
  port: Number;
  url: String;
  admin: user;
  constructor(params: {
    admin: user,
    url?: String
    port?: Number,
  }) {
    const paramD = {
      ...{
        url: DEFAULT_HOST,
        port: DEFAULT_PORT
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
  getNewPouchAdminCouchConnection(baseName: string) {
    const [protocol, url] = this.url.split("//")
    return new PouchConnection(`${protocol}//${this.admin.name}:${this.admin.password}@${url}:${this.port}/${baseName}`)
  }

  /**
   * Get a new PouchConnection instance with specified user right
   * @param user 
   * @param baseName 
   */
  getNewPouchConnection(user: user, baseName: string) {
    const [protocol, url] = this.url.split("//")
    return new PouchConnection(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`)
  }
}