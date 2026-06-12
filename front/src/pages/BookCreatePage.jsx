import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentMember } from "@/api/authApi";
import { createBook } from "@/api/bookApi";
import BookForm from "@/components/BookForm";

function BookCreatePage() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMember() {
      try {
        setMember(await getCurrentMember());
      } catch {
        setMember(null);
      } finally {
        setLoadingMember(false);
      }
    }

    loadMember();
  }, []);

  const handleCreate = async (formData) => {
    try {
      setSubmitting(true);
      setError("");
      const newBook = await createBook(formData);
      navigate(`/create/cover/${newBook.id}`);
    } catch (createError) {
      setError(createError.message);
      setSubmitting(false);
    }
  };

  const canCreateBook = member?.role === "AUTHOR" || member?.role === "ADMIN";

  if (loadingMember) {
    return <div className="container page-state">권한을 확인하는 중입니다.</div>;
  }

  if (!canCreateBook) {
    return (
      <section className="container page-state">
        <h1>저자 권한이 필요합니다</h1>
        <p>도서 등록은 저자 또는 관리자만 이용할 수 있습니다.</p>
        <Link className="button button-primary" to="/mypage">My Page로 이동</Link>
      </section>
    );
  }

  return (
    <section className="container page-section form-page">
      <div className="page-heading">
        <p className="eyebrow">STEP 1 OF 2</p>
        <h1>새 도서 등록</h1>
        <p>도서 정보를 입력하면 다음 단계에서 AI 표지를 생성합니다.</p>
      </div>
      <div className="panel form-panel">
        {error && <p className="form-message error">{error}</p>}
        <BookForm
          submitText="저장하고 표지 생성하기"
          onSubmit={handleCreate}
          submitting={submitting}
        />
        <Link className="button button-ghost button-wide" to="/">취소하고 목록으로</Link>
      </div>
    </section>
  );
}

export default BookCreatePage;
