import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const file of ['index.html','style.css','app.js','resources.js','search.js'])await copyFile(file,'public/'+file);
console.log('Cloudflare website files prepared.');
