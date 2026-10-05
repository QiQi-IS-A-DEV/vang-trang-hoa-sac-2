"use client";

import { useState, useEffect, useRef } from "react";
import { adminFetch } from '@/frontend/lib/admin-upload';
import Image from "next/image";
import {
  type Advisor,
  type Organizer,
  type DepartmentLead,
  type Volunteer,
  advisorsData,
  organizersData,
  departmentLeadsData,
  volunteersData,
} from "@/shared/data/homepage-data";
import { compressImage, formatBytes, type CompressionResult } from "@/frontend/lib/utils/image-optimizer";
import {
  IconStylus,
  IconVaultTrash,
  IconPlusNode,
  IconCalibrationSync,
  IconSealCheck,
  IconAperture,
  IconMonocle,
  IconDismiss,
} from "@/frontend/components/admin/admin-icons";

interface TeamManagerProps {
  passcode: string;
  onNotice: (msg: string) => void;
}

export function TeamManager({ passcode, onNotice }: TeamManagerProps) {
  const [activeRoster, setActiveRoster] = useState<"advisors" | "organizers" | "departments" | "volunteers">("advisors");
  const [advisors, setAdvisors] = useState<Advisor[]>(advisorsData);
  const [organizers, setOrganizers] = useState<Organizer[]>(organizersData);
  const [departments, setDepartments] = useState<DepartmentLead[]>(departmentLeadsData);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(volunteersData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals for editing/creating
  const [editingAdvisor, setEditingAdvisor] = useState<Advisor | null>(null);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [editingDept, setEditingDept] = useState<DepartmentLead | null>(null);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  const [editingDeptMember, setEditingDeptMember] = useState<{
    deptId: string;
    member: DepartmentLead["members"][0];
    isNew?: boolean;
  } | null>(null);

  // Load team data
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/team");
        if (res.ok && active) {
          const data = await res.json();
          if (data.advisors) setAdvisors(data.advisors);
          if (data.organizers) setOrganizers(data.organizers);
          if (data.departments) setDepartments(data.departments);
          if (data.volunteers) setVolunteers(data.volunteers);
        }
      } catch (err) {
        console.warn("Dùng dữ liệu đội ngũ mặc định:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSaveTeam(overrideData?: {
    advisors?: Advisor[];
    organizers?: Organizer[];
    departments?: DepartmentLead[];
    volunteers?: Volunteer[];
  }) {
    try {
      setSaving(true);
      const payload = {
        advisors: overrideData?.advisors || advisors,
        organizers: overrideData?.organizers || organizers,
        departments: overrideData?.departments || departments,
        volunteers: overrideData?.volunteers || volunteers,
      };

      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passcode,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        onNotice("Dữ liệu nhân sự đã được đồng bộ trực tiếp tới Trang Chủ.");
      } else {
        alert(result.error || "Không thể lưu dữ liệu.");
      }
    } catch {
      alert("Lỗi kết nối khi gửi dữ liệu nhân sự.");
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefault() {
    if (!window.confirm("Khôi phục toàn bộ dữ liệu nhân sự về trạng thái gốc ban đầu?")) return;
    setAdvisors(advisorsData);
    setOrganizers(organizersData);
    setDepartments(departmentLeadsData);
    setVolunteers(volunteersData);
    handleSaveTeam({
      advisors: advisorsData,
      organizers: organizersData,
      departments: departmentLeadsData,
      volunteers: volunteersData,
    });
  }

  // Advisor actions
  function handleSaveAdvisor(adv: Advisor) {
    const exists = advisors.some((a) => a.id === adv.id);
    const updated = exists ? advisors.map((a) => (a.id === adv.id ? adv : a)) : [adv, ...advisors];
    setAdvisors(updated);
    setEditingAdvisor(null);
    handleSaveTeam({ advisors: updated });
  }

  function handleDeleteAdvisor(id: string, name: string) {
    if (!window.confirm(`Xác nhận xóa hồ sơ Cố vấn: ${name}?`)) return;
    const updated = advisors.filter((a) => a.id !== id);
    setAdvisors(updated);
    handleSaveTeam({ advisors: updated });
  }

  // Organizer actions
  function handleSaveOrganizer(org: Organizer) {
    const exists = organizers.some((o) => o.id === org.id);
    const updated = exists ? organizers.map((o) => (o.id === org.id ? org : o)) : [...organizers, org];
    setOrganizers(updated);
    setEditingOrganizer(null);
    handleSaveTeam({ organizers: updated });
  }

  function handleDeleteOrganizer(id: string, name: string) {
    if (!window.confirm(`Xác nhận xóa thành viên BTC: ${name}?`)) return;
    const updated = organizers.filter((o) => o.id !== id);
    setOrganizers(updated);
    handleSaveTeam({ organizers: updated });
  }

  // Department actions
  function handleSaveDepartment(dept: DepartmentLead) {
    const exists = departments.some((d) => d.id === dept.id);
    const updated = exists ? departments.map((d) => (d.id === dept.id ? dept : d)) : [...departments, dept];
    setDepartments(updated);
    setEditingDept(null);
    handleSaveTeam({ departments: updated });
  }

  function handleDeleteDepartment(id: string, name: string) {
    if (!window.confirm(`Xác nhận giải tán Ban: ${name} cùng toàn bộ nhân sự trực thuộc?`)) return;
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    handleSaveTeam({ departments: updated });
  }

  function handleSaveDeptMember(deptId: string, member: DepartmentLead["members"][0]) {
    const updated = departments.map((dept) => {
      if (dept.id !== deptId) return dept;
      const memExists = dept.members.some((m) => m.id === member.id);
      const newMembers = memExists
        ? dept.members.map((m) => (m.id === member.id ? member : m))
        : [...dept.members, member];
      return { ...dept, members: newMembers };
    });
    setDepartments(updated);
    setEditingDeptMember(null);
    handleSaveTeam({ departments: updated });
  }

  function handleDeleteDeptMember(deptId: string, memberId: string, name: string) {
    if (!window.confirm(`Xác nhận xóa cán bộ: ${name}?`)) return;
    const updated = departments.map((dept) => {
      if (dept.id !== deptId) return dept;
      return { ...dept, members: dept.members.filter((m) => m.id !== memberId) };
    });
    setDepartments(updated);
    handleSaveTeam({ departments: updated });
  }

  // Volunteer actions
  function handleSaveVolunteer(vol: Volunteer) {
    const exists = volunteers.some((v) => v.id === vol.id);
    const updated = exists ? volunteers.map((v) => (v.id === vol.id ? vol : v)) : [vol, ...volunteers];
    setVolunteers(updated);
    setEditingVolunteer(null);
    handleSaveTeam({ volunteers: updated });
  }

  function handleDeleteVolunteer(id: string, name: string) {
    if (!window.confirm(`Xác nhận hủy thẻ TNV: ${name}?`)) return;
    const updated = volunteers.filter((v) => v.id !== id);
    setVolunteers(updated);
    handleSaveTeam({ volunteers: updated });
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.08] pb-4">
        {/* Roster switcher */}
        <div className="inline-flex rounded-xl bg-white/[0.03] p-1 border border-white/[0.08]">
          {[
            { id: "advisors", label: "CỐ VẤN CHƯƠNG TRÌNH", count: advisors.length },
            { id: "organizers", label: "BAN TỔ CHỨC", count: organizers.length },
            { id: "departments", label: "CÁC BAN & TRƯỞNG PHÓ", count: departments.length },
            { id: "volunteers", label: "CHIẾN SĨ TNV", count: volunteers.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRoster(tab.id as typeof activeRoster);
                setSearchQuery("");
              }}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-[11px] font-mono tracking-wider transition-all ${
                activeRoster === tab.id
                  ? "bg-amber-400 text-purple-950 font-bold shadow-sm"
                  : "text-purple-200/70 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                  activeRoster === tab.id
                    ? "bg-purple-950/20 text-purple-950 font-bold"
                    : "bg-white/[0.06] text-purple-300/80"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveTeam()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-purple-950 px-3.5 py-1.5 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <IconSealCheck className="w-3.5 h-3.5" />
            <span>{saving ? "ĐANG LƯU..." : "LƯU ĐỒNG BỘ"}</span>
          </button>
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Khôi phục dữ liệu ban đầu"
          >
            <IconCalibrationSync className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px]">RESET</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs font-mono text-purple-300/60">
          {"// Đang đồng bộ danh bộ nhân sự từ máy chủ..."}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. BAN CỐ VẤN                                                  */}
      {/* ============================================================== */}
      {activeRoster === "advisors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-200">
                Ban Cố Vấn Chương Trình [{advisors.length}]
              </h3>
              <p className="text-xs text-purple-300/70">
                Thầy cô và các anh chị cố vấn định hướng chiến dịch Vầng Trăng Hòa Sắc 2
              </p>
            </div>
            <button
              onClick={() =>
                setEditingAdvisor({
                  id: `adv-${Date.now()}`,
                  name: "",
                  role: "Cố vấn chương trình",
                  unit: "Phòng CTSV&TT",
                  quote: "",
                  image: "",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors"
            >
              <IconPlusNode className="w-3.5 h-3.5" />
              <span>Thêm Cố Vấn</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisors.map((adv) => (
              <div
                key={adv.id}
                className="group relative flex gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all hover:border-amber-400/30 hover:bg-white/[0.04]"
              >
                {/* Photo Portrait */}
                <div className="relative h-28 w-24 shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/10">
                  {adv.image ? (
                    <Image src={adv.image} alt={adv.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-purple-300/60">
                      NO_PHOTO
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      {adv.role}
                    </span>
                    <span className="text-[11px] text-purple-300/70 truncate">{adv.unit}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate pt-0.5">
                    {adv.name || "(Chưa đặt tên)"}
                  </h4>

                  {adv.quote && (
                    <p className="text-xs italic text-purple-200/80 line-clamp-2 pt-0.5">
                      &ldquo;{adv.quote}&rdquo;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => setEditingAdvisor(adv)}
                      className="inline-flex items-center gap-1 rounded bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-[11px] font-mono text-amber-200 transition-colors"
                    >
                      <IconStylus className="w-3 h-3" />
                      <span>SỬA</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAdvisor(adv.id, adv.name)}
                      className="inline-flex items-center gap-1 rounded bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 text-[11px] font-mono text-red-300 transition-colors"
                    >
                      <IconVaultTrash className="w-3 h-3" />
                      <span>XÓA</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. BAN TỔ CHỨC                                                 */}
      {/* ============================================================== */}
      {activeRoster === "organizers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-200">
                Thường Trực Ban Tổ Chức [{organizers.length}]
              </h3>
              <p className="text-xs text-purple-300/70">
                Đội ngũ điều hành tổng thể và chịu trách nhiệm chiến dịch
              </p>
            </div>
            <button
              onClick={() =>
                setEditingOrganizer({
                  id: `org-${Date.now()}`,
                  name: "",
                  role: "Phó Ban Tổ Chức",
                  title: "Phụ trách chuyên môn",
                  message: "",
                  image: "",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors"
            >
              <IconPlusNode className="w-3.5 h-3.5" />
              <span>Thêm Thành Viên BTC</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {organizers.map((org) => (
              <div
                key={org.id}
                className="group relative rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3 hover:border-pink-400/30 hover:bg-white/[0.04] transition-all"
              >
                <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-black/60 border border-white/10">
                  {org.image ? (
                    <Image src={org.image} alt={org.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-purple-300/60">
                      NO_PHOTO
                    </div>
                  )}
                  <span className="absolute top-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-300 border border-white/10">
                    {org.role}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white truncate">{org.name || "(Chưa đặt tên)"}</h4>
                  <p className="text-[11px] text-pink-300/90 font-mono mt-0.5">{org.title}</p>
                  {org.message && (
                    <p className="text-xs italic text-purple-200/80 line-clamp-2 mt-1.5">
                      &ldquo;{org.message}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => setEditingOrganizer(org)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded bg-white/[0.06] hover:bg-white/[0.12] py-1 text-[11px] font-mono text-amber-200 transition-colors"
                  >
                    <IconStylus className="w-3 h-3" />
                    <span>SỬA</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOrganizer(org.id, org.name)}
                    className="inline-flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 text-[11px] font-mono text-red-300 transition-colors"
                  >
                    <IconVaultTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CÁC BAN & TRƯỞNG / PHÓ BAN                                  */}
      {/* ============================================================== */}
      {activeRoster === "departments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-200">
                Các Ban Chuyên Môn [{departments.length}]
              </h3>
              <p className="text-xs text-purple-300/70">
                Tổ chức các bộ phận và nhân sự Trưởng Ban / Phó Ban điều phối
              </p>
            </div>
            <button
              onClick={() =>
                setEditingDept({
                  id: `dept-${Date.now()}`,
                  department: "Ban Chuyên Môn Mới",
                  departmentCode: "BM",
                  members: [],
                })
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors"
            >
              <IconPlusNode className="w-3.5 h-3.5" />
              <span>Tạo Ban Mới</span>
            </button>
          </div>

          <div className="space-y-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4"
              >
                {/* Dept Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 border border-amber-400/30 text-xs font-mono font-bold text-amber-300">
                      {dept.departmentCode}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{dept.department}</h4>
                      <p className="text-[11px] font-mono text-purple-300/60">
                        CODE: {dept.departmentCode} · {dept.members.length} CÁN BỘ PHỤ TRÁCH
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingDept(dept)}
                      className="inline-flex items-center gap-1 rounded bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-[11px] font-mono text-amber-200 transition-colors"
                    >
                      <IconStylus className="w-3 h-3" />
                      <span>ĐỔI TÊN BAN</span>
                    </button>
                    <button
                      onClick={() =>
                        setEditingDeptMember({
                          deptId: dept.id,
                          member: {
                            id: `lead-${Date.now()}`,
                            name: "",
                            role: "Trưởng Ban",
                            image: "",
                          },
                          isNew: true,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300 transition-colors"
                    >
                      <IconPlusNode className="w-3 h-3" />
                      <span>THÊM CÁN BỘ</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept.id, dept.department)}
                      className="inline-flex items-center rounded bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 text-[11px] font-mono text-red-300 transition-colors"
                    >
                      <IconVaultTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Members list */}
                {dept.members.length === 0 ? (
                  <p className="text-xs font-mono text-purple-300/40 italic py-1">
                    {"// Ban chưa có nhân sự Trưởng/Phó phụ trách. Bấm \"THÊM CÁN BỘ\" để bổ nhiệm."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dept.members.map((mem) => (
                      <div
                        key={mem.id}
                        className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/30 p-2.5"
                      >
                        <div className="relative h-14 w-12 shrink-0 rounded overflow-hidden bg-black/60 border border-white/10">
                          {mem.image ? (
                            <Image src={mem.image} alt={mem.name} fill className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] font-mono text-purple-300/40">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span
                            className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-mono font-bold ${
                              mem.role === "Trưởng Ban"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-pink-400/20 text-pink-300 border border-pink-400/30"
                            }`}
                          >
                            {mem.role}
                          </span>
                          <h5 className="text-xs font-bold text-white truncate mt-0.5">
                            {mem.name || "(Chưa đặt tên)"}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() =>
                                setEditingDeptMember({
                                  deptId: dept.id,
                                  member: mem,
                                  isNew: false,
                                })
                              }
                              className="text-[10px] font-mono text-amber-300/80 hover:text-amber-200 underline"
                            >
                              Sửa
                            </button>
                            <span className="text-white/20">·</span>
                            <button
                              onClick={() => handleDeleteDeptMember(dept.id, mem.id, mem.name)}
                              className="text-[10px] font-mono text-red-400/80 hover:text-red-300 underline"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. CHIẾN SĨ TÌNH NGUYỆN                                        */}
      {/* ============================================================== */}
      {activeRoster === "volunteers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-200">
                Thẻ Chiến Sĩ Tình Nguyện [{volunteers.length}]
              </h3>
              <p className="text-xs text-purple-300/70">
                Quản lý số thẻ, phân bổ ban và thông điệp E-Badge
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <IconMonocle className="absolute left-3 top-2.5 w-3.5 h-3.5 text-purple-300/50" />
                <input
                  type="text"
                  placeholder="Tra cứu tên, mã thẻ, ban..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] pl-9 pr-3 py-1.5 text-xs text-white placeholder-purple-300/30 outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={() =>
                  setEditingVolunteer({
                    id: `vol-${Date.now()}`,
                    name: "",
                    code: `VTHS2-${String(volunteers.length + 1).padStart(3, "0")}`,
                    department: departments[0]?.department || "Ban Cố Vấn",
                    quote: "Trăng tròn gửi ước mơ, sắc màu trao nụ cười trẻ thơ.",
                    badge: "Thẻ TNV",
                    role: "TÌNH NGUYỆN VIÊN",
                    cardImage: "",
                    image: "",
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors shrink-0"
              >
                <IconPlusNode className="w-3.5 h-3.5" />
                <span>Thêm Chiến Sĩ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers
              .filter(
                (v) =>
                  v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  v.department.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((vol) => (
                <div
                  key={vol.id}
                  className="group rounded-2xl border border-white/[0.08] bg-[#1a082b]/80 p-3.5 flex flex-col justify-between hover:border-amber-400/40 hover:bg-[#200b33] transition-all shadow-md"
                >
                  <div className="relative aspect-[16/10.5] w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-2">
                    {vol.cardImage ? (
                      <Image src={vol.cardImage} alt={vol.name} fill className="object-cover" />
                    ) : vol.image ? (
                      <Image src={vol.image} alt={vol.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-purple-300/40">
                        Chưa có ảnh thẻ
                      </div>
                    )}
                    {vol.cardImage && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/80 text-[9px] font-black uppercase text-white shadow">
                        Thẻ Ảnh Hoàn Chỉnh
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-amber-300">{vol.code}</span>
                      <span className="rounded bg-pink-400/15 px-2 py-0.5 text-[9px] font-mono font-semibold text-pink-300">
                        {vol.badge || vol.role || "Tình nguyện viên"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white truncate mt-1">{vol.name}</h4>
                    <p className="text-[10px] text-purple-300/80 truncate">{vol.department}</p>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setEditingVolunteer(vol)}
                        className="text-[11px] font-mono text-amber-300 hover:text-white font-bold"
                      >
                        Sửa thẻ
                      </button>
                      <span className="text-white/20">·</span>
                      <button
                        onClick={() => handleDeleteVolunteer(vol.id, vol.name)}
                        className="text-[11px] font-mono text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL EDITORS                                                  */}
      {/* ============================================================== */}
      {editingAdvisor && (
        <ModalSheet title="Hồ Sơ Cố Vấn" onClose={() => setEditingAdvisor(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAdvisor(editingAdvisor);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Họ và tên</label>
              <input
                type="text"
                required
                value={editingAdvisor.name}
                onChange={(e) => setEditingAdvisor({ ...editingAdvisor, name: e.target.value })}
                placeholder="VD: Cô NGUYỄN THỊ DIỆU LINH"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Chức vụ</label>
                <input
                  type="text"
                  required
                  value={editingAdvisor.role}
                  onChange={(e) => setEditingAdvisor({ ...editingAdvisor, role: e.target.value })}
                  placeholder="VD: Phó Trưởng phòng"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Đơn vị công tác</label>
                <input
                  type="text"
                  required
                  value={editingAdvisor.unit}
                  onChange={(e) => setEditingAdvisor({ ...editingAdvisor, unit: e.target.value })}
                  placeholder="VD: Phòng CTSV&TT"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Thông điệp định hướng</label>
              <textarea
                rows={2}
                value={editingAdvisor.quote || ""}
                onChange={(e) => setEditingAdvisor({ ...editingAdvisor, quote: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <RefinedImagePicker
              label="Ảnh chân dung / Ảnh thẻ Cố Vấn"
              currentImage={editingAdvisor.image}
              passcode={passcode}
              folder="advisors"
              onUploaded={(url) => setEditingAdvisor({ ...editingAdvisor, image: url })}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingAdvisor(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-purple-200"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-1.5 text-xs"
              >
                LƯU CỐ VẤN
              </button>
            </div>
          </form>
        </ModalSheet>
      )}

      {editingOrganizer && (
        <ModalSheet title="Hồ Sơ Ban Tổ Chức" onClose={() => setEditingOrganizer(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveOrganizer(editingOrganizer);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Họ và tên</label>
              <input
                type="text"
                required
                value={editingOrganizer.name}
                onChange={(e) => setEditingOrganizer({ ...editingOrganizer, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Vai trò BTC</label>
                <input
                  type="text"
                  required
                  value={editingOrganizer.role}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, role: e.target.value })}
                  placeholder="VD: Trưởng Ban Tổ Chức"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Trọng trách</label>
                <input
                  type="text"
                  required
                  value={editingOrganizer.title}
                  onChange={(e) => setEditingOrganizer({ ...editingOrganizer, title: e.target.value })}
                  placeholder="VD: Chỉ đạo chung chiến dịch"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Thông điệp</label>
              <textarea
                rows={2}
                value={editingOrganizer.message || ""}
                onChange={(e) => setEditingOrganizer({ ...editingOrganizer, message: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <RefinedImagePicker
              label="Ảnh chân dung BTC"
              currentImage={editingOrganizer.image}
              passcode={passcode}
              folder="organizers"
              onUploaded={(url) => setEditingOrganizer({ ...editingOrganizer, image: url })}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingOrganizer(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-purple-200"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-1.5 text-xs"
              >
                LƯU THÀNH VIÊN
              </button>
            </div>
          </form>
        </ModalSheet>
      )}

      {editingDept && (
        <ModalSheet title="Cấu Hình Ban Chuyên Môn" onClose={() => setEditingDept(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDepartment(editingDept);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Tên Ban</label>
              <input
                type="text"
                required
                value={editingDept.department}
                onChange={(e) => setEditingDept({ ...editingDept, department: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Mã Ban Viết Tắt (2-4 ký tự)</label>
              <input
                type="text"
                required
                maxLength={4}
                value={editingDept.departmentCode}
                onChange={(e) => setEditingDept({ ...editingDept, departmentCode: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-amber-300 font-mono font-bold uppercase outline-none focus:border-amber-400"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-purple-200"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-1.5 text-xs"
              >
                LƯU CẤU HÌNH
              </button>
            </div>
          </form>
        </ModalSheet>
      )}

      {editingDeptMember && (
        <ModalSheet
          title={editingDeptMember.isNew ? "Bổ Nhiệm Cán Bộ Ban" : "Cập Nhật Hồ Sơ Cán Bộ"}
          onClose={() => setEditingDeptMember(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDeptMember(editingDeptMember.deptId, editingDeptMember.member);
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Họ và tên</label>
              <input
                type="text"
                required
                value={editingDeptMember.member.name}
                onChange={(e) =>
                  setEditingDeptMember({
                    ...editingDeptMember,
                    member: { ...editingDeptMember.member, name: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Chức vụ bổ nhiệm</label>
              <select
                value={editingDeptMember.member.role}
                onChange={(e) =>
                  setEditingDeptMember({
                    ...editingDeptMember,
                    member: {
                      ...editingDeptMember.member,
                      role: e.target.value as "Trưởng Ban" | "Phó Ban",
                    },
                  })
                }
                className="mt-1 w-full rounded-lg border border-white/10 bg-purple-950 p-2 text-xs text-white outline-none focus:border-amber-400"
              >
                <option value="Trưởng Ban">Trưởng Ban</option>
                <option value="Phó Ban">Phó Ban</option>
              </select>
            </div>

            <RefinedImagePicker
              label="Ảnh chân dung cán bộ"
              currentImage={editingDeptMember.member.image}
              passcode={passcode}
              folder="leads"
              onUploaded={(url) =>
                setEditingDeptMember({
                  ...editingDeptMember,
                  member: { ...editingDeptMember.member, image: url },
                })
              }
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingDeptMember(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-purple-200"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-1.5 text-xs"
              >
                LƯU CÁN BỘ
              </button>
            </div>
          </form>
        </ModalSheet>
      )}

      {editingVolunteer && (
        <ModalSheet title="Hồ Sơ Thẻ Chiến Sĩ" onClose={() => setEditingVolunteer(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveVolunteer(editingVolunteer);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={editingVolunteer.name}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Mã số thẻ chiến sĩ</label>
                <input
                  type="text"
                  required
                  value={editingVolunteer.code}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, code: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Ban trực thuộc</label>
                <select
                  value={editingVolunteer.department}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, department: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-purple-950 p-2 text-xs text-white outline-none focus:border-amber-400"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.department}>
                      {d.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Chức vụ</label>
                <input
                  type="text"
                  value={editingVolunteer.role || ""}
                  onChange={(e) => setEditingVolunteer({ ...editingVolunteer, role: e.target.value })}
                  placeholder="VD: TRƯỞNG BAN / TÌNH NGUYỆN VIÊN"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-purple-300">Thông điệp trên thẻ</label>
              <textarea
                rows={2}
                value={editingVolunteer.quote}
                onChange={(e) => setEditingVolunteer({ ...editingVolunteer, quote: e.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            {/* Upload Ảnh Thẻ Tình Nguyện Viên Hoàn Chỉnh (Theo ảnh số 4) */}
            <RefinedImagePicker
              label="Ảnh Thẻ Tình Nguyện Viên (Tải lên thẻ hoàn chỉnh như ảnh mẫu 4)"
              currentImage={editingVolunteer.cardImage}
              passcode={passcode}
              folder="volunteers"
              onUploaded={(url) => setEditingVolunteer({ ...editingVolunteer, cardImage: url })}
            />

            {/* Hoặc ảnh chân dung nếu chưa có thẻ */}
            <RefinedImagePicker
              label="Ảnh chân dung cá nhân (dùng khi chưa có ảnh thẻ thiết kế sẵn)"
              currentImage={editingVolunteer.image}
              passcode={passcode}
              folder="volunteers"
              onUploaded={(url) => setEditingVolunteer({ ...editingVolunteer, image: url })}
            />

            <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setEditingVolunteer(null)}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-purple-200"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold px-4 py-1.5 text-xs"
              >
                LƯU THẺ
              </button>
            </div>
          </form>
        </ModalSheet>
      )}
    </div>
  );
}

// ==============================================================
// MODAL SHEET HELPER
// ==============================================================
function ModalSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#120719] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <h3 className="text-sm font-mono font-bold tracking-wider text-amber-200 uppercase">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/[0.06] text-purple-300 hover:text-white hover:bg-white/[0.12] transition-colors"
          >
            <IconDismiss className="w-3.5 h-3.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ==============================================================
// REFINED IMAGE PICKER
// ==============================================================
function RefinedImagePicker({
  label,
  currentImage,
  passcode,
  folder,
  onUploaded,
}: {
  label: string;
  currentImage?: string;
  passcode: string;
  folder: string;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compResult, setCompResult] = useState<CompressionResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);
      const result = await compressImage(file, 1200, 0.85);
      setCompResult(result);

      setUploading(true);
      const formData = new FormData();
      formData.append("file", result.file);
      formData.append("folder", folder);

      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-key": passcode },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        onUploaded(data.url);
      } else {
        alert(data.error || "Không thể tải ảnh lên kho lưu trữ.");
      }
    } catch (err) {
      console.error("Lỗi khi xử lý ảnh:", err);
      alert("Không thể nén hoặc tải ảnh.");
    } finally {
      setCompressing(false);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/[0.08] bg-black/40 p-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-wider text-amber-200/90">{label}</label>
        <span className="text-[10px] font-mono text-purple-300/50">WEBP 1200PX // AUTO</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Thumbnail Preview */}
        <div className="relative h-16 w-14 shrink-0 rounded-lg overflow-hidden bg-black border border-white/10">
          {currentImage ? (
            <Image src={currentImage} alt="Preview" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[9px] font-mono text-purple-300/40">
              TRỐNG
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-1.5 text-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            disabled={compressing || uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-mono text-amber-200 transition-colors disabled:opacity-50"
          >
            <IconAperture className="w-3.5 h-3.5" />
            <span>
              {compressing
                ? "NÉN WEBP..."
                : uploading
                ? "GỬI SUPABASE..."
                : "TẢI TỆP TỪ MÁY"}
            </span>
          </button>

          {compResult && (
            <p className="text-[10px] font-mono text-emerald-400">
              {"// "}{formatBytes(compResult.originalSize)}{" ➔ "}{formatBytes(compResult.compressedSize)}{" (-"}{compResult.ratio}{"%)"}
            </p>
          )}

          <div>
            <input
              type="text"
              value={currentImage || ""}
              onChange={(e) => onUploaded(e.target.value)}
              placeholder="Đường dẫn: https://... hoặc /images/..."
              className="w-full rounded border border-white/[0.06] bg-black/40 px-2 py-1 text-[11px] font-mono text-purple-200 outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
