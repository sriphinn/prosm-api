const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Posts Endpoints', function() {
  let db

  const {
    testUsers,
    testPosts
  } = helpers.makePostsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/posts`, () => {
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    )
    
    afterEach('cleanup', () => helpers.cleanTables(db))

    context(`Given no posts`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/posts')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context ('Given there are posts in the database', () => {
      beforeEach('insert posts', () => {
        helpers.cleanTables(db)
        helpers.seedUsers(db, testUsers)
        helpers.seedPostsTables(
          db,
          [],
          testPosts
        )
      }
      )

      // it('responds with 200 and all of the posts', () => {
      //   const expectedPosts = testPosts
      //   .filter(post => post.user_id === testUsers[0].id)
      //   .map(post =>
      //     helpers.makeExpectedPost(
      //       post
      //     )
      //   )
      //   return supertest(app)
      //     .get('/api/posts')
      //     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      //     .expect(200, expectedPosts)
      // })
    })

    context(`Given an XSS attack article`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPost,
        expectedPost
      } = helpers.makeMaliciousPost(testUser)

      beforeEach('insert malicious post', () => {
        helpers.cleanTables(db)
        return helpers.seedMaliciousPost(
          db,
          testUser,
          maliciousPost
        )
      })

      // it('removes XSS attack content', () => {
      //   return supertest(app)
      //     .get('/api/posts')
      //     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))   
      //     .expect(200)
      //     .expect(res => {
      //       expect(res.body[0].title).to.eql(expectedPost.title)
      //       expect(res.body[0].content).to.eql(expectedPost.content)
      //     })     
      // })
    })
  })

  describe(`GET /api/posts/:id`, () => {
    context(`Given no posts`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const postId = 123456
        return supertest(app)
          .get(`/api/posts/${postId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Post doesn't exist`})
      })
    })

    context('Given there are posts in the database', () => {
      beforeEach('insert posts', () =>
        helpers.seedPostsTables(
          db,
          testUsers,
          testPosts,
        )
      )

      it('responds with 200 and the specified post', () => {
        const postId = 1
        const expectedPost = helpers.makeExpectedPost(
          testPosts[postId - 1]
        )
        return supertest(app)
          .get(`/api/posts/${postId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedPost)
      })
    })

    context(`Given an XSS attack post`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPost,
        expectedPost
      } = helpers.makeMaliciousPost(testUser)

      beforeEach('insert malicious post', () => {
        return helpers.seedMaliciousPost(
          db,
          testUser,
          maliciousPost
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/posts/${maliciousPost.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedPost.title)
            expect(res.body.content).to.eql(expectedPost.content)
          })
      })
    })
  })
})