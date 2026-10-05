import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';
try{process.loadEnvFile('.env')}catch{}
const {handler}=await import('./api/service.js');
const allowed=new Set(['/','/index.html','/style.css','/app.js','/resources.js','/search.js']);
http.createServer(async(req,res)=>{const u=new URL(req.url,'http://local');if(u.pathname==='/api/service'){req.query=Object.fromEntries(u.searchParams);res.status=c=>{res.statusCode=c;return res};res.json=d=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(d))};return handler(req,res)}if(!allowed.has(u.pathname)){res.writeHead(404);return res.end('Not found')}const name=u.pathname==='/'?'index.html':u.pathname.slice(1);res.setHeader('Content-Type',({'html':'text/html','css':'text/css','js':'application/javascript'})[path.extname(name).slice(1)]);res.end(await fs.readFile(name))}).listen(3000,()=>console.log('Open http://localhost:3000'));
