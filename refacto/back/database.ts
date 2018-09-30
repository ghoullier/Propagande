import PouchDB from 'pouchdb-node';

const DEFAULT_HOST = 'http://localhost';
const DEFAULT_PORT = 5984;

interface user {
  name: String,
  password?: String
}

class PouchConnection {
  url: String;
  constructor(url : String) {
    this.url = url;
  }
}

export default class PouchWrapper {
  port: Number;
  url: String;
  admin : user;
  constructor(params: {
    admin: user,
    name: String,
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

  getNewPouchConnection(user: user, baseName: String) {
    const [protocol, url] = this.url.split("//")
    return new PouchConnection(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`)
  }
}