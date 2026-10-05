import {createService} from './api/service.js';
const allowed=new Set(['/','/index.html','/style.css','/app.js','/resources.js','/search.js']);
export default {async fetch(request,env){const url=new URL(request.url);let response;
 if(url.pathname==='/api/service')response=await createService(env).fetch(request);
 else if(allowed.has(url.pathname))response=await env.ASSETS.fetch(request);
 else response=new Response('Not found',{status:404});
 const secure=new Response(response.body,response);secure.headers.set('X-Content-Type-Options','nosniff');secure.headers.set('Referrer-Policy','no-referrer');secure.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");return secure;
}};
