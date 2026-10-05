export interface Advisor {
  id: string;
  name: string;
  role: string;
  unit: string;
  image?: string;
  quote?: string;
}

export interface Organizer {
  id: string;
  name: string;
  role: string;
  title: string;
  image?: string;
  message?: string;
}

export interface DepartmentLead {
  id: string;
  department: string;
  departmentCode: string;
  members: {
    id: string;
    name: string;
    role: "Trưởng Ban" | "Phó Ban";
    image?: string;
    email?: string;
  }[];
}

export interface Volunteer {
  departmentId?: string | null;
  departmentSortOrder?: number;
  sortOrder?: number;
  id: string;
  personId?: string;
  name: string;
  code: string;
  department: string;
  role?: string;
  image?: string;
  cardImage?: string; // Ảnh thẻ tình nguyện viên (như ảnh số 4)
  quote: string;
  badge?: string;
}

export interface RecapStat {
  label: string;
  value: string;
  subtext: string;
  iconName: string;
}

export interface RecapStory {
  phase: string;
  title: string;
  date: string;
  description: string;
  highlight: string;
}

export interface RecapGalleryItem {
  id: string;
  title: string;
  category: "chuẩn bị" | "đêm hội" | "trao quà" | "khoảnh khắc";
  image: string;
  caption: string;
}

// 1. BAN CỐ VẤN CHƯƠNG TRÌNH (Theo ảnh số 1)
export const advisorsData: Advisor[] = [
  {
    id: "adv-khanh",
    name: "BÙI GIA NHẤT KHANH",
    role: "NGUYÊN PHÓ CHỦ NHIỆM",
    unit: "CLB H2BH",
    image: "/images/members/member-bui-gia-nhat-khanh.png",
    quote: "Đồng hành và tiếp thêm ngọn lửa nhiệt huyết cho các bạn chiến sĩ, mang mùa trăng ấm áp và trọn vẹn yêu thương đến với các em thiếu nhi.",
  },
  {
    id: "adv-chi",
    name: "HUỲNH THỊ KIM CHI",
    role: "NGUYÊN CHỦ NHIỆM",
    unit: "CLB H2BH",
    image: "/images/members/member-huynh-thi-kim-chi.png",
    quote: "Tuổi trẻ là cống hiến và sẻ chia, cùng kết nối những tấm lòng nhân ái để lan tỏa những giá trị tốt đẹp nhất của Vầng Trăng Hòa Sắc 2.",
  },
  {
    id: "adv-quan",
    name: "LÊ VIỆT HẢI QUÂN",
    role: "NGUYÊN PHÓ CHỦ NHIỆM",
    unit: "CLB H2BH",
    image: "/images/members/member-le-viet-hai-quan.png",
    quote: "Mỗi hành trình đi qua là một dấu ấn thanh xuân rực rỡ và đong đầy yêu thương.",
  },
];

// 2. BAN TỔ CHỨC (Theo ảnh số 2)
export const organizersData: Organizer[] = [
  {
    id: "org-dat",
    name: "TRẦN DUY ĐẠT",
    role: "PHÓ BAN TỔ CHỨC",
    title: "Phó Ban Tổ Chức",
    image: "/images/members/member-tran-duy-dat.png",
    message: "Từng nụ cười của trẻ thơ khi cầm trên tay chiếc đèn ông sao chính là động lực to lớn nhất của toàn thể đội ngũ.",
  },
  {
    id: "org-nhi",
    name: "NGUYỄN NGỌC YẾN NHI",
    role: "TRƯỞNG BAN TỔ CHỨC",
    title: "Chỉ đạo & Điều hành chung chiến dịch",
    image: "/images/members/member-nguyen-ngoc-yen-nhi.png",
    message: "Hành trình Vầng Trăng Hòa Sắc 2 không chỉ là một chương trình thiện nguyện, mà là nhịp cầu nối những tấm lòng nhân ái đến với các em nhỏ vùng khó khăn.",
  },
  {
    id: "org-tam",
    name: "LƯƠNG THANH PHƯƠNG TÂM",
    role: "PHÓ BAN TỔ CHỨC",
    title: "Phó Ban Tổ Chức",
    image: "/images/members/member-luong-thanh-phuong-tam.png",
    message: "Mỗi phần quà trao đi đều gói trọn sự chuẩn bị tỉ mỉ và tâm huyết của từng chiến sĩ tình nguyện.",
  },
];

// 3. CÁC BAN & TRƯỞNG PHÓ (Theo ảnh số 3)
export const departmentLeadsData: DepartmentLead[] = [
  {
    id: "dept-nd-tt",
    department: "Ban Nội Dung - Truyền Thông",
    departmentCode: "ND-TT",
    members: [
      { id: "lead-nd-1", name: "LƯƠNG VŨ KHÁNH NHI", role: "Phó Ban", image: "/images/members/member-luong-vu-khanh-nhi.png" },
      { id: "lead-nd-2", name: "NGÔ LÊ CÔNG ANH TUẤN", role: "Trưởng Ban", image: "/images/members/member-ngo-le-cong-anh-tuan.png" },
      { id: "lead-nd-3", name: "NGUYỄN QUỲNH NHƯ Ý", role: "Phó Ban", image: "/images/members/member-nguyen-quynh-nhu-y.png" },
    ],
  },
  {
    id: "dept-hau-can",
    department: "Ban Hậu Cần & Kỹ Thuật",
    departmentCode: "HC",
    members: [
      { id: "lead-hc-1", name: "Vũ Minh Quân", role: "Trưởng Ban", image: "/images/leads/lead-haucan-1.jpg" },
      { id: "lead-hc-2", name: "Lê Thảo Vy", role: "Phó Ban", image: "/images/leads/lead-haucan-2.jpg" },
    ],
  },
  {
    id: "dept-chuong-trinh",
    department: "Ban Chương Trình & Hoạt Động",
    departmentCode: "CT",
    members: [
      { id: "lead-ct-1", name: "Phạm Hải Đăng", role: "Trưởng Ban", image: "/images/leads/lead-chuongtrinh-1.jpg" },
      { id: "lead-ct-2", name: "Ngô Mai Anh", role: "Phó Ban", image: "/images/leads/lead-chuongtrinh-2.jpg" },
    ],
  },
  {
    id: "dept-doi-ngoai",
    department: "Ban Tài Chính & Đối Ngoại",
    departmentCode: "ĐN",
    members: [
      { id: "lead-dn-1", name: "Nguyễn Phúc Khang", role: "Trưởng Ban", image: "/images/leads/lead-doingoai-1.jpg" },
      { id: "lead-dn-2", name: "Hoàng Yến Nhi", role: "Phó Ban", image: "/images/leads/lead-doingoai-2.jpg" },
    ],
  },
];

// 4. DANH SÁCH TÌNH NGUYỆN VIÊN (Có Thẻ Tình Nguyện Viên như ảnh số 4)
export const volunteersData: Volunteer[] = [
  {
    id: "tnv-huynh",
    name: "NGUYỄN NHƯ HUỲNH",
    code: "2457012103",
    department: "Ban Cố Vấn",
    role: "Trưởng Ban",
    cardImage: "/images/volunteers/the-tnv-nguyen-nhu-huynh.png",
    image: "/images/volunteers/the-tnv-nguyen-nhu-huynh.png",
    quote: "Trăng tròn gửi ước mơ, sắc màu trao nụ cười trẻ thơ.",
    badge: "Thẻ Tình Nguyện Viên Chính Thức",
  },
  {
    id: "tnv-01",
    name: "Nguyễn Thùy Linh",
    code: "VTHS-01",
    department: "Ban Chương Trình",
    image: "/images/volunteers/tnv-01.jpg",
    quote: "Một mùa trăng ý nghĩa nhất thời sinh viên của mình!",
    badge: "Chiến sĩ năng nổ",
  },
  {
    id: "tnv-02",
    name: "Phan Quốc Bảo",
    code: "VTHS-02",
    department: "Ban Hậu Cần",
    image: "/images/volunteers/tnv-02.jpg",
    quote: "Thức đêm gói quà cùng mọi người mệt mà vui không tả nổi.",
    badge: "Tay gói quà cừ khôi",
  },
  {
    id: "tnv-03",
    name: "Lê Ngọc Diệp",
    code: "VTHS-03",
    department: "Ban Truyền Thông",
    image: "/images/volunteers/tnv-03.jpg",
    quote: "Ghi lại những nụ cười tỏa nắng của các em nhỏ là hạnh phúc.",
    badge: "Thợ săn khoảnh khắc",
  },
  {
    id: "tnv-04",
    name: "Võ Minh Trí",
    code: "VTHS-04",
    department: "Ban Đối Ngoại",
    image: "/images/volunteers/tnv-04.jpg",
    quote: "Biết ơn vì được đồng hành cùng Vầng Trăng Hòa Sắc 2.",
    badge: "Cầu nối yêu thương",
  },
  {
    id: "tnv-05",
    name: "Đinh Phương Thảo",
    code: "VTHS-05",
    department: "Ban Nhân Sự",
    image: "/images/volunteers/tnv-05.jpg",
    quote: "Ở đâu có yêu thương, ở đó có vầng trăng sáng.",
    badge: "Nụ cười ấm áp",
  },
  {
    id: "tnv-06",
    name: "Trần Đăng Khoa",
    code: "VTHS-06",
    department: "Ban Chương Trình",
    image: "/images/volunteers/tnv-06.jpg",
    quote: "Hát cùng các em dưới ánh trăng rằm, kỷ niệm khó quên!",
    badge: "MC hoạt náo",
  },
  {
    id: "tnv-07",
    name: "Dương Ánh Tuyết",
    code: "VTHS-07",
    department: "Ban Hậu Cần",
    image: "/images/volunteers/tnv-07.jpg",
    quote: "Từng chiếc lồng đèn trao đi là một niềm hy vọng thắp sáng.",
    badge: "Trái tim nhân ái",
  },
  {
    id: "tnv-08",
    name: "Huỳnh Tuấn Anh",
    code: "VTHS-08",
    department: "Ban Truyền Thông",
    image: "/images/volunteers/tnv-08.jpg",
    quote: "Mong mùa trăng sau lại được gặp lại các em nhỏ thân thương.",
    badge: "Cameraman tận tâm",
  },
];

export const recapStatsData: RecapStat[] = [
  {
    label: "Phần quà Trung Thu",
    value: "350+",
    subtext: "Bao gồm bánh trung thu, lồng đèn, sữa & bánh kẹo",
    iconName: "gift",
  },
  {
    label: "Học bổng vượt khó",
    value: "20+",
    subtext: "Trao tặng các em học sinh có hoàn cảnh khó khăn",
    iconName: "award",
  },
  {
    label: "Chiến sĩ tình nguyện",
    value: "60+",
    subtext: "Cùng góp sức, nhiệt huyết trong suốt chiến dịch",
    iconName: "users",
  },
  {
    label: "Lồng đèn thắp sáng",
    value: "500+",
    subtext: "Được tự tay các tình nguyện viên chuốt nan, dán giấy kính",
    iconName: "moon",
  },
];

export const recapStoriesData: RecapStory[] = [
  {
    phase: "Giai đoạn 1",
    title: "Gieo Mầm Yêu Thương & Gây Quỹ",
    date: "Tháng 8 - Đầu tháng 9",
    description: "Những ngày bán bánh gây quỹ, thu gom nguyên vật liệu và tổ chức các buổi workshop làm lồng đèn truyền thống đầy ắp tiếng cười.",
    highlight: "Gây quỹ thành công và nhận được sự chung tay của đông đảo quý nhà hảo tâm.",
  },
  {
    phase: "Giai đoạn 2",
    title: "Những Đêm Trắng Chuẩn Bị",
    date: "Trước ngày lên đường",
    description: "Hậu cần tất bật phân loại từng phần quà, đóng gói cẩn thận từng chiếc bánh, chuẩn bị sân khấu và kịch bản đêm hội.",
    highlight: "Hơn 500 chiếc lồng đèn quân tử, lồng đèn ông sao hoàn thành đúng tiến độ.",
  },
  {
    phase: "Giai đoạn 3",
    title: "Hành Trình Về Với Em Thơ",
    date: "Đêm Rằm Tháng 8",
    description: "Đoàn xe lăn bánh mang theo tình cảm của tập thể Vầng Trăng Hòa Sắc 2 đến với địa phương. Tổ chức gian hàng trò chơi dân gian và phá cỗ.",
    highlight: "Đêm hội Trăng rằm tưng bừng với tiếng múa lân, rước đèn và nụ cười rạng rỡ của các em.",
  },
];

export const recapGalleryData: RecapGalleryItem[] = [
  {
    id: "recap-1",
    title: "Workshop làm lồng đèn truyền thống",
    category: "chuẩn bị",
    image: "/branding/background_VTHS2.png",
    caption: "Các tình nguyện viên tỉ mỉ uốn từng khung tre, dán giấy kiếng đỏ rực cho các em nhỏ.",
  },
  {
    id: "recap-2",
    title: "Gian hàng trò chơi dân gian Trung thu",
    category: "đêm hội",
    image: "/branding/background_khongten_logo.png",
    caption: "Không khí náo nức tiếng cười giòn tan tại các trạm trò chơi tuổi thơ.",
  },
  {
    id: "recap-3",
    title: "Màn rước đèn ông sao dưới trăng",
    category: "đêm hội",
    image: "/branding/background_VTHS2.png",
    caption: "Cung đường nhỏ ngập tràn ánh nến lung linh và tiếng hát rộn ràng của thiếu nhi.",
  },
  {
    id: "recap-4",
    title: "Trao tận tay những phần quà yêu thương",
    category: "trao quà",
    image: "/branding/background_khongten_logo.png",
    caption: "Nụ cười hồn nhiên và ánh mắt lấp lánh khi các em đón nhận chiếc bánh trung thu ấm áp.",
  },
  {
    id: "recap-5",
    title: "Bức ảnh gia đình Vầng Trăng Hòa Sắc",
    category: "khoảnh khắc",
    image: "/branding/background_VTHS2.png",
    caption: "Một tập thể gắn kết, một hành trình đong đầy thanh xuân và yêu thương vô giá.",
  },
];
