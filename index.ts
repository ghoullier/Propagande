import PouchDB from 'pouchdb-node';
import express from "express";
import socketio from "socket.io";
import path from "path"
import request from 'request-promise';

const events = require('events');
const PUBLIC_PATH = 'public';

const genId = function (str: string) {
  return str + "_" + Math.random().toString(36).substr(2, 11);
};

const validate_onlyAdmin = function (newDoc: any, oldDoc: any, userCtx: any) {
  if (userCtx.roles.indexOf('_admin') !== -1) {
    return;
  }
  else {
    throw ({ forbidden: 'Only admins may edit the database' });
  }
}

const ADMIN_LOGIN = 'root';
const ADMIN_PASSWORD = 'root';

interface user {
  name: string;
  password?: String;
  data?: Object;
  roles?: any[];
}

class Data {
  db: any;
  userDb: any;
  admin: user;
  constructor() {
    this.admin = { name: ADMIN_LOGIN, password: ADMIN_PASSWORD }
    this.db = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/notifications`);
    this.userDb = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/_users`);
  }

  async initDataBase() {
    /**
     * Create Admin if non existing
     */
    try {
      await this.getUser({
        name: "whoeverReadThisIsAJackass",
      })
    } catch (error) {
      if (error.status === 401) {
        const res = await request.put(`http://localhost:5984/_config/admins/${this.admin.name}`, {
          body: this.admin.password,
          json: true
        })
      }
    }
  }

  async addValidation(baseName: string, validationName: string, func: Function) {
    const doc = {
      "_id": "_design/" + validationName,
      "validate_doc_update": func.toString()
    }
    const db = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/${baseName}`)
    await db.put(doc);
  }

  async addSecurity(baseName: string, doc: any) {
    return await request({
      url: `http://${this.admin.name}:${this.admin.password}@localhost:5984/${baseName}/_security`,
      method: 'PUT',
      body: JSON.stringify(doc),
    });
  }

  async updateUser(user: user) {
    // console.log(user.roles);
    const uu = await this.userDb.get("org.couchdb.user:" + user.name)
    return await this.userDb.put({
      ...uu, ...user
    })

    // return await this.userDb.put({
    //   _id: "org.couchdb.user:" + user.name,
    //   _rev,
    //   name: user.name,
    //   roles: user.roles,
    //   type: "user",
    //   password: user.password,
    //   data: user.data
    // })
  }

  async getUser(user: user) {
    return await this.userDb.get("org.couchdb.user:" + user.name)
  }

  async createUser(user: user) {
    await this.userDb.put({
      _id: "org.couchdb.user:" + user.name,
      name: user.name,
      roles: [],
      type: "user",
      password: user.password,
      data: user.data
    })
    const base = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/user_${user.name}`);
    await base.get('');
    await Promise.all([
      this.addValidation("user_" + user.name, 'validate', validate_onlyAdmin),
      this.addSecurity("user_" + user.name, {
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

  async createGroup(name: string) {
    const base = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/group_${name}`);
    await base.get('');
    await Promise.all([
      this.addValidation("group_" + name, 'validate', validate_onlyAdmin),
      this.addSecurity("group_" + name, {
        admins: {
          names: [],
          roles: []
        },
        readers: {
          names: [],
          roles: [name]
        }
      })
    ])
  }

  async update(id: string, doc: any) {
    const { _rev } = await this.userDb.get(id)
    try {
      await this.db.put({
        ...doc,
        _id: id,
        _rev
      });
    } catch (err) {
      console.log(err);
    }
  }

  /** 
   * Put in specified database
   * @param id 
   * @param doc 
   * @param dbName 
   */
  async putIn(id: string, doc: any, dbName: string) {
    try {
      const base = new PouchDB(`http://${this.admin.name}:${this.admin.password}@localhost:5984/${dbName}`);
      await base.put({
        ...doc,
        _id: id,
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Putin db
   * @param id 
   * @param doc 
   */
  async put(id: string, doc: any) {
    try {
      await this.db.put({
        ...doc,
        _id: id,
      });
    } catch (err) {
      (err);
    }
  }
}

class Socket {
  io: any;
  event: any;
  constructor(http: any) {
    this.io = require('socket.io')(http);
    this.event = new events.EventEmitter();
    this.io.on('connection', this.socketCon.bind(this));
  }

  /**
   * Making the function available from front
   */
  addFunction(func: Function) {
    this.event.on('sentBack', async (even: any) => {
      if (even.message.user !== null) {
        const test = new PouchDB(`http://${even.message.user.name}:${even.message.user.password}@localhost:5984/user_${even.message.user.name}`)
        even.message.user = even.message.user.name;
        try {
          await test.get('');
        } catch (error) {
          /**
           * Incorect user
           */
          return;
        }
      }
      const sendBack = (params: any) => {
        even.socket.emit('message', JSON.stringify({
          name: even.message.id,
          reason: 'callBack',
          params
        }))
      }
      func(even.message.user, even.message.params, sendBack);
    });
  }

  /**
   * Triggered when one client send one message
   * @param message 
   */
  async onMessage(even: any) {
    even.message = JSON.parse(even.message);
    if (even.message.reason === 'call') {
      this.event.emit('sentBack', even);
    }
  }

  private async socketCon(socket: any) {
    socket.on('message', (message: any) => {
      (message);
      this.onMessage({ socket, message })
    });
  }
}

class Front {
  socket: Socket;
  data: Data;
  constructor(http: any, data: Data) {
    this.socket = new Socket(http);
    this.data = data;
  }

  openFunction(func: Function) {
    this.socket.addFunction(func);
  }

  async callGroup(groupName: string, name: string, params: any) {
    await this.data.putIn(genId('groupCall'), {
      reason: 'mainCall',
      name,
      params
    }, "group_" + groupName);
    console.log("group_" + groupName);
  }

  async callFront(name: string, params: any) {
    await this.data.put(genId('mainCall'), {
      reason: 'mainCall',
      name,
      params,
    })
  }

  async callFrontUser(userName: string, funcName: string, params: any) {
    const res = await this.data.putIn(genId('cibledCall'), {
      reason: 'cibledCall',
      name: funcName,
      params,
    }, "user_" + userName)
  }

}

class Server {
  app: express.Application;
  http: any;
  server: any;
  data: Data;
  front: Front;
  constructor() {
    this.app = express();
    this.http = require('http').Server(this.app);
    this.data = new Data();
    this.front = new Front(this.http, this.data);
    this.initRoutes();
  }

  async createUser(user: user) {
    return this.data.createUser(user);
  }

  async updateUser(user: {
    name: string,
    password: string,
    data: any
  }) {
    return this.data.updateUser(user);
  }

  private initRoutes() {
    this.app.get('/', async (req, res) => {
      res.redirect('index.html')
    });
  }

  async assignUserToGroup(userName: string, groupName: string) {
    const user = await this.data.getUser({ name: userName })
    if (user.roles.includes(groupName)) {
      return;
    }
    user.roles.push(groupName);
    await this.data.updateUser(user);
  }

  async createGroup(name: string) {
    this.data.createGroup(name);
  }

  async init() {
    await this.data.initDataBase();
    this.app.set("port", 3000);
    this.app.use(express.static(PUBLIC_PATH))
    this.server = await new Promise(resolve => this.http.listen(3000, resolve));
  }
}

const main = async () => {
  const server = new Server();
  await server.init();

  // await server.createGroup('hero');
  // await server.assignUserToGroup('frank', 'hero');

  await server.front.callGroup('hero', 'hello', "Vous etes des champions ! ")
  server.front.callFront('hello', 'Node restarted')


  const ploc = async (user: any, param: any, back: Function) => {
    console.log("call from : ", user);
    // server.front.callFrontUser('modez', 'hello', "ratata")
    server.front.callFront('hello', "from " + user)
    // back("yes")
    // await new Promise(resolve => setTimeout(resolve, 1000));
    // back("wait... NO")
  }
  server.front.openFunction(ploc)


  // try {
  //   const res = await server.createUser({
  //     name: "frank",
  //     password: "poulet"
  //   })
  // } catch (error) {
  //   console.log(error);
  // }
}
main()