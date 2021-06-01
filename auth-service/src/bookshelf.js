import knex from 'knex'
import knexConfig from '../knexfile.js'
import bookshelf from 'bookshelf'
import bookshelfUuid from 'bookshelf-uuid'

const Bookshelf = bookshelf(knex(knexConfig[process.env.DB_ENV || 'development']))

Bookshelf.plugin(bookshelfUuid)

export default Bookshelf