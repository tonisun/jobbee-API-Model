const serveFavicon = require('serve-favicon')
const path = require('path')

// Favicon-Middleware für Benutzer- und Adminbereiche
// for HTML file use <link rel="icon" href="/assets/images/documentation/favicon.ico" type="image/x-icon">
function faviconMiddleware(app) {
    
    // Middleware für den Benutzerbereich
    app.use((req, res, next) => {
        //console.log("req.url.startsWith('/?????'): "+ req.url);
        if (req.url.startsWith('/user')) {
            app.use(serveFavicon(path.join(__dirname, 'public', 'favicon-user.ico')))
        }
        next()
    })

    // Middleware für den Adminbereich
    app.use((req, res, next) => {
        //console.log("req.url.startsWith('/?????'): "+ req.url);
        if (req.url.startsWith('/admin')) {
            app.use(serveFavicon(path.join(__dirname, 'public', 'favicon-admin.ico')))
        }
        next()
    })

    app.use((req, res, next) => {
        // Split the URL path by '/' and keep only the first 4 parts
        const basePath = req.url.split('/').slice(0, 4).join('/')
        console.log(`Base URL path: ${basePath}`)

        if (basePath === '/api/v1/job') {
            app.use(serveFavicon(path.join(__dirname,'../', 'public', 'assets', 'images', 'documentation', 'favicon.ico')))
        }

        next()
    })
    
}

module.exports = faviconMiddleware;
