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
  FolderOpen,
  HeartPulse,
  ImagePlus,
  Keyboard,
  Map,
  Pencil,
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
  homeHref: "/administrator/approvals",
  breadcrumbLabel: "Quản trị hệ thống",
  footerLabel: "Admin panel",
  footerIcon: ShieldCheck,
  groups: [
    {
      heading: "Vận hành",
      items: [
        {
          id: "approvals",
          label: "Duyệt giải",
          href: "/administrator/approvals",
          icon: FileCheck,
        },
      ],
    },
    {
      heading: "Tài chính",
      items: [
        {
          id: "payouts",
          label: "Giải ngân",
          href: "/administrator/payouts",
          icon: Banknote,
        },
        {
          id: "finance",
          label: "Tài chính",
          href: "/administrator/finance",
          icon: PiggyBank,
        },
        {
          id: "settings",
          label: "Cấu hình phí",
          href: "/administrator/settings",
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
          href: "/administrator/users",
          icon: Users,
        },
        {
          id: "reconciliation",
          label: "Đối soát dữ liệu",
          href: "/administrator/reconciliation",
          icon: Scale,
        },
        {
          id: "audit",
          label: "Nhật ký",
          href: "/administrator/audit",
          icon: ClipboardList,
        },
        {
          id: "stats",
          label: "Thống kê",
          href: "/administrator/stats",
          icon: BarChart3,
        },
      ],
    },
  ],
};

export const VOLUNTEER_NAV: OpsRoleNav = {
  homeHref: "/volunteer",
  breadcrumbLabel: "Tình nguyện viên",
  footerLabel: "Volunteer panel",
  footerIcon: Flag,
  groups: [
    {
      heading: "Tại điểm",
      items: [
        {
          id: "scanner",
          label: "Quét QR / RFID",
          href: "/volunteer/scanner",
          icon: Radio,
        },
        {
          id: "manual",
          label: "Nhập tay",
          href: "/volunteer/manual",
          icon: Keyboard,
        },
        {
          id: "issues",
          label: "Sự cố tại chỗ",
          href: "/volunteer/issues",
          icon: AlertTriangle,
        },
        {
          id: "status",
          label: "Trạng thái đặc biệt",
          href: "/volunteer/status",
          icon: ClipboardList,
        },
      ],
    },
  ],
};

export const PHOTOGRAPHER_NAV: OpsRoleNav = {
  homeHref: "/photographer",
  breadcrumbLabel: "Nhiếp ảnh",
  footerLabel: "Photographer panel",
  footerIcon: Camera,
  groups: [
    {
      heading: "Công việc",
      items: [
        {
          id: "assignments",
          label: "Phân công giải",
          href: "/photographer/assignments",
          icon: FolderOpen,
        },
        {
          id: "upload",
          label: "Tải ảnh lên",
          href: "/photographer/upload",
          icon: Upload,
        },
        {
          id: "ocr",
          label: "Nhận diện BIB",
          href: "/photographer/ocr",
          icon: ScanSearch,
        },
        {
          id: "corrections",
          label: "Sửa BIB",
          href: "/photographer/corrections",
          icon: Pencil,
        },
      ],
    },
    {
      heading: "Xuất bản",
      items: [
        {
          id: "analytics",
          label: "Thống kê ảnh",
          href: "/photographer/analytics",
          icon: BarChart3,
        },
        {
          id: "publish",
          label: "Xuất bản ảnh",
          href: "/photographer/publish",
          icon: Rocket,
        },
        {
          id: "requests",
          label: "Yêu cầu chỉnh / ẩn",
          href: "/photographer/requests",
          icon: ImagePlus,
        },
      ],
    },
  ],
};

export const COORDINATOR_NAV: OpsRoleNav = {
  homeHref: "/coordinator",
  breadcrumbLabel: "Điều phối giải",
  footerLabel: "Coordinator panel",
  footerIcon: Map,
  groups: [
    {
      heading: "Vận hành ngày đua",
      items: [
        {
          id: "map",
          label: "Bản đồ trực tiếp",
          href: "/coordinator/map",
          icon: Map,
        },
        {
          id: "scanner",
          label: "Quét QR / RFID",
          href: "/coordinator/scanner",
          icon: Radio,
        },
        {
          id: "medical",
          label: "Đội y tế",
          href: "/coordinator/medical",
          icon: HeartPulse,
        },
        {
          id: "cutoff",
          label: "Lộ trình & cut-off",
          href: "/coordinator/cutoff",
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
          href: "/coordinator/inventory",
          icon: Tent,
        },
        {
          id: "contingency",
          label: "Phương án dự phòng",
          href: "/coordinator/contingency",
          icon: Ambulance,
        },
        {
          id: "broom",
          label: "Xe quét đường",
          href: "/coordinator/broom",
          icon: Truck,
        },
      ],
    },
  ],
};
