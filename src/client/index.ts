import PouchDB from 'pouchdb';
import PouchDBAuth from 'pouchdb-authentication';
import { Databases, user } from '../common/interfaces';
import { MAIN_NOTIFICATION_TABLE } from '../common/global';

PouchDB.plugin(PouchDBAuth);

const WAIT_RETRY = 4000;

interface ClientOptions {
  url: string;
  appName: string;
}

interface UserData {
  name: string;
  roles: string[];
}

export default async (
  options: ClientOptions
): Promise<Client> => {
  const client = new Client(options);
  await client.init();
  return client;
};

export class Client {
  databases: Databases = {};
  notifListened: { [key: string]: boolean } = {};
  routes: { [name: string]: Function } = {};
  url: string;
  appName: string;
  user?: UserData;
  logged = false;
  session: any;
  constructor(options: ClientOptions) {
    this.url = options.url;
    this.appName = options.appName;
    this.databases.mainNotif = this.getPouch(MAIN_NOTIFICATION_TABLE);
    this.listenNotifDb(this.databases.mainNotif);
  }

  async init() {
    const testDb = this.getPouch('');
    const session = await testDb.getSession();
    if (session.userCtx.name !== null) {
      this.user = <UserData>session.userCtx;
      this.user.name = this.user.name.split(`${this.appName}_`)[1];
      this.syncNotifs();
    }
  }

  private getPouch(name: string): PouchDB.Database {
    let string;
    if (name !== '_users') {
      name = `propagande_${this.appName}_${name}`;
    }
    string = `${this.url}/${name}`;
    return new PouchDB(string, <any>{
      fetch: (url: any, opts: any) => {
        opts.credentials = 'include';
        return (<any>PouchDB).fetch(url, opts);
      },
      skip_setup: true
    });
  }

  private async listenNotifDb(database: PouchDB.Database) {
    if (!this.notifListened[database.name]) {
      this.notifListened[database.name] = true;
      const retry = () => {
        database
          .changes({
            live: true,
            since: 'now',
            include_docs: true
          })
          .on('change', async (event: any) => {
            if (this.routes[event.doc.route]) {
              try {
                await this.routes[event.doc.route](event.doc.params);
              } catch (error) {
                console.error(error);
              }
            }
          })
          .on('error', error => {
            setTimeout(retry, WAIT_RETRY);
          });
      };
      retry();
    } else {
      // allready listening
    }
  }

  private syncNotifs() {
    if (this.user) {
      this.listenNotifDb(this.getPouch(`${this.user.name}_notifs`));
      for (let role of this.user.roles) {
        this.listenNotifDb(this.getPouch(`group_${role}`));
      }
    }
  }

  async login(user: user) {
    this.user = <UserData>(
      await this.databases.mainNotif.logIn(
        `propagande_${this.appName}_${user.name}`,
        user.password
      )
    );
    this.user.name = this.user.name.split(`${this.appName}_`)[1];
    this.syncNotifs();
  }

  async logout(user: user) {
    await this.databases.mainNotif.logOut();
    this.user = undefined;
  }

  addRoute(name: string, callback: Function) {
    if (this.routes[name]) {
      throw new Error(`Route ${name} allready exist`);
    }
    this.routes[name] = callback;
  }
}
