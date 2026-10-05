"use client";

import { useLandingSection } from "./landing-section";
import { useTeamData } from "@/lib/hooks/use-team-data";
import { FestivalStagePoster } from "./festival-stage-poster";

export function AdvisoryBoard() {
  const section = useLandingSection();
  const { advisors } = useTeamData();

  return (
    <section id="advisors" className="home-section">
      {/* KHUNG POSTER CHUẨN Y CHANG ẢNH CANVA */}
      <FestivalStagePoster
        id="poster-advisors"
        title={section?.title || "BAN CỐ VẤN"}
        subtitle={section?.description}
        posterImage={section?.asset?.url || "/images/posters/poster-ban-co-van.png"}
        members={advisors.map((adv) => ({
          id: adv.id,
          name: adv.name,
          role: adv.role,
          image: adv.image,
          quote: adv.quote,
          title: adv.unit,
        }))}
      />
    </section>
  );
}
