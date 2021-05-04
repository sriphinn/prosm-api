const xss = require('xss')

const PostsService = {
  getAllPosts(db, user_id) {
    return db
      .from('prosm_posts')
      .select('*').where({ user_id })
  },

  getById(db, id, user_id) {
    return PostsService.getAllPosts(db, user_id)
      .where('id', id)
      .first()
  },

  serializePost(post) {
    return {
      id: post.id,
      title: xss(post.title),
      modified: new Date(post.modified),
      content: xss(post.content),
      user_id: post.user_id
    }
  },

  insertPost(db, newPost) {
    return db
      .insert(newPost)
      .into('prosm_posts')
      .returning('*')
      .then(([post]) => post)
  },

  deletePost(db, id) {
    return db.from('prosm_posts')
      .where({ id })
      .delete()
  },

  updatePost(db, id, newPostFields) {
    return db.from('prosm_posts')
      .where({ id })
      .update(newPostFields)
  }
}

module.exports = PostsService