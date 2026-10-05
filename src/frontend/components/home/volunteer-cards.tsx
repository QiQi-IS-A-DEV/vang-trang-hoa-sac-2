"use client";
import { useState } from "react";
import { useTeamData } from "@/frontend/lib/hooks/use-team-data";
import { useLandingSection } from "./landing-section";
import { OriginalImage } from "./original-image";
import { compareProgramCards } from "@/shared/team-card-order";
import { FestivalIcon } from '../ui/festival-icon';

export function VolunteerCards() {
  const section = useLandingSection();
  const { volunteers, departments: teamDepartments, loading, error, refetch } = useTeamData();
  const [activeTab, setActiveTab] = useState("all");

  const sorted = [...volunteers].filter(v => v.cardImage).sort(compareProgramCards);

  // Lấy đầy đủ danh sách các ban:
  // 1. Từ danh mục các ban chính thức của chương trình
  // 2. Bổ sung các ban có trong dữ liệu thẻ
  const departmentList: string[] = [];
  const seenDepts = new Set<string>();

  for (const d of teamDepartments ?? []) {
    const name = d.department?.trim();
    if (name && !seenDepts.has(name.toLowerCase())) {
      seenDepts.add(name.toLowerCase());
      departmentList.push(name);
    }
  }

  for (const v of sorted) {
    const name = (v.department || "Tình nguyện viên").trim();
    if (name && !seenDepts.has(name.toLowerCase())) {
      seenDepts.add(name.toLowerCase());
      departmentList.push(name);
    }
  }

  // Lọc thẻ theo ban được chọn
  const seen = new Set<string>();
  const cards = sorted.filter(card => {
    const cardDept = (card.department || "Tình nguyện viên").trim();
    if (activeTab !== "all" && cardDept.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }
    if (seen.has(card.cardImage!)) return false;
    seen.add(card.cardImage!);
    return true;
  });

  const groups = new Map<string, typeof cards>();
  for (const card of cards) {
    const department = card.department || "Tình nguyện viên";
    const group = groups.get(department) ?? [];
    group.push(card);
    groups.set(department, group);
  }

  return (
    <section id="volunteers" className="lower-section">
      <div className="lower-inner">
        <header className="lower-heading">
          <span className="lower-eyebrow">Những người góp nên mùa trăng</span>
          <h2 className="festival-title">{section?.title || "Thẻ tình nguyện viên"}</h2>
          <p>{section?.description || "Mỗi chiếc thẻ lưu giữ một gương mặt đã cùng góp sức cho mùa trăng."}</p>
          <p className="touch-hint"><FestivalIcon name="star" /> Chạm vào thẻ để xem rõ hơn</p>
        </header>

        <div className="volunteer-view-options">
          <label className="volunteer-mobile-select">Xem thẻ theo ban
            <select value={activeTab} onChange={event => setActiveTab(event.target.value)}>
              <option value="all">Tất cả tình nguyện viên</option>
              {departmentList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Lọc thẻ tình nguyện viên theo ban">
            <button
              type="button"
              aria-pressed={activeTab === "all"}
              onClick={() => setActiveTab("all")}
            >
              Tất cả tình nguyện viên
            </button>
            {departmentList.map(dept => (
              <button
                key={dept}
                type="button"
                aria-pressed={activeTab.toLowerCase() === dept.toLowerCase()}
                onClick={() => setActiveTab(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="lower-empty" role="alert">
            <p>{error}</p>
            <button className="lower-link" onClick={refetch}>Thử lại</button>
          </div>
        )}

        {loading && <p className="lower-empty" role="status">Đang tải ảnh thẻ…</p>}

        {!loading && !error && !cards.length && (
          <p className="lower-empty">
            {activeTab === "all"
              ? "Ảnh thẻ của chương trình đang được cập nhật."
              : `Ảnh thẻ của ${activeTab} đang được cập nhật.`}
          </p>
        )}

        <div className="volunteer-card-groups">
          {[...groups].map(([department, group]) => (
            <section key={department} className="volunteer-card-group" aria-label={department}>
              <h3>{department}</h3>
              <div className="volunteer-image-gallery">
                {group.map(card => (
                  <div key={card.cardImage} className="volunteer-card-frame">
                    <div className="volunteer-card-beam" aria-hidden="true" />
                    <OriginalImage
                      src={card.cardImage!}
                      alt={`Thẻ tình nguyện viên ${card.name}`}
                      className="volunteer-image-only"
                      label="Phóng to thẻ"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
