# Propagande

## Very light real-time library for both back-end and front-end that provide the essentials.

### This lib is as scalable as couchDB since it is based on it.

# Call front-end function from backend : 

 - In your frontent you can register a function to be callable from your backend initiative, every front-end connecteds will be called


## Front : 
```javascript
const back = new Backend('http://myserver.com');

const hello = (str) => {
  console.log('Notification ~>', str);
}

back.addFunction(hello);
```

## Back : 
```javascript

  const server = new Server('http://myserver.com');
  await server.init();
  server.front.callFront('hello', 'Wake up everyone !!')
```

# Call back-end function from front-end : 

 - You can also register a function in your backend that will be callable from front, well this is not better than a lame HTTP call, or is it ?

 The big advantage compared to a HTTP call, is that when the front-end call the function, it can provide an optional callback, and the back-end who receveid the call, can trigger the callback as many time as desired.

  - In this example, the console of the front-end will display "yes", then 3 secondes lather, "WAIT NO !!"

## Front : 
```javascript
const back = new Backend('http://myserver.com');
back.callNode("ploc", { foo: "eh eh eh" }, (res) => {
    console.log(res);
})
```

## Back : 
```javascript
const server = new Server('http://myserver.com');
await server.init();

const ploc = (user, param, callBack) => {
    console.log(user.name+" called"); // user is null is our case
    callBack("yes")
    setTimeout(() => {
        callBack("WAIT NO !!")
    }, 3000)
}

server.openFunction(ploc)
```

# Create an User : 

 - Create an user is also very simple, it can be only done in the backend

## Back : 
```javascript
const server = new Server();
await server.init();
await server.createUser({
  name: "roulio",
  password: "chien"
})
```

# Login from front : 

 - To login as a particular user : 

## Front : 
```javascript
    const back = new Back();
    await back.login({
        name: 'roulio',
        password: 'chien'
    })
})
```

# Call a particular user front-end function from back-end:

 - Back-end can call a specified user fonction, the function will we called on every connected front-end from this user. 

## Back:
```javascript
const server = new Server();
await server.init();
server.front.callFrontUser('roulio', 'hello', "hey roulio !")
```
## Front:
```javascript
const back = new Backend('http://myserver.com');
await back.login({
    name: 'roulio',
    password: 'chien'
})
const hello = (str) => {
  console.log('Notification ~>', str);
}
back.addFunction(hello);
```

# Create and calling Groups

 - It is great to call every front, or just one user, it is also possible to create groups and assign user to it, then call the entire group.

## Back:
```javascript
const server = new Server();
await server.init();
await server.createGroup('hero');
await server.assignUserToGroup('roulio', 'hero');
await server.assignUserToGroup('franck', 'hero');
await server.front.callGroup('hero', 'hello', "hello to all the heroes !")
```

## Front: 
```javascript
const back = new Backend('http://myserver.com');
await back.login({
    name: 'roulio',
    password: 'chien'
})
const hello = (str) => {
  console.log('Notification ~>', str);
}
back.addFunction(hello);
```
