const express = require('express')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/jwt-auth')

const postsRouter = express.Router()

postsRouter
  .route('/')
  .get((req, res, next) => {
    PostsService.getAllPosts(req.app.get('db'))
      .then(articles => {
        res.json(articles.map(PostsService.serializePost))
      })
      .catch(next)
  })

postsRouter
  .route('/:post_id')
  .all(requireAuth)
  .all(checkPostExists)
  .get((req, res) => {
    res.json(PostsService.serializePost(res.post))
  })

/* async/await syntax for promises */
async function checkPostExists(req, res, next) {
  try {
    const post = await PostsService.getById(
      req.app.get('db'),
      req.params.post_id
    )

    if (!post)
      return res.status(404).json({
        error: `Post doesn't exist`
      })
    
      res.post = post
      next()
  } catch (error) {
    next (error)
  }
}

module.exports = postsRouter 