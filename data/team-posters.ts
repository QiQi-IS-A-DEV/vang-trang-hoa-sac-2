export type TeamPoster = {
  src: string;
  title: string;
  section: 'organizers' | 'advisors' | 'departments';
};

export const teamPosters: TeamPoster[] = [
  { src: '/images/btc/no1.png', title: 'Ban tổ chức', section: 'organizers' },
  { src: '/images/btc/2.png', title: 'Cố vấn CLB', section: 'advisors' },
  { src: '/images/btc/3.png', title: 'Ban cố vấn — ảnh 1', section: 'advisors' },
  { src: '/images/btc/4.png', title: 'Ban cố vấn — ảnh 2', section: 'advisors' },
  { src: '/images/btc/5.png', title: 'Ban Nội dung – Truyền thông', section: 'departments' },
  { src: '/images/btc/6.png', title: 'Ban Văn nghệ', section: 'departments' },
  { src: '/images/btc/7.png', title: 'Ban Trang trí – Sự kiện', section: 'departments' },
  { src: '/images/btc/8.png', title: 'Ban Hậu cần', section: 'departments' },
];
