import { cmsClient } from '@/lib/cms/auth';
import { dbError, failure, json } from '@/lib/cms/http';
import { compareProgramCards } from '@/lib/team-card-order';
export async function GET() {
  try {
    const client = cmsClient();
    const [assignments,departments] = await Promise.all([
      client.from('assignments').select('*,person:people(*,asset:assets(url)),department:departments(*)').order('sort_order').order('id'),
      client.from('departments').select('*').order('sort_order').order('id'),
    ]);
    dbError(assignments.error); dbError(departments.error);
    const rows = assignments.data!.filter(a=>a.person);
    const advisors = rows.filter(a=>a.role==='advisor').map(a=>({id:a.person!.id,name:a.person!.name,role:a.title,unit:a.person!.unit,image:a.person!.asset?.url,quote:a.person!.quote}));
    const organizers = rows.filter(a=>a.role==='organizer').map(a=>({id:a.person!.id,name:a.person!.name,role:a.title,title:a.responsibility,image:a.person!.asset?.url,message:a.person!.quote}));
    const volunteers = rows.filter(a=>(!a.department_id||a.department)&&(a.role==='volunteer'||a.responsibility==='program-card')).map(a=>({id:a.id,personId:a.person!.id,name:a.person!.name,code:a.person!.code??'',department:a.department?.name??'',departmentId:a.department_id,departmentSortOrder:a.department?.sort_order??0,role:a.role,sortOrder:a.sort_order,image:a.person!.asset?.url,cardImage:a.person!.asset?.url,quote:a.person!.quote,badge:a.person!.badge})).sort(compareProgramCards);
    return json({advisors,organizers,volunteers,departments:departments.data!.map(d=>({id:d.id,department:d.name,departmentCode:d.code??'',members:rows.filter(a=>a.department_id===d.id&&['lead','deputy'].includes(a.role)).map(a=>({id:a.person!.id,name:a.person!.name,role:a.role==='lead'?'Trưởng Ban':'Phó Ban',image:a.person!.asset?.url}))}))});
  } catch(e) { return failure(e); }
}
