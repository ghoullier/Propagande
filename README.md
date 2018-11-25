# Propagande (alpha)

## Let your front-ends know your message

### Propagande is a light library to make server-to-client call, with authentification management 

# Client-side route

 - Make an express-like route in your browser javascript 


## Client (Browser):
```javascript
propagandeApp.addRoute("hello", (params) => {
    console.log(params);
})
```
 - Then in your nodejs express app, you can call the route of every client connected at once

## Server (Node): 
```javascript
await propagandeApp.callRoute('hello', "hello everyone !"),
```

# User Creation and login: 

 - Create an user from the server-side

## Server (Node): 
```javascript
await propagandeApp.createUser({name: 'roulio',password: 'chien'})
```
 - you can now login from the client, a cookie session is created and the client doesn't have to reconnect after refreshing the browser.
## Client (Browser) : 
```javascript
await propagandeApp.login({name: 'roulio',password: 'chien'})
```
 - To end a session you can use logout
```javascript
await propagandeApp.logout()
```

# Call a particular user route from server:

 - Once users are created, the server can call the route of only specified user

## Server (Node):
```javascript
await propagandApp.callRouteUser('roulio', 'hello', "hey, damn you in particular !"),
```
## Front (Browser):
 - The browser code is the same as above
```javascript
await propagandeApp.login({name: 'roulio',password: 'chien'})
propagandeApp.addRoute("hello", (params) => {
    console.log(params);
})
```

# Groups Management

 - You can also create groups, then assign users to it, then call entire group at once

## Server (Node):
```javascript
await propagandeApp.createGroup('paidUsers')
await propagandeApp.addUsersToGroup(["roulio", "raoul", "cindy"], 'paidUsers')
await propagandeApp.callRouteGroup('paidUsers', 'hello', "hello to all the paid-users")
```

# Setup Propagande

## In your NodeJS Express application
```
$> npm install --save propagande
```

```javascript
const { propagandeServer } = require("propagande")
const express = require("express")

//...

// your express app
const app = express();
app.listen(4000)

const propagandeApp = await propagandeServer({
    appName: "fougere", //Give your propagandeApp a name
    // You must create an admin with all right privileges
    admin: { 
        name: "admin",
        password: "admin"
    },
    app, //give your express app
    expressPort: 4000 //give the port of your express app
})

```

## Use Propagande Client in your browser
 - get the minimified version of propagande client here : 
    https://github.com/dezmou/Propagande/blob/master/browser/propagande-min.js

```html
<script src="propagande-min.js"></script>
```
```javascript
const propagandeApp = await propagandeClient({
    appName: "fougere", //name of your propagande app
    url: 'http://localhost:4000' // url and port of your express application
})
```
