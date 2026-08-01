# Frontend React TypeScript Best Practices & Guidelines

> **QUAN TRỌNG:** TẤT CẢ CÁC AGENT AI VÀ DEVELOPER BẮT BUỘC PHẢI ĐỌC VÀ TUÂN THỦ NGHIÊM NGẶT FILE NÀY TRƯỚC VÀ TRONG QUÁ TRÌNH CODE.

Dự án Cờ Tướng Frontend được định hướng xây dựng theo tiêu chuẩn chuyên nghiệp, dễ bảo trì, dễ mở rộng và có hiệu năng cao.

## 1. Nguyên tắc cốt lõi (Core Principles)
- **Đồng nhất giao diện (Consistency):** Tuân thủ tuyệt đối Design System (Màu sắc, Typography, Spacing, Shadows). Giao diện mặc định là **Sáng màu (Light Mode)**. Bất kỳ component nào (Header, Sidebar, Navbar, Footer) cũng phải sử dụng chung hệ thống token từ Tailwind config.
- **DRY (Don't Repeat Yourself):** Không lặp lại code. Nếu một đoạn UI xuất hiện ở 2 nơi trở lên, hãy tách nó thành Component hoặc Custom Hook.
- **Single Source of Truth:** Quản lý state tập trung (với Redux/Zustand) hoặc URL state, tránh việc đồng bộ state thủ công giữa các component.

## 2. Công nghệ & Thư viện (Tech Stack)
- **Core:** React 18, Vite, TypeScript.
- **Styling:** TailwindCSS là bắt buộc cho 90% layout và styling. 
- **UI Component Library:** Cho phép sử dụng **Ant Design (antd)** cho các component phức tạp (Table, Modal, Pagination, DatePicker...) để tiết kiệm thời gian, nhưng phải custom theme của Antd sao cho đồng bộ hoàn toàn với Tailwind config.
- **Routing:** `react-router-dom` v6+. Toàn bộ route phải được cấu hình tập trung.
- **Data Fetching & Caching:** BẮT BUỘC sử dụng **TanStack Query (React Query)** để gọi API thay vì dùng `useEffect` + `useState`.
- **Form & Validation:** BẮT BUỘC sử dụng **React Hook Form** kết hợp với **Zod** để xử lý form và validate dữ liệu.
- **State Management:** Sử dụng **Zustand** cho global state (nhẹ, dễ dùng) hoặc Context API.

## 3. Cấu trúc thư mục (Folder Structure)
Cấu trúc thư mục phải được chia tách rõ ràng, không được phép vi phạm:

```text
frontend/src/
├── assets/           # Hình ảnh, fonts, icons tĩnh
├── components/       # Các component dùng chung (Global Components)
│   ├── ui/           # Các base UI (Button, Input, Card...)
│   ├── layouts/      # Layout components (Header, Sidebar, Footer)
│   └── [PageName]/   # Các component ĐẶC THÙ CHỈ DÙNG CHO 1 TRANG (VD: components/Dashboard/StatsCard)
├── config/           # Cấu hình môi trường, hằng số (constants)
├── hooks/            # Custom hooks dùng chung (useAuth, useWindowSize...)
├── layouts/          # Các Layout chính của ứng dụng (MainLayout, AuthLayout)
├── pages/            # Chứa các trang (Mỗi trang là một thư mục có index.tsx)
│   ├── Login/
│   ├── Dashboard/
│   └── ...
├── routes/           # TẬP TRUNG ĐIỀU HƯỚNG: Một file duy nhất cấu hình toàn bộ Route (index.tsx)
├── services/         # API calls (Axios instances, các hàm gọi API chia theo feature)
├── store/            # Global state (Zustand/Redux)
├── types/            # TypeScript interfaces/types dùng chung
├── utils/            # Helper functions (formatDate, formatCurrency...)
├── App.tsx           # Entry point của Component
└── index.css         # Global CSS (Tailwind directives)
```

## 4. Định tuyến tập trung (Centralized Routing)
- Tất cả các routes PHẢI được khai báo trong thư mục `src/routes/` (có thể là `routes/index.tsx` sử dụng `createBrowserRouter` hoặc `<Routes>`).
- Không rải rác các `<Route>` ở trong các component con.
- Sử dụng Lazy Loading (`React.lazy`) cho các trang (pages) để tối ưu hóa Code Splitting.

## 5. Tiêu chuẩn Code (Code Conventions)
- **Naming:**
  - Component & Interfaces: `PascalCase` (VD: `UserProfile`, `UserTable`).
  - Biến, hàm, custom hooks: `camelCase` (VD: `fetchData`, `useUser`).
  - Constants: `UPPER_SNAKE_CASE` (VD: `API_BASE_URL`).
- **Tuyệt đối không dùng `any`** trong TypeScript. Phải định nghĩa kiểu dữ liệu rõ ràng (`interface` hoặc `type`).
- **Absolute Imports:** Khuyến khích cấu hình path alias `@/` trỏ tới `src/` (VD: `import Button from '@/components/ui/Button'`).

## 6. Xử lý Lỗi & Hiệu năng (Error Handling & Performance)
- Luôn có **Error Boundaries** bọc ngoài các Route chính để app không bị crash trắng trang khi có lỗi JS.
- Sử dụng Skeleton hoặc Spinner (Antd Spin) khi đang loading dữ liệu.
- **BẮT BUỘC:** Mọi thông báo lỗi, cảnh báo, hoặc thông báo thành công (ví dụ: khi Call API bị lỗi, validate form thất bại, hoặc hoàn thành thao tác) ĐỀU PHẢI sử dụng component `message` của Ant Design (`import { message } from 'antd'`). Không sử dụng `alert` mặc định của trình duyệt hay tự custom toast nếu không cần thiết.
- Hạn chế re-render bằng cách cấu trúc component hợp lý, sử dụng `useMemo`, `useCallback` khi cần thiết.

## 7. Responsive & Theme
- Thiết kế phải theo hướng Mobile-first.
- Mặc định sử dụng **Light Mode**. Các mã màu trong Tailwind Config phải được thiết lập dựa trên biến CSS (CSS Variables) để sau này nếu cần làm Dark Mode có thể chuyển đổi dễ dàng, nhưng ưu tiên số 1 hiện tại là Light Mode sáng sủa, sạch sẽ, chuyên nghiệp.

## 8. Tiêu chuẩn Deploy (Deployment Guidelines)
Để đảm bảo ứng dụng có thể deploy trơn tru lên các nền tảng (Vercel, Netlify, Railway) sau này, đội Frontend cần tuyệt đối tuân thủ:
- **Biến Môi Trường (Environment Variables):**
  - TUYỆT ĐỐI KHÔNG hardcode các đường link API (VD: `http://localhost...`) thẳng vào code. Bắt buộc dùng `import.meta.env.VITE_API_BASE_URL`.
  - Luôn duy trì file `.env.example` chứa các biến cần thiết để người khác clone về biết cần thêm biến gì.
- **Kiểm tra Build Local trước khi Push:**
  - Khác với lúc code (`npm run dev`), quá trình Deploy sẽ chạy `npm run build`. Trình biên dịch TypeScript cực kỳ khắt khe, nếu có bất kỳ lỗi TS nào (khai báo biến không dùng, sai kiểu dữ liệu), quá trình deploy sẽ **Treo/Fail ngay lập tức**.
  - Các thành viên có trách nhiệm phải chạy thử `npm run build` ở máy cá nhân, đảm bảo chữ `✓ built in...` xuất hiện thì mới được push code lên Github.
- **Quản lý Import Path:**
  - Máy tính Windows/Mac đôi khi không phân biệt chữ hoa chữ thường với tên file, nhưng Server Linux (chạy trên Cloud) thì có! Nếu import sai vỏn vẹn 1 ký tự viết hoa (VD: file là `Button.tsx` nhưng import là `./button`), chạy local vẫn lên nhưng deploy sẽ sập.
  - Giải pháp: Bắt buộc dùng Absolute Path với alias `@/` (VD: `import Button from '@/components/ui/Button'`).
- **Tài nguyên (Assets):**
  - Tránh đẩy các file ảnh, video dung lượng quá lớn (hàng MB) lên thư mục `assets` vì sẽ làm chậm quá trình build. Dùng ảnh đã nén (WebP) hoặc dùng link CDN ngoài.
