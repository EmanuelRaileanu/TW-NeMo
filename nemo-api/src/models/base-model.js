import Bookshelf from '../bookshelf.js'

const IGNORED_COLUMNS = ['id', 'createdAt', 'updatedAt', 'imdbId', 'tmdbId', 'tmdbVoteAverage', 'tmdbNumberOfVotes', 'voteAverage', 'numberOfVotes']

export default class BaseModel extends Bookshelf.Model {
    constructor (props) {
        super(props)
    }

    get uuid () {
        return true
    }

    get hasTimestamps () {
        return ['createdAt', 'updatedAt']
    }

    async getColumns () {
        return Object.keys((await this.query(q =>  q.columnInfo()).fetchAll({ require: false })).toJSON()[0]).filter(column => !IGNORED_COLUMNS.includes(column))
    }

    async createBodyAccordingToModel(body) {
        const columns=await this.getColumns()
        let updateBody = {}
        for (const column in body) {
            if (body.hasOwnProperty(column) && columns.includes(column)) {
                updateBody[column] = body[column]
            }
        }
        return updateBody
    }
}