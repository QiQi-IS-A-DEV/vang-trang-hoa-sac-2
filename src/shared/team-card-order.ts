export type ProgramRole = 'lead' | 'deputy' | 'volunteer';
export const programRoleLabels: Record<ProgramRole,string> = {lead:'Trưởng ban',deputy:'Phó ban',volunteer:'Thành viên'};
const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
export function departmentPriority(name: string) {
  const value = normalize(name);
  if (/to chuc|\bbtc\b/.test(value)) return 0;
  if (/co van/.test(value)) return 1;
  return 2;
}
export const rolePriority = (role?: string) => role === 'lead' ? 0 : role === 'deputy' ? 1 : 2;
type OrderedCard = {id: string;department: string;departmentSortOrder?: number;role?: string;sortOrder?: number};
export function compareProgramCards(a: OrderedCard,b: OrderedCard) {
  return departmentPriority(a.department)-departmentPriority(b.department)
    || (a.departmentSortOrder??0)-(b.departmentSortOrder??0)
    || a.department.localeCompare(b.department,'vi')
    || rolePriority(a.role)-rolePriority(b.role)
    || (a.sortOrder??0)-(b.sortOrder??0)
    || a.id.localeCompare(b.id);
}
