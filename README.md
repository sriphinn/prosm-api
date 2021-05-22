# PROSM - API

Used in conjunction with the PROSM app, this API provides the functionality for registering users and finding, creating, deleting, and editing posts.

You can also view the [live site](https://prosm-app.vercel.app/) or visit the [frontend repo](https://github.com/sriphinn/prosm).


## Technologies

- Node and Express
  - Authentication via JWT
  - RESTful API
- Testing
  - Supertest (integration)
  - Mocha and Chai (unit)
- Database
  - Postgres
  - Knex.js

## Production

Deployed via Heroku

## API Endpoints

### Users Router

```
- /api/users
- - GET - gets user that matches
- - POST - creates a new user
```

### Posts Router

```
- /api/posts
- - GET - gets all posts by user id
- - POST - creates a new post

- /api/posts/:id
- - GET - gets post by id
- - DELETE - delete post by id
- - PATCH - edit post by id
```

### Auth Router

```
- /api/auth/login
- - POST - creates auth token to be stored in local storage
```
