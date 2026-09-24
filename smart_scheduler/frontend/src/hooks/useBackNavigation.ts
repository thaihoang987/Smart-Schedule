import { useEffect, useRef } from "react";

// Cho phep cu chi "vuot trai de back" tren trinh duyet mobile (Chrome/Safari
// edge-swipe) dong dung 1 cap do dieu huong trong app (vd Settings subpage,
// Device Detail) thay vi thoat luon ca trang Ingress - vi app nay tu quan
// ly "trang" bang React state, khong dung react-router/URL nen trinh duyet
// khong biet co gi de back, cu swipe la roi khoi app luon.
//
// Khi `active` bat len: pushState 1 muc gia (khong doi URL) de trinh duyet
// co gi de "back" toi. Nut back trong UI phai goi `window.history.back()`
// (khong goi thang ham dong) de PHAT SINH popstate - popstate moi thuc su
// dong (goi `close`) - dam bao ca nut bam va cu chi swipe deu di chung 1
// duong, khong de sot history entry.
//
// LUU Y (2026-09-23): co 1 phien ban khac tung thay the ham nay bang tu bat
// touchstart/touchend de tu tinh vuot trai (khong dung History API) - da bi
// bao "chua hoat dong" tren may that va doi lai ban nay. Ly do uu tien
// History API: dua vao cu chi edge-swipe-back GOC cua he dieu hanh/trinh
// duyet (da duoc Apple/Google tinh chinh threshold toc do/khoang cach rat
// ky), thay vi tu do lai bang JS (de sai threshold, de xung dot voi cac
// vung cuon ngang nhu .chip-row, va kho debug tren may that vi khong the
// gia lap touch event dang tin cay qua cong cu tu dong hoa). Truoc do o
// v0.3.2/v0.3.3 co 1 ban tu bat touch khac (`useSwipeBack`, code hoan toan
// khac ham nay) da bi go vi xung dot voi cu chi mo sidebar cua Home
// Assistant - NEU ban History API nay cung bi xung dot sidebar tren may
// that, can bao lai cu the (vuot cho ket qua gi) truoc khi thu quay lai
// huong tu bat touch, vi huong do da chung minh la ngo cut 2 lan roi.
export function useBackNavigation(active: boolean, close: () => void) {
  const pushedRef = useRef(false);
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (active && !pushedRef.current) {
      window.history.pushState({ appBackLevel: true }, "");
      pushedRef.current = true;
    } else if (!active) {
      pushedRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    const onPopState = () => {
      if (pushedRef.current) {
        pushedRef.current = false;
        closeRef.current();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}

// Dung cho nut/back-button trong UI: neu dang co muc da push thi goi
// history.back() de kich popstate (xem ham tren); neu khong (vd mo/dong qua
// nguon khac) thi dong truc tiep de khong bi ket UI.
export function goBack(active: boolean, close: () => void) {
  if (active) window.history.back();
  else close();
}
