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
### Create a CouchDB admin

```
$> curl -s -X PUT http://localhost:5984/_config/admins/adminName -d '"adminPassword"'
```
Replacing adminName by the name of the admin and adminPassword by the password of the admin keeping both quotes

### Enable CouchDB to open connexion somewhere else than localhost
Edit the configuration file : 
```
/etc/couchdb/default.ini
```
Set "bind_address" to "0.0.0.0"

## Use Propagande Server in your node application
```
$> npm install --save propagande
```

## Use Propagande Client in your browser

```html
<script src="propagande-min.js"></script>
```

## You're all set !