import { database } from '@/db';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { sampleFood } from '@/lib/food';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 try{const user=await getChatGPTUser();if(!user)return reply({activities:[],signedIn:false});
 const {results}=await database().prepare('SELECT id,kind,ref,title,quantity,location,diet,deadline,notes,status,created_at FROM activities WHERE user_id=? ORDER BY created_at DESC LIMIT 200').bind(user.userId).all();return reply({activities:results,signedIn:true});
 }catch(e){console.error('Read rescue data failed',e);return reply({error:'Your saved activity is unavailable. Please try again.'},503)}
}
export async function POST(request:Request){
 try{
 const user=await getChatGPTUser();if(!user)return reply({error:'Sign in to save your progress.'},401);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Invalid request origin.'},403);
 if(Number(request.headers.get('content-length')||0)>16000)return reply({error:'Request too large.'},413);
 const b=await request.json() as Record<string,unknown>;const db=database(); const uid=user.userId;
 const clean=(v:unknown,max=120)=>typeof v==='string'?v.trim().slice(0,max):'';
 const action=clean(b.action);
 if(action==='advance'){
 const id=clean(b.id);const row=await db.prepare('SELECT status FROM activities WHERE id=? AND user_id=? AND kind=?').bind(id,uid,'claim').first<{status:string}>();
 if(!row)return reply({error:'Pickup not found.'},404);
 if(row.status==='delivered')return reply({ok:true});
 const next=row.status==='claimed'?'picked-up':'delivered';
 await db.prepare('UPDATE activities SET status=? WHERE id=? AND user_id=? AND status=?').bind(next,id,uid,row.status).run();return reply({ok:true});
 }
 if(action==='claim'){
 const ref=clean(b.ref); const sample=sampleFood.find(x=>x.id===ref);
 const own=sample?null:await db.prepare('SELECT title,quantity,location,deadline FROM activities WHERE id=? AND user_id=? AND kind=?').bind(ref,uid,'donation').first<{title:string;quantity:number;location:string;deadline:string}>();
 if(!sample&&!own)return reply({error:'This food listing is unavailable.'},404);
 if(own&&new Date(own.deadline).getTime()<Date.now())return reply({error:'The pickup window has ended.'},409);
 const food=sample||own!;
 await db.prepare('INSERT OR IGNORE INTO activities (id,user_id,kind,ref,title,quantity,location,diet,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),uid,'claim','claim:'+ref,food.title,food.quantity,food.location,sample?.diet||'Vegetarian','Demo pickup','claimed',new Date().toISOString()).run();return reply({ok:true});
 }
 if(!['donation','volunteer','organization','recipient','help'].includes(action))return reply({error:'Choose a valid action.'},400);
 const title=clean(b.title),location=clean(b.location),notes=clean(b.notes,600);const qty=Number(b.quantity||0);const diet=clean(b.diet)||'Vegetarian';const deadline=clean(b.deadline);
 if(title.length<2||location.length<2)return reply({error:'Please provide a name or food title and a location.'},400);
 if(['donation','recipient','help'].includes(action)&&(!Number.isInteger(qty)||qty<1||qty>10000))return reply({error:'Enter a quantity between 1 and 10,000.'},400);
 if(action==='donation'&&(!deadline||!Number.isFinite(Date.parse(deadline))||Date.parse(deadline)<=Date.now()))return reply({error:'Choose a future pickup deadline.'},400);
 if(!['Vegetarian','Non-vegetarian','Vegan'].includes(diet))return reply({error:'Choose a valid food type.'},400);
 const id=crypto.randomUUID();await db.prepare('INSERT INTO activities (id,user_id,kind,ref,title,quantity,location,diet,deadline,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,uid,action,id,title,qty,location,diet,action==='donation'?new Date(deadline).toISOString():null,notes,action==='donation'?'available':'saved',new Date().toISOString()).run();return reply({ok:true,id});
 }catch(e){console.error('Save rescue data failed',e);return reply({error:'We could not save this action. Your input is still here; please try again.'},503)}
}
