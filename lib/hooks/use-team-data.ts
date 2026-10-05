"use client";

import { useEffect, useState, useCallback, createContext, useContext, createElement, type ReactNode } from "react";
import {
  type Advisor,
  type Organizer,
  type DepartmentLead,
  type Volunteer,
} from "@/data/homepage-data";

export type TeamData = { advisors: Advisor[]; organizers: Organizer[]; departments: DepartmentLead[]; volunteers: Volunteer[] };
const TeamContext = createContext<ReturnType<typeof useTeamDataInternal> | null>(null);
function useTeamDataInternal(initialData?: TeamData, enabled = true) {
  const [advisors, setAdvisors] = useState<Advisor[]>(initialData?.advisors ?? []);
  const [organizers, setOrganizers] = useState<Organizer[]>(initialData?.organizers ?? []);
  const [departments, setDepartments] = useState<DepartmentLead[]>(initialData?.departments ?? []);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(initialData?.volunteers ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refetch = useCallback(() => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!enabled || (initialData && refreshIndex === 0)) return;
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/team");
        if (!res.ok) throw new Error('Không thể tải danh sách nhân sự. Hãy thử lại.');
        if (active) {
          const data = await res.json();
          setAdvisors(data.advisors ?? []);
          setOrganizers(data.organizers ?? []);
          setDepartments(data.departments ?? []);
          setVolunteers(data.volunteers ?? []);
          setError('');
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân sự.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [refreshIndex, enabled, initialData]);

  return {
    advisors,
    organizers,
    departments,
    volunteers,
    loading,
    error,
    refetch,
  };
}

export function useTeamData() {
  const shared = useContext(TeamContext);
  const own = useTeamDataInternal(undefined, !shared);
  return shared ?? own;
}
export function TeamDataProvider({ children, initialData }: { children: ReactNode; initialData?: TeamData }) {
  const value = useTeamDataInternal(initialData);
  return createElement(TeamContext.Provider, { value }, children);
}
