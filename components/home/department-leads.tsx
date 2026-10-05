"use client";

import { useState } from "react";
import { useLandingSection } from "./landing-section";
import { useTeamData } from "@/lib/hooks/use-team-data";
import { FestivalStagePoster } from "./festival-stage-poster";

export function DepartmentLeads() {
  const section = useLandingSection();
  const { departments } = useTeamData();
  const [selectedDeptId, setSelectedDeptId] = useState<string>("dept-nd-tt");

  // Tìm ban được chọn hoặc ban đầu tiên
  const currentDept =
    departments.find((d) => d.id === selectedDeptId) || departments.find(d => d.department.includes('Nội Dung - Truyền Thông') && d.members.length > 0) || departments.find(d => d.members.length > 0) || departments[0] || null;

  // Thành viên của ban hiện tại (lấy tối đa 3 thành viên theo khung)
  const members = currentDept?.members || [];

  // Poster mapping: Ban Nội Dung - Truyền Thông có poster chính thức
  const getPosterImage = (department: string) => {
    if (department.toLocaleLowerCase('vi').includes('nội dung') && department.toLocaleLowerCase('vi').includes('truyền thông')) return "/images/posters/poster-ban-noi-dung.png";
    return undefined; // Các ban khác tự động render khung động y chang mẫu Canva
  };

  return (
    <section id="department-leads" className="home-section">
      {/* THANH TAB CHUYỂN ĐỔI GIỮA CÁC BAN CHUYÊN MÔN */}
      <div className="section-inner department-filter" aria-label="Chọn ban">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => setSelectedDeptId(dept.id)}
            aria-pressed={currentDept?.id === dept.id}
          >
            {dept.department}
          </button>
        ))}
      </div>

      {/* KHUNG POSTER CHUẨN Y CHANG ẢNH CANVA */}
      <FestivalStagePoster
        id="poster-department-leads"
        title={currentDept ? currentDept.department.toUpperCase() : (section?.title || "TRƯỞNG BAN & PHÓ BAN")}
        subtitle={section?.description}
        posterImage={currentDept ? getPosterImage(currentDept.department) : undefined}
        members={members.map((mem) => ({
          id: mem.id,
          name: mem.name,
          role: mem.role,
          image: mem.image,
          title: currentDept?.department,
        }))}
      />
    </section>
  );
}
