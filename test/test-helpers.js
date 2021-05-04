const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: 'test-first-1',
      last_name: 'test-last-1',
      email: 'test1@test.com',
      password: 'Password123!'
    },
    {
      id: 2,
      first_name: 'test-first-2',
      last_name: 'test-last-2',
      email: 'test2@test.com',
      password: 'Password123!'
    },
    {
      id: 3,
      first_name: 'test-first-3',
      last_name: 'test-last-3',
      email: 'test3@test.com',
      password: 'Password123!'
    },
    {
      id: 4,
      first_name: 'test-first-4',
      last_name: 'test-last-4',
      email: 'test4@test.com',
      password: 'Password123!'
    }
  ]
}

function makePostsArray(users) {
  return [
    {
      id: 1,
      title: 'First Test Post',
      modified: '2019-01-03T00:00:00.000Z',
      user_id: users[0].id,
      content: 'First test content.'
    },
    {
      id: 2,
      title: 'Second Test Post',
      modified: '2019-01-03T00:00:00.000Z',
      user_id: users[1].id,
      content: 'Second test content.'
    },
    {
      id: 3,
      title: 'Third Test Post',
      modified: '2019-01-03T00:00:00.000Z',
      user_id: users[2].id,
      content: 'Third test content.'
    },
    {
      id: 4,
      title: 'Fourth Test Post',
      modified: '2019-01-03T00:00:00.000Z',
      user_id: users[3].id,
      content: 'Fourth test content.'
    }
  ]
}

function makeExpectedPost(post) {
  return {
    id: post.id,
    title: post.title,
    modified: post.modified,
    user_id: post.user_id,
    content: post.content
  }
}

function makeMaliciousPost(user) {
  const maliciousPost = {
    id: 911,
    title: 'Very naughty <script>alert("xss");</script>',
    modified: new Date(),
    user_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  }
  const expectedPost = {
    ...makeExpectedPost(maliciousPost),
    title: 'Very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  }
  return {
    maliciousPost,
    expectedPost
  }
}

function makePostsFixtures() {
  const testUsers = makeUsersArray()
  const testPosts = makePostsArray(testUsers)
  return { testUsers, testPosts }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        prosm_posts,
        prosm_users
      `
    )
    .then(()=>
      Promise.all([
        trx.raw(`ALTER SEQUENCE prosm_posts_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE prosm_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('prosm_posts_id_seq', 0)`),
        trx.raw(`SELECT setval('prosm_users_id_seq', 0)`)
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('prosm_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('prosm_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedPostsTables(db, users, posts) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('prosm_posts').insert(posts)
    // update the auto sequence to match the forced values
    await trx.raw(
      `SELECT setval('prosm_posts_id_seq', ?)`,
      [posts[posts.length - 1].id],
    )
  })
}

function seedMaliciousPost(db, user, post) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('prosm_posts')
        .insert([post])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makePostsArray,
  makeExpectedPost,
  makeMaliciousPost,
  
  makePostsFixtures,
  cleanTables,
  seedPostsTables,
  seedMaliciousPost,
  makeAuthHeader,
  seedUsers
}