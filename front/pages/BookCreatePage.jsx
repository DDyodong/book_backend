import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBook } from "@/api/bookApi";
import BookForm from "@/components/BookForm";

function BookCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
