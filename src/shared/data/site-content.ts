export interface SiteContentSettings {
  logoUrl?: string;
  backgroundUrl?: string;
  musicUrl?: string;
  primaryButton?: string;
  secondaryButton?: string;
  // Trang Chủ
  heroSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  statPresents: string;
  statScholarships: string;
  statVolunteers: string;
  statLanterns: string;
  footerQuote: string;

  // Trang Kỷ Niệm (/memories)
  memoriesSubtitle: string;
  memoriesTitle: string;
  memoriesDescription: string;
  memoriesIntroVisible: boolean;
  memoriesGuideVisible: boolean;
  memoriesFooterVisible: boolean;
  memoriesGuideTitle: string;
  memoriesGuideDescription: string;
  memoriesFooterText: string;
  allowSubmissions: boolean;
}

export const defaultSiteContent: SiteContentSettings = {
  // Trang Chủ
  heroSubtitle: "MỘT MÙA TRĂNG · MỘT HÀNH TRÌNH",
  heroTitle: "Vầng Trăng Hòa Sắc 2",
  heroDescription: "Nơi lưu giữ những khoảnh khắc và lời nhắn của chúng ta sau một mùa trăng cùng nhau.",
  statPresents: "350+",
  statScholarships: "20+",
  statVolunteers: "60+",
  statLanterns: "500+",
  footerQuote: "Một mùa trăng,\nmuôn điều thương ở lại.",

  // Trang Kỷ Niệm
  memoriesSubtitle: "Một mùa trăng · Ngàn điều muốn nói",
  memoriesTitle: "Cây kỷ niệm",
  memoriesDescription: "Một lời nhắn nhỏ, một kỷ niệm ở lại. Cùng treo những điều thương mến lên cây mùa trăng của chúng ta.",
  memoriesIntroVisible: true,
  memoriesGuideVisible: true,
  memoriesFooterVisible: true,
  memoriesGuideTitle: "Gửi một lời nhắn, giữ một mùa trăng",
  memoriesGuideDescription: "Chọn lồng đèn hoặc ngôi sao, viết điều bạn muốn giữ lại và gửi lên cây. Chạm vào từng kỷ niệm để đọc lời nhắn của những người cùng đồng hành.",
  memoriesFooterText: "Mỗi lời nhắn là một điều thương ở lại. Cảm ơn bạn đã góp nên mùa trăng này.",
  allowSubmissions: true,
};
