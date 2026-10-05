import { z } from "zod";

export const uuid = z.uuid();
const text = (max = 1000) => z.string().trim().max(max);
const name = text(160).min(1);
const order = z.number().int().min(0).max(100000);
export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: text(20000) }).strict(),
  z.object({ type: z.literal('heading'), text: name }).strict(),
  z.object({ type: z.literal('list'), items: z.array(text(1000)).max(100) }).strict(),
  z.object({ type: z.literal('image'), asset_id: uuid, caption: text(1000).optional() }).strict(),
]);
export const schemas = {
  categories: z.object({ name: text(80).min(1).refine(v => v.toLocaleLowerCase('vi') !== 'tất cả'), sort_order: order.optional() }).strict(),
  departments: z.object({ name, code: text(40).min(1).nullable().optional(), description: text(2000).optional(), visible: z.boolean().optional(), sort_order: order.optional() }).strict(),
  people: z.object({ name, code: text(80).min(1).nullable().optional(), unit: text(200).optional(), quote: text(2000).optional(), badge: text(200).optional(), asset_id: uuid.nullable().optional(), visible: z.boolean().optional(), sort_order: order.optional() }).strict(),
  assignments: z.object({ person_id: uuid, department_id: uuid.nullable().optional(), role: z.enum(['advisor','organizer','lead','deputy','volunteer']), title: text(200).optional(), responsibility: text(2000).optional(), visible: z.boolean().optional(), sort_order: order.optional() }).strict(),
  'landing-sections': z.object({ key: z.enum(['hero','advisors','organizers','departments','volunteers','recap','footer']), title: text(200).optional(), description: text(2000).optional(), enabled: z.boolean().optional(), sort_order: order.optional(), asset_id: uuid.nullable().optional(), content: z.object({
    stats: z.array(z.object({label: name, value: text(80), subtext: text(500).optional(), icon: text(10).optional()}).strict()).max(12).optional(),
    journey: z.array(z.object({phase: name, title: name, date: text(80), description: text(2000), highlight: text(1000)}).strict()).max(100).optional(),
  }).strict().optional() }).strict(),
};
export const postSchema = z.object({
  title: name, slug: text(180).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).optional(), excerpt: text(2000).optional(),
  content: z.array(blockSchema).max(500).optional(), category_id: uuid, cover_asset_id: uuid.nullable().optional(),
  status: z.enum(['draft','published']).optional(), sort_order: order.optional(),
  album: z.array(z.object({ asset_id: uuid, caption: text(1000).optional(), sort_order: order.optional() }).strict()).max(200).default([]),
}).strict();
export const settingSchema = z.object({
  heroSubtitle: text(200).optional(), heroTitle: name.optional(), heroDescription: text(2000).optional(),
  statPresents: text(80).optional(), statScholarships: text(80).optional(), statVolunteers: text(80).optional(), statLanterns: text(80).optional(), footerQuote: text(2000).optional(),
  memoriesSubtitle: text(200).optional(), memoriesTitle: name.optional(), memoriesDescription: text(2000).optional(),
  memoriesIntroVisible: z.boolean().optional(), memoriesGuideVisible: z.boolean().optional(), memoriesFooterVisible: z.boolean().optional(),
  memoriesGuideTitle: name.optional(), memoriesGuideDescription: text(2000).optional(), memoriesFooterText: text(2000).optional(),
  allowSubmissions: z.literal(true).optional(), primaryButton: text(160).optional(), secondaryButton: text(160).optional(),
  logo_asset_id: uuid.nullable().optional(), background_asset_id: uuid.nullable().optional(),
}).strict();
export function slugify(title: string) {
  return title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'bai-viet';
}
