class APIError extends Error {
    constructor (message, status) {
        super(message)
        this.name = this.constructor.name
        this.message = message
        this.status = status
        Error.captureStackTrace(this)
    }

    toJSON() {
        return {
            name: this.name,
            status: this.status,
            message: this.message
        }
    }
}

module.exports = APIError