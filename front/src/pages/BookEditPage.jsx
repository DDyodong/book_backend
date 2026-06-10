import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookById, updateBook } from "@/api/bookApi";
import BookForm from "@/components/BookForm";

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        setBook(await getBookById(id));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  const handleEdit = async (formData) => {
    try {
      setSubmitting(true);
      setError("");
      await updateBook(id, formData);
      navigate(`/books/${id}`);
    } catch (updateError) {
      setError(updateError.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container page-state">도서 정보를 불러오는 중입니다.</div>;
  if (!book) {
    return (
      <div className="container page-state error">
        <p>{error || "도서를 찾을 수 없습니다."}</p>
        <Link className="button button-secondary" to="/">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="container page-section form-page">
      <div className="page-heading">
        <p className="eyebrow">EDIT BOOK</p>
        <h1>도서 정보 수정</h1>
        <p>표지를 변경하려면 상세 화면의 AI 표지 재생성 버튼을 이용해주세요.</p>
      </div>
      <div className="panel form-panel">
        {error && <p className="form-message error">{error}</p>}
        <BookForm
          key={book.id}
          initialValues={book}
          submitText="수정 내용 저장하기"
          onSubmit={handleEdit}
          submitting={submitting}
        />
        <Link className="button button-ghost button-wide" to={`/books/${id}`}>취소</Link>
      </div>
    </section>
  );
}

export default BookEditPage;
