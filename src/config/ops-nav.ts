import type { OpsNavGroup } from "@/components/OpsShell";
import {
  AlertTriangle,
  Ambulance,
  Banknote,
  BarChart3,
  Camera,
  ClipboardList,
  Clock,
  FileCheck,
  Flag,
  HeartPulse,
  ImagePlus,
  Keyboard,
  Map,
  MapPin,
  Pencil,
  Package,
  Percent,
  PiggyBank,
  Radio,
  Rocket,
  ScanSearch,
  Scale,
  Settings,
  ShieldCheck,
  Tent,
  Truck,
  Upload,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type OpsRoleNav = {
  homeHref: string;
  breadcrumbLabel: string;
  footerLabel: string;
  footerIcon: LucideIcon;
  groups: OpsNavGroup[];
};

export const ADMINISTRATOR_NAV: OpsRoleNav = {
  homeHref: "/users",
  breadcrumbLabel: "Quản trị hệ thống",
  footerLabel: "Admin panel",
  footerIcon: ShieldCheck,
  groups: [
    {
      heading: "Tài chính",
      items: [
        {
          id: "finance",
          label: "Tài chính",
          href: "/finance",
          icon: PiggyBank,
        },
        {
          id: "refund-claims",
          label: "Hoàn lỗi HT",
          href: "/refund-claims",
          icon: AlertTriangle,
        },
        {
          id: "settings",
          label: "Cấu hình phí",
          href: "/settings",
          icon: Settings,
        },
      ],
    },
    {
      heading: "Hệ thống",
      items: [
        {
          id: "users",
          label: "Người dùng",
          href: "/users",
          icon: Users,
        },
        {
          id: "audit",
          label: "Nhật ký",
          href: "/audit",
          icon: ClipboardList,
        },
      ],
    },
  ],
};

export const MANAGER_NAV: OpsRoleNav = {
  homeHref: "/approvals",
  breadcrumbLabel: "Quản lý vận hành",
  footerLabel: "Manager panel",
  footerIcon: FileCheck,
  groups: [
    {
      heading: "Vận hành",
      items: [
        { id: "approvals", label: "Duyệt giải", href: "/approvals", icon: FileCheck },
        { id: "payouts", label: "Giải ngân", href: "/payouts", icon: Banknote },
        {
          id: "refund-claims",
          label: "Hoàn lỗi HT",
          href: "/refund-claims",
          icon: AlertTriangle,
        },
      ],
    },
    {
      heading: "Gói tổ chức",
      items: [
        { id: "package-durations", label: "Gói thời hạn", href: "/package-durations", icon: Package },
        { id: "package-capacities", label: "Quy mô VĐV", href: "/package-capacities", icon: UsersRound },
        { id: "promos", label: "Mã giảm giá", href: "/promos", icon: Percent },
      ],
    },
    {
      heading: "Báo cáo vận hành",
      items: [
        { id: "reconciliation", label: "Đối soát dữ liệu", href: "/reconciliation", icon: Scale },
        { id: "stats", label: "Thống kê", href: "/stats", icon: BarChart3 },
      ],
    },
  ],
};

const CHECK_IN_NAV: OpsRoleNav = {
  homeHref: "/",
  breadcrumbLabel: "Nhân sự ngày đua",
  footerLabel: "Race-staff panel",
  footerIcon: Flag,
  groups: [
    {
      heading: "Tại điểm",
      items: [
        {
          id: "scanner",
          label: "Quét QR / RFID",
          href: "/scanner",
          icon: Radio,
        },
        {
          id: "manual",
          label: "Nhập tay",
          href: "/manual",
          icon: Keyboard,
        },
        {
          id: "issues",
          label: "Sự cố tại chỗ",
          href: "/issues",
          icon: AlertTriangle,
        },
        {
          id: "status",
          label: "Trạng thái đặc biệt",
          href: "/status",
          icon: ClipboardList,
        },
      ],
    },
  ],
};

export const PHOTOGRAPHER_NAV: OpsRoleNav = {
  homeHref: "/",
  breadcrumbLabel: "Nhiếp ảnh",
  footerLabel: "Photographer panel",
  footerIcon: Camera,
  groups: [
    {
      heading: "Công việc",
      items: [
        {
          id: "upload",
          label: "Tải ảnh lên",
          href: "/upload",
          icon: Upload,
        },
        {
          id: "ocr",
          label: "Nhận diện BIB",
          href: "/ocr",
          icon: ScanSearch,
        },
        {
          id: "corrections",
          label: "Sửa BIB",
          href: "/corrections",
          icon: Pencil,
        },
      ],
    },
    {
      heading: "Thư viện ảnh",
      items: [
        {
          id: "analytics",
          label: "Thống kê ảnh",
          href: "/analytics",
          icon: BarChart3,
        },
        {
          id: "publish",
          label: "Xuất bản & thư viện",
          href: "/publish",
          icon: Rocket,
        },
        {
          id: "requests",
          label: "Khiếu nại ảnh",
          href: "/requests",
          icon: ImagePlus,
        },
      ],
    },
  ],
};

export const RACE_STAFF_NAV: OpsRoleNav = {
  homeHref: "/checkpoint",
  breadcrumbLabel: "Nhân sự ngày đua",
  footerLabel: "Race-staff panel",
  footerIcon: Map,
  groups: [
    {
      heading: "Vận hành ngày đua",
      items: [
        {
          id: "checkpoint",
          label: "Checkpoint của tôi",
          href: "/checkpoint",
          icon: MapPin,
        },
        {
          id: "map",
          label: "Bản đồ trực tiếp",
          href: "/map",
          icon: Map,
        },
        {
          id: "medical",
          label: "Đội y tế",
          href: "/medical",
          icon: HeartPulse,
        },
        {
          id: "cutoff",
          label: "Lộ trình & cut-off",
          href: "/cutoff",
          icon: Clock,
        },
      ],
    },
    {
      heading: "Hỗ trợ tuyến",
      items: [
        {
          id: "inventory",
          label: "Trạm tiếp tế",
          href: "/inventory",
          icon: Tent,
        },
        {
          id: "contingency",
          label: "Phương án dự phòng",
          href: "/contingency",
          icon: Ambulance,
        },
        {
          id: "broom",
          label: "Xe quét đường",
          href: "/broom",
          icon: Truck,
        },
      ],
    },
    ...CHECK_IN_NAV.groups,
  ],
};
