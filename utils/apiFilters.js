const logger = require('./logger')

class APIFilters {

    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    // First Filter
    filter() {
        logger.info(`Time: ${new Date().toISOString()}, Query String: ${JSON.stringify(this.queryString)}`)
        this.query = this.query.find(this.queryString)
        return this
    }
}

module.exports = APIFilters