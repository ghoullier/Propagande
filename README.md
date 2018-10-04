# Propagande

## Next generation real-time library

### Propagande break the codes of communication client/server by allowing you to :

# Calling Clients function from Server:

 - Register a function in the client's javascript:


## Client (Browser):
```javascript
function hello(message){
    console.log(message);
}
propagande.openFunction(hello)
```
 - Then in your server you can decid at any time to call the function hello of every clients currently connected

## Server (Node): 
```javascript
propagande.callClients('hello', "Hello everyone !")
```



# Create an User : 

 - Create an user is also very simple, it can be only done in the server

## Server (Node): 
```javascript
await propagande.createUser({name: "roulio",password: "chien"})
```

# Login from client

 - To login as a particular user : 

## Client (Browser) : 
```javascript
await propagande.login({name: 'roulio',password: 'chien'})
```

# Call a particular user function from server:

 - Back-end can call a specified user fonction, the function will we called on every connected clients from this user.

## Server (Node):
```javascript
propagande.callClientUser('roulio', 'hello', "hey roulio !")
```
## Front (Browser):
```javascript
await propagande.login({name: 'roulio',password: 'chien'})
function hello(message){
    console.log(message);
}
propagande.openFunction(hello)
```

# Create and calling Groups

 - It is great to call every front-end, or just one user, it is also possible to create groups and assign user to it, then call the entire group.

## Server (Node):
```javascript
await propagande.createGroup('hero');
await propagande.assignUserToGroup('roulio', 'hero');
await propagande.assignUserToGroup('franck', 'hero');
await propagande.front.callGroup('hero', 'hello', "hello to all the heroes !")
```
Still the same for the client
## Client (Browser): 
```javascript
await propagande.login({name: 'roulio',password: 'chien'})
function hello(message){
    console.log(message);
}
propagande.openFunction(hello)
```
# Calling Server function from Client: 

 - You can also register a function in your server that will be callable from client, well this is not better than a lame HTTP call, or is it ?

 The big advantage compared to a HTTP call, is that when the client call the function, it can provide an optional callback, and the server who receveid the call, can trigger the callback as many time as desired.

  - In this example, the console of the client will display "yes", then 3 secondes lather, "WAIT NO !!"

## Client (Browser):
```javascript
propagande.callServer("ploc", null, (result) => {
    console.log(result);
})
```

## Server(Node):
```javascript
function ploc(user, param, callBack){
    console.log(user.name+" called"); //in our case, user is null 
    callBack("yes")
    setTimeout(() => {
        callBack("WAIT NO !!")
    }, 3000)
}
propagande.openFunction(ploc)
```

# Setup Propagande

## Propagande need CouchDB to be installed with an admin created

### [Install CouchDB](http://docs.couchdb.org/en/1.6.1/install/)

### Configure CouchDB to send cross-origin content

```
$> npm install -g add-cors-to-couchdb
```
```
$> add-cors-to-couchdb
```
### Enable CouchDB to open connexion somewhere else than localhost
Edit the configuration file : 
```
/etc/couchdb/default.ini
```
Set "bind_address" to "0.0.0.0"

### Create a CouchDB admin

```html
$> curl -s -X PUT http://localhost:5984/_config/admins/adminName -d '"adminPassword"'
```
Replacing adminName by the name of the admin and adminPassword by the password of the admin keeping both quotes


## Use Propagande Server in your node application
```
$> npm install --save propagande
```
Then in your JavaScript : 
```javascript
const { PropagandeServer } = require('propagande')

const propagande = new PropagandeServer({
  appName: "myapp",// Choose an app, it will create it if not existing yet
  admin: {
    name: 'adminName', //CouchDB Admin you have create above
    password: 'adminPassword'
  }
})
// Ready !
```

## Use Propagande Client in your browser

```html
<script src="propagande-min.js"></script>
```
```javascript
const propagande = new PropagandeClient({appName : "myApp"})
// Ready !
```


# Deployment
### The configuration above work on localhost by default, to run Propagande on production you must configure urls

## Server (Node):
```javascript
const { PropagandeServer } = require('propagande')
const propagande = new PropagandeServer({
    appName: "myapp",
    couchUrl: "http://mypouchdb.com", //only if CouchDB is not running on the same machine as Node
    couchPort: 4567,// only if couchDB is not installed with default port (5984)
    propagandePort : 5387, //only If you want to change the port of propagande socket (5555)
    admin: {
        name: 'adminName',
        password: 'adminPassword'
  }
})
// Ready !
```
```javascript
const propagande = new PropagandeClient({
    appName : "myApp",
    propagandeServerUrl : "http://MyApp.com" //Url where your PropagandeServer is running
    propagandeServerPort: 5387, //only if you have changed th Propagande socket in node
    couchUrl : 'http://mypouchdb.com', //only if CouchDB is not running on the same machine as PropagandeServer
    couchPort: 4567, // only if couchDB is not installed with default port (5984)
})
// Ready !
```