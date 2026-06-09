import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteBook, getBookById, viewCounter, likeCounter } from "@/api/bookApi";
import BookCover from "@/components/BookCover";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const fetchedBook = await getBookById(id);
        await viewCounter({id: fetchedBook.id, currentViews: fetchedBook.views});
        setBook({
          ...fetchedBook,
          views: fetchedBook.views + 1,
        });   
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }  
    loadBook();
  }, [id]);

  const handleLike = async () => {
    if (!book) return;

    try {
      await likeCounter({ id: book.id, currentLikes: book.likes });
      setBook({
        ...book,
        likes: book.likes + 1,
      });
    } catch (likeError) {
      setError(likeError.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("이 도서를 삭제하시겠습니까?")) return;

    try {
      setDeleting(true);
      await deleteBook(id);
      navigate("/");
    } catch (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="container page-state">도서 정보를 불러오는 중입니다.</div>;
  if (error || !book) {
    return (
      <div className="container page-state error">
        <p>{error || "도서를 찾을 수 없습니다."}</p>
        <Link className="button button-secondary" to="/">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="container page-section detail-page">
      <div className="detail-toolbar">
        <Link className="back-link" to="/">목록으로</Link>
        <div className="action-row">
          <Link className="button button-secondary" to={`/edit/${id}`}>정보 수정</Link>
          <button className="button button-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>

      <div className="detail-layout">
        <div className="cover-column">
          <BookCover book={book} className="detail-cover" />
          <Link className="button button-accent button-wide" to={`/edit/cover/${id}`}>
            AI 표지 {book.coverImageUrl ? "재생성" : "생성"}하기
          </Link>
        </div>
        <article className="panel detail-content">
          <div className="chip-row">
            {book.genre?.map((genre) => <span className="chip" key={genre}>{genre}</span>)}
          </div>
          <h1>{book.title}</h1>
          <p className="detail-author">{book.author}</p>
          <dl className="book-meta">
            <div><dt>등록일</dt><dd>{formatDate(book.createdAt)}</dd></div>
            <div><dt>최근 수정</dt><dd>{formatDate(book.updatedAt)}</dd></div>
            <button className="button" onClick={handleLike} style={{ marginTop: "10px" }}>
            ❤️ ({book.likes})
            </button>
          </dl>
          <div className="chip-row">
            <span className="chip">조회수 {book.views}</span>
          </div>
          <div className="description">
            <h2>책 소개</h2>
            {book.content.split("\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default BookDetailPage;
