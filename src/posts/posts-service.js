const xss = require('xss')

const PostsService = {
  getAllPosts(db) {
    return db
      .from('prosm_posts AS post')
      .select(
        'post.id',
        'post.title',
        'post.modified',
        'post.user_id',
        'post.content',
        db.raw(
          `json_strip_nulls(
            json_build_object(
              'id', usr.id,
              'first_name', usr.first_name,
              'last_name', usr.last_name,
              'email', usr.email,
            )
          ) AS "author"`
        ),
      )
      .leftJoin(
        'prosm_users AS usr',
        'post.author_id',
        'usr.id'
      )
      .groupBy('post.id', 'usr.id')
  },

  getById(db, id) {
    return PostsService.getAllPosts(db)
      .where('post.id', id)
      .first()
  },

  getByUser(db, id) {
    return PostsService.getAllPosts(db)
      .where('usr.id', id)
      .first()
  },

  serializePost(post) {
    const { author } = post
    return {
      id: post.id,
      title: xss(post.title),
      modified: new Date(post.modified),
      content: xss(post.content),
      author: {
        id: author.id,
        first_name: author.first_name,
        last_name: author.last_name,
        email: author.email
      },
    }
  }
}

module.exports = PostsService