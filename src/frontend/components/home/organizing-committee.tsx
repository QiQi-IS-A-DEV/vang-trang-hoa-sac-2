"use client";

import { useLandingSection } from "./landing-section";
import { useTeamData } from "@/frontend/lib/hooks/use-team-data";
import { FestivalStagePoster } from "./festival-stage-poster";

export function OrganizingCommittee() {
  const section = useLandingSection();
  const { organizers } = useTeamData();

  return (
    <section id="organizers" className="home-section">
      {/* KHUNG POSTER BAN TỔ CHỨC CHUẨN Y CHANG ẢNH CANVA */}
      <FestivalStagePoster
        id="poster-organizers"
        title={section?.title || "BAN TỔ CHỨC"}
        subtitle={section?.description}
        posterImage={section?.asset?.url || "/images/posters/poster-ban-to-chuc.png"}
        members={organizers.map((org) => ({
          id: org.id,
          name: org.name,
          role: org.role,
          image: org.image,
          quote: org.message,
          title: org.title,
        }))}
      />
    </section>
  );
}
