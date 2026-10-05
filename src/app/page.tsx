import { Hero } from '@/frontend/components/home/hero';
import { VolunteerCards } from '@/frontend/components/home/volunteer-cards';
import { ActivityRecap } from '@/frontend/components/home/activity-recap';
import { HomeFooter } from '@/frontend/components/home/home-footer';
import { LandingSection } from '@/frontend/components/home/landing-section';
import { cmsClient } from '@/backend/cms/auth';
import { GET as loadTeam } from '@/app/api/team/route';
import { TeamDataProvider } from '@/frontend/lib/hooks/use-team-data';
import { TeamSlideshow } from '@/frontend/components/home/team-slideshow';
import { teamPosters } from '@/shared/data/team-posters';
const components = {hero:Hero,volunteers:VolunteerCards,recap:ActivityRecap,footer:HomeFooter};
export const dynamic = 'force-dynamic';
export default async function HomePage() {
  const [{data,error},teamResponse,site]=await Promise.all([cmsClient().from('landing_sections').select('*,asset:assets(url)').eq('enabled',true).order('sort_order').order('id'),loadTeam(),cmsClient().from('site_settings').select('background:assets!site_settings_background_asset_id_fkey(url)').eq('id','main').single()]);
  const initialTeam=teamResponse.ok?await teamResponse.json():undefined;
  if(error)throw new Error('Không thể tải cấu hình trang chủ.');
  const slides=data.filter(s=>['advisors','organizers','departments'].includes(s.key)).sort((a,b)=>['organizers','advisors','departments'].indexOf(a.key)-['organizers','advisors','departments'].indexOf(b.key)).flatMap(s=>s.asset?[{src:s.asset.url,title:({advisors:'Ban cố vấn',organizers:'Ban tổ chức',departments:'Các ban chuyên môn'} as Record<string,string>)[s.key],section:s.key as 'advisors'|'organizers'|'departments'}]:teamPosters.filter(slide=>slide.section===s.key));
  const firstTeamSection=data.find(s=>['advisors','organizers','departments'].includes(s.key));
  return <main className="site-shell min-h-screen" style={site.data?.background?.url ? { backgroundImage: `linear-gradient(180deg, rgba(20, 5, 32, 0.45) 0%, rgba(16, 4, 26, 0.65) 100%), url("${site.data.background.url}")`, backgroundAttachment: 'fixed', backgroundPosition: 'center top', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' } : undefined}><TeamDataProvider initialData={initialTeam}>{data.map(s=>{
    if(['advisors','organizers','departments'].includes(s.key)) {
      if(s.id!==firstTeamSection?.id)return null;
      return <TeamSlideshow slides={slides} key="team-slideshow"/>;
    }
    const Component=components[s.key as keyof typeof components];
    return Component?<LandingSection section={s} key={s.id}><Component/></LandingSection>:null;
  })}</TeamDataProvider></main>;
}
