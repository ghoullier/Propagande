


const propagandeGlobal = {
  "DEFAULT_PROPAGANDE_URL": "http://localhost",
  "DEFAULT_PROPAGANDE_PORT": 5555,
  "DEFAULT_COUCHDB_HOST": "http://localhost",
  "DEFAULT_COUCHDB_PORT": 5984,
  "MAIN_NOTIFICATION_TABLE": "notifications",
  "USERS_TABLE": "_users",
  "DEFAULT_ADMIN_NAME": "root",
  "DEFAULT_ADMIN_PASSWORD": "root"
}

const genId = (name) => {
    return name + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 11);
}

class PouchConnexion {
    constructor(url) {
        this.couchdb = new pouchdb_1.default(url);
    }
    /**
     * Set document
     * @param doc
     */
    async put(doc) {
        return await this.couchdb.put(doc);
    }
    /**
     * Get document
     * @param id
     */
    async get(id) {
        return await this.couchdb.get(id);
    }
    /**
     * Add security rule
     * @param doc
     */
    async addSecurity(doc) {
        return await request_promise_1.default({
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
    async addValidation(name, func) {
        await this.put({
            "_id": "_design/" + name,
            "validate_doc_update": func.toString
        });
    }
    /**
     * Trigger function when CouchDB remote change
     * @param callback
     */
    watchChange(callback) {
        this.couchdb.changes({
            live: true,
            since: "now",
            include_docs: true
        }).on('change', (change) => {
            callback(change);
        });
    }
}

class PouchWrapper {
    constructor(params) {
        const paramD = Object.assign({
            admin: { name: 'none' },
            url: propagandeGlobal.DEFAULT_COUCHDB_HOST,
            port: propagandeGlobal.DEFAULT_COUCHDB_PORT
        }, params);
        this.port = paramD.port;
        this.url = paramD.url;
        this.admin = paramD.admin;
    }
    /**
     * Get a new PouchConnection instance with admin right
     * @param user
     * @param baseName
     */
    getNewPouchAdminCouchConnexion(baseName) {
        const [protocol, url] = this.url.split("//");
        return new PouchConnexion(`${protocol}//${this.admin.name}:${this.admin.password}@${url}:${this.port}/${baseName}`);
    }
    /**
     * Get a new PouchConnection instance with specified user right
     * @param user
     * @param baseName
     */
    getNewPouchConnexion(user, baseName) {
        const [protocol, url] = this.url.split("//");
        return new PouchConnexion(`${protocol}//${user.name}:${user.password}@${url}:${this.port}/${baseName}`);
    }
    /**
   * Get a new PouchConnection with Anonymous right
   * @param user
   * @param baseName
   */
    getNewAnonymousPouchConnexion(baseName) {
        return new PouchConnexion(`${this.url}:${this.port}/${baseName}`);
    }
}

class DirectCallClient {
    constructor(onConnection) {
        this.io = io('http://localhost:5555').connect();
    }
    /**
     * Register a function to be called when message
     * @param callBack
     */
    addMessageCallback(callBack) {
        this.io.on('message', (message) => {
            callBack(JSON.parse(message));
        });
    }
    /**
     * Send a socket Message
     * @param message
     */
    emit(message) {
        this.io.emit('message', JSON.stringify(message));
    }
}

class PropagandeClient {
    constructor(options) {
        const paramsD = Object.assign({
            propagandeServerUrl: propagandeGlobal.DEFAULT_PROPAGANDE_URL,
            propagandeServerPort: propagandeGlobal.DEFAULT_PROPAGANDE_PORT,
            couchUrl: propagandeGlobal.DEFAULT_COUCHDB_HOST,
            couchPort: propagandeGlobal.DEFAULT_COUCHDB_PORT,
        }, options);
        this.directCall = new directCall_1.DirectCallClient();
        this.serverCallbacks = {};
        this.openedFunctions = {};
        this.pouchWraper = new pouchWrapper_1.default({});
        this.notificationTable = this.pouchWraper.getNewAnonymousPouchConnexion(propagandeGlobal.MAIN_NOTIFICATION_TABLE);
        this.notificationTable.watchChange((event) => {
            this.onCouchEvent(event.doc);
        });
    }
    /**
     * Called when couchDB change
     */
    async onCouchEvent(doc) {
        if (doc.reason === "mainCall" || doc.reason === 'cibledCall' || doc.reason === 'groupCall') {
            if (this.openedFunctions[doc.name]) {
                try {
                    await this.openedFunctions[doc.name](doc.params);
                }
                catch (error) {
                    // ERROR WHILE EXECUTING FUNCTION
                }
            }
            else {
                // FUNCTION DOESN'T EXIST
            }
        }
    }
    /**
     * Login as a registred user
     * @param user
     */
    async login(user) {
        this.userTable = this.pouchWraper.getNewPouchConnexion(user, '_users');
        const userDB = await this.userTable.get('org.couchdb.user:' + user.name);
        this.userNotifTable = this.pouchWraper.getNewPouchConnexion(user, "users_" + user.name);
        this.userNotifTable.watchChange(this.onCouchEvent.bind(this));
        for (let role of userDB.roles) {
            const rolePouchConnexion = this.pouchWraper.getNewPouchConnexion(user, 'group_' + role);
            rolePouchConnexion.watchChange((event) => {
                this.onCouchEvent(event.doc);
            });
        }
    }
    /**
     * Call a a function that has been opened in propagandeServer
     * @param functionName
     * @param params
     * @param callback
     */
    callServer(functionName, params, callback) {
        const id = utils_1.genId('call');
        this.directCall.emit({
            reason: 'call',
            functionName,
            params,
            id,
            user: this.user
        });
        if (callback) {
            this.serverCallbacks[id] = callback;
        }
    }
    /**
     * Make a function callable from backend initiative
     */
    openFunction(func) {
        if (func.name === "") {
            throw new Error(`Anonymous function aren't openable`);
        }
        this.openedFunctions[func.name] = func;
    }
}

  
