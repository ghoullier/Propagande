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