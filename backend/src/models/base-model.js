import Bookshelf from '../bookshelf.js'

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
}