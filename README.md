# express-api-router
API router generator for express

# Installation
> `$ npm install @bhoos/express-api-router`

# Usage
## API declaration format
```javascript
const apiFunction = (session, arg1, arg2, arg3) => {
  // The first parameter is user session
  //...The api logic
  return 'result data';
}

// Example
const login = async (session, uid, pwd) => {
  return { uid, pwd };
}

const getRooms = async (session) => {
  return db.rooms.find({ 
    coinCharge: { $gte: session.user.coins },
  }).toArray();
}

const joinRoom = async (session, roomId) => {
  await db.rooms.updateOne({ id: roomId }, { 
    $inc: { users: 1 },
  });
  return true;
}
```

## Declare routes
```javascript
import { setupRouter } from '@bhoos/express-api-router';
import { Router } from 'express';

const api = {
  login,
  getRooms,
  joinRoom,
};

setupRouter(Router(), api, (r) => {
  r.route('getRooms');
  r.route('joinRoom', r.param('room'));
  r.route('login', r.form('uid'), r.form('pwd'));
  // Also available argument provider is r.query
});

// Use a more nested structure
const auth = { login };
const room = { all, join };
const api = { auth, room };

setupRouter(Router(), api, (r) => {
  r.branch('auth')
    .route('login', r.form('uid'), r.form('pwd'));
  r.branch('room')
    .route('all')
    .route('join', r.param('room'));
});
```
