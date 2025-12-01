const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5500;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log('Request: ' + pathname + (Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.setHeader('Content-Security-Policy', "default-src 'self' http://localhost:* http://127.0.0.1:* https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://apis.google.com chrome-extension:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.googleapis.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https: data:; img-src 'self' data: https: http: blob:; frame-src 'self'; object-src 'none';");

    if (pathname === '/verify-email' && query.token) {
        console.log('Routing /verify-email to /client/verify-email.html with token: ' + query.token);
        pathname = '/client/verify-email.html';
    }

    if (pathname === '/' || pathname === '') {
        pathname = '/client/index.html';
    }

    let filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath);

    if (!ext) {
        filePath += '.html';
    }

    const realPath = path.resolve(filePath);
    const projectRoot = path.resolve(__dirname);
    
    if (!realPath.startsWith(projectRoot)) {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end('<h1>403 - Forbidden</h1>', 'utf-8');
        console.log('403 Forbidden: ' + realPath);
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
                        h1 { color: #333; }
                        p { color: #666; }
                        a { color: #667eea; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <h1>404 - File Not Found</h1>
                    <p>The requested file does not exist: ${pathname}</p>
                    <p><a href="/client/">Go to Home</a></p>
                </body>
                </html>
            `, 'utf-8');
            console.log('404: ' + filePath);
        } else {
            const contentTypes = {
                '.html': 'text/html; charset=utf-8',
                '.js': 'text/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.webp': 'image/webp',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject'
            };

            const contentType = contentTypes[ext] || 'text/plain';

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
            console.log('200: ' + filePath);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(70));
    console.log('Server is running!');
    console.log('='.repeat(70));
    console.log('\nURL: http://' + HOST + ':' + PORT);
    console.log('Root: ' + __dirname + '\n');
    console.log('Available Routes:');
    console.log('   http://' + HOST + ':' + PORT + '                                         -> /client/index.html');
    console.log('   http://' + HOST + ':' + PORT + '/client/                                 -> /client/index.html');
    console.log('   http://' + HOST + ':' + PORT + '/verify-email?token=xxx                  -> /client/verify-email.html');
    console.log('   http://' + HOST + ':' + PORT + '/client/verify-email?token=xxx           -> /client/verify-email.html');
    console.log('\n' + '='.repeat(70));
    console.log('\nServer ready! Open http://' + HOST + ':' + PORT + '/client/ in your browser\n');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('\nError: Port ' + PORT + ' is already in use!');
        console.error('\nTry one of these solutions:');
        console.error('\n1. Kill the process using port ' + PORT + ':');
        console.error('   netstat -ano | findstr :' + PORT);
        console.error('   taskkill /PID <PID> /F');
        console.error('\n2. Use a different port by editing server.js\n');
    } else {
        console.error('\nServer error: ' + err.message + '\n');
    }
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n\nServer shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
