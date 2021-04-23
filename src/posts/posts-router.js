const express = require('express')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/jwt-auth')
const logger = require('../logger')

const postsRouter = express.Router()
const jsonBodyParser = express.json()


postsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    PostsService.getAllPosts(req.app.get('db'), req.user.id)
      .then(posts => {
        res.json(posts.map(PostsService.serializePost))
      })
      .catch(next)
  })

  .post(jsonBodyParser, (req, res, next) => {
    const { title, content } = req.body

    for (const field of ['title', 'content'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
    const newPost = { title, content, user_id: req.user.id }
    return PostsService.insertPost(
      req.app.get('db'),
      newPost
    )
      .then(post => {
        res
          .status(201)
          .json(PostsService.serializePost(post))
      })
      .catch(next)
  })

postsRouter
  .route('/:id')
  .all(requireAuth)
  // .all(checkPostExists)
  .all((req, res, next) => {
    const { id } = req.params;
    console.log('user.id', req.user.id)
    PostsService.getById(req.app.get('db'), id, req.user.id)
      .then(post => {
        if (!post) {
          logger.error(`Post with id ${id} not found.`);
          return res
            .status(404)
            .json({ message: "Post doesn't exist" });
        }
        res.post = post
        next()
      })
      .catch(next)
  })

  .get((req, res) => {
    res.json(PostsService.serializePost(res.post));
  })

  .delete((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db')
    PostsService.deletePost(knexInstance, id)
      .then(post => {
        if (!post) {
          logger.error(`Post with id ${id} not found.`);
          return res
            .status(404)
            .json({ message: "Post doesn't exist." });
        }
        logger.info(`Post with id ${id} deleted.`);
        res
          .status(204)
          .end();
      })
      .catch(next)
  })

  .patch(jsonBodyParser, (req, res, next) => {
    const { title, content } = req.body
    const postToUpdate = { title, content }
    
    const numberOfValues = Object.values(postToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: `Request body must contain either 'title' or 'content'`
      })
    }

    PostsService.updatePost(
      req.app.get('db'),
      req.params.id,
      postToUpdate
    )
      .then(numRowsAffected => {
        res.json({...postToUpdate, id:req.params.id})
      })
      .catch(next)
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
        next(error)
      }
    }

module.exports = postsRouter