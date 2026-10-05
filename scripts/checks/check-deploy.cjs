/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
require('@next/env').loadEnvConfig(process.cwd());
const failures=[];
for(const name of ['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY']){
 if(!process.env[name]||process.env[name].startsWith('your-')||process.env[name].includes('your-project'))failures.push('Thiếu cấu hình '+name);
}
if(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_secret_'))failures.push('Public key không được là secret key');
if(Number(process.versions.node.split('.')[0])!==22)failures.push('Dùng Node.js 22.x để khớp môi trường triển khai');
for(const folder of ['src/app','src/frontend','src/backend','src/shared','public','supabase/migrations'])if(!fs.existsSync(folder))failures.push('Thiếu '+folder);
if(fs.existsSync('app'))failures.push('Root app/ sẽ che src/app/');
function checkImports(folder,forbidden){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())checkImports(file,forbidden);else if(/\.tsx?$/.test(file)){const contents=fs.readFileSync(file,'utf8');if(forbidden.test(contents))failures.push('Sai ranh giới FE/BE: '+file);}}}
checkImports('src/frontend',/from\s+['"]@\/backend\//);
checkImports('src/shared',/from\s+['"]@\/(frontend|backend)\//);
const tracked=spawnSync('git',['-c','safe.directory='+process.cwd().replaceAll('\\','/'),'ls-files'],{encoding:'utf8'});
if(tracked.status===0)for(const file of tracked.stdout.split('\n'))if(/(^|\/)\.env(?:$|\.)/.test(file)&&!file.endsWith('.example')||file.includes('.admin-credentials.local'))failures.push('File bí mật đang được Git theo dõi: '+file);
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log('PASS: Node 22, biến môi trường, cấu trúc FE/BE và kiểm tra file bí mật. Không in giá trị khóa.');
