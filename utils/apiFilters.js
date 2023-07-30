const logger = require('./logger')

class APIFilters {

    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    // First Filter
    filter() {
        const queryCopy = {...this.queryString}
        let queryStr = JSON.stringify(queryCopy)
        logger.info(`Time: ${new Date().toISOString()}, Query String: ${queryStr}`)  

        // Removing fields from the query
        const removeFields = ['sort']
        removeFields.forEach( el => delete queryCopy[el])

        /* 
            Advance filter using; {
                lt: "less than (<)", 
                lte: "less than equal to (<=)" ,
                gt: "greater than (>),
                gte: "greater than equal to (>=)"
            }
        */
        queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
        

        this.query = this.query.find(JSON.parse(queryStr))
        return this
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            console.log(sortBy);
            logger.info(`Time: ${new Date().toISOString()}, Sort By: ${sortBy}`)  
            this.query = this.query.sort(this.queryString.sort)
        } else {
            this.query = this.query.sort('-postingDate')
        }
        return this
    }
}

module.exports = APIFilters