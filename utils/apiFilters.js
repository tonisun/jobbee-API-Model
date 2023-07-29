

class APIFilters {

    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }


    // First Filter
    filter() {
        this.query = this.query.find(this.queryString)
        return this
    }
}