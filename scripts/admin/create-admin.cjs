/* eslint-disable @typescript-eslint/no-require-imports */
const readline=require('node:readline');
const fs=require('node:fs'),crypto=require('node:crypto');
const {createClient}=require('@supabase/supabase-js');
require('@next/env').loadEnvConfig(process.cwd());
async function main(){
 if(!process.env.SUPABASE_SECRET_KEY)throw new Error('SUPABASE_SECRET_KEY is required.');
 const email=process.argv[2];if(!email||!email.includes('@'))throw new Error('Usage: node scripts/admin/create-admin.cjs your@email.com');
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const generated=process.argv.includes('--generate');
 if(generated&&fs.existsSync('.admin-credentials.local.txt'))throw new Error('File thông tin đăng nhập đã tồn tại; không ghi đè.');
 let password;
 if(generated)password=crypto.randomBytes(24).toString('base64url');
 else {
  console.log('Nhập mật khẩu (ít nhất 12 ký tự; ký tự được ẩn):');
  const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
  rl._writeToOutput=()=>{};
  password=await new Promise(resolve=>rl.question('',resolve));rl.close();console.log();
 }
 if(password.length<12)throw new Error('Mật khẩu phải có ít nhất 12 ký tự.');
 const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});if(error)throw error;
 const grant=await db.from('admin_users').insert({user_id:data.user.id});
 if(grant.error){await db.auth.admin.deleteUser(data.user.id);throw grant.error;}
 if(generated){fs.writeFileSync('.admin-credentials.local.txt',`Email: ${email}\nPassword: ${password}\n`,{flag:'wx',mode:0o600});console.log('Mật khẩu đã lưu vào .admin-credentials.local.txt (không in ra terminal).');}
 console.log('Đã tạo tài khoản admin:',email);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
