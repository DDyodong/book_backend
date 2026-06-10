import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteBook, getBookById, likeCounter, viewCounter } from "@/api/bookApi";
import BookCover from "@/components/BookCover";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function getTimeAgo(createdAt) {
  const createdDate = new Date(createdAt);
  const diffMs = Date.now() - createdDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${diffDays}일 전`;
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      try {
        setLoading(true);
        setError("");
        const fetchedBook = await getBookById(id);
        await viewCounter({ id: fetchedBook.id, currentViews: fetchedBook.views ?? 0 });

        if (!ignore) {
          setBook({
            ...fetchedBook,
            views: (fetchedBook.views ?? 0) + 1,
          });
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      ignore = true;
    };
  }, [id]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOption === "likes") {
        return b.likes - a.likes;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [comments, sortOption]);

  const handleLike = async () => {
    if (!book) return;

    try {
      await likeCounter({ id: book.id, currentLikes: book.likes ?? 0 });
      setBook({
        ...book,
        likes: (book.likes ?? 0) + 1,
      });
    } catch (likeError) {
      setError(likeError.message);
    }
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      userName: "방문자",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const handleCommentLike = (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment,
      ),
    );
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

  if (loading) {
    return <div className="container page-state">도서 정보를 불러오는 중입니다.</div>;
  }

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
          </dl>
          <div className="chip-row">
            <span className="chip">조회수 {book.views ?? 0}</span>
            <button className="button" onClick={handleLike}>
              좋아요 ({book.likes ?? 0})
            </button>
          </div>
          <div className="description">
            <h2>책 소개</h2>
            {book.content?.split("\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>

      <article className="panel comment-section">
        <div className="comment-header">
          <h2>댓글 ({comments.length})</h2>
          <select
            className="comment-sort"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <div className="comment-avatar">방</div>
          <div className="comment-input-box">
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="댓글을 입력해주세요..."
              maxLength={500}
            />
            <div className="comment-form-footer">
              <span>{commentText.length} / 500</span>
              <button className="button" type="submit">등록</button>
            </div>
          </div>
        </form>

        <div className="comment-list">
          {sortedComments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <div className="comment-avatar">방</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.userName}</strong>
                  <span>{getTimeAgo(comment.createdAt)}</span>
                </div>
                <p>{comment.content}</p>
                <div className="comment-actions">
                  <button type="button">답글</button>
                  <button
                    type="button"
                    className={`comment-like-button ${comment.isLiked ? "active" : ""}`}
                    onClick={() => handleCommentLike(comment.id)}
                  >
                    좋아요 {comment.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default BookDetailPage;
