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

        // Remove fields from the query that are not in the model Job
        const removeFields = ['sort', 'fields', 'q', 'limit', 'page']
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

    // Second Filter
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

    // Third Filter
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
        } else {
            // I dont want to see this field in the results
            this.query = this.query.select('-__v')
        }
        return this
    }

    // Ford Filter Search
    searchByQuery () {
        if (this.queryString.q) {
            const qu = this.queryString.q.split('-').join(' ')
            this.query = this.query.find({$text: {$search: "\"" + qu + "\""}})
        }
        return this
    }

    // Fifth Filter Pagination
    pagination () {
        const page = parseInt(this.queryString.page, 10) || 1
        const limit = parseInt(this.queryString.limit, 10) || 10
        const skipResults = ( page - 1 ) * limit

        this.query = this.query.skip(skipResults).limit(limit)

        return this
    }
}

module.exports = APIFilters