import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import BookCreatePage from "@/pages/BookCreatePage";
import BookDetailPage from "@/pages/BookDetailPage";
import BookEditPage from "@/pages/BookEditPage";
import HomePage from "@/pages/HomePage";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const BookCoverPage = lazy(() => import("@/pages/BookCoverPage"));

function NotFoundPage() {
  return (
    <section className="container page-state">
      <h1>페이지를 찾을 수 없습니다</h1>
      <Link className="button button-primary" to="/">도서 목록으로</Link>
    </section>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <ScrollToTop />
        <Header />
        <main className="site-main">
          <Suspense fallback={<div className="container page-state">화면을 불러오는 중입니다.</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<BookCreatePage />} />
              <Route path="/create/cover/:id" element={<BookCoverPage mode="create" />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/edit/:id" element={<BookEditPage />} />
              <Route path="/edit/cover/:id" element={<BookCoverPage mode="edit" />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;
