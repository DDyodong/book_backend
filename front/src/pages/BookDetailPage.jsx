import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCurrentMember } from "@/api/authApi";
import { createComment, deleteBook, getBookById, getComments, viewCounter,deleteBookLike, saveBookLike } from "@/api/bookApi";
import BookCover from "@/components/BookCover";

const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = document.cookie.match(`(^|;) ?${name}=([^;]*)(;|$)`);
  return value ? value[2] : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

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

function getMemberDisplayName(member) {
  return member?.nickname || member?.email || "회원";
}

function getRoleLabel(role) {
  if (role === "AUTHOR") return "저자";
  if (role === "ADMIN") return "관리자";
  return "회원";
}

function getInitial(name) {
  return (name || "회").trim().charAt(0).toUpperCase();
}

function ProfileAvatar({ imageUrl, name }) {
  if (imageUrl) {
    return (
      <img
        className="comment-avatar"
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
      />
    );
  }

  return <div className="comment-avatar">{getInitial(name)}</div>;
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
  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [commentError, setCommentError] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

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

  useEffect(() => {
    setIsLiked(Boolean(getCookie(`liked_book_${id}`)));
  }, [id]);

  const loadComments = useCallback(async ({ showError = true } = {}) => {
    try {
      if (showError) setCommentError("");
      const fetchedComments = await getComments(id);
      setComments(fetchedComments);
    } catch (loadError) {
      if (showError) {
        setCommentError(loadError.message);
      }
    }
  }, [id]);

  const loadMember = useCallback(async () => {
    try {
      const currentMember = await getCurrentMember();
      setMember(currentMember);
    } catch {
      setMember(null);
    } finally {
      setLoadingMember(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  useEffect(() => {
    const refreshAuthState = () => {
      if (document.visibilityState === "hidden") return;
      loadMember();
      loadComments({ showError: false });
    };

    window.addEventListener("focus", refreshAuthState);
    document.addEventListener("visibilitychange", refreshAuthState);
    return () => {
      window.removeEventListener("focus", refreshAuthState);
      document.removeEventListener("visibilitychange", refreshAuthState);
    };
  }, [loadComments, loadMember]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (sortOption === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      if (sortOption === "likes") {
        return (b.likes ?? 0) - (a.likes ?? 0);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [comments, sortOption]);

const handleLike = async () => {
  if (!book) return;

  const cookieName = `liked_book_${book.id}`;

  try {
    if (isLiked) {

      await deleteBookLike(book.id);

      const updatedBook = await getBookById(book.id);
      setBook(updatedBook);

      deleteCookie(cookieName);
      setIsLiked(false);

    } else {

      await saveBookLike(book.id);

      const updatedBook = await getBookById(book.id);
      setBook(updatedBook);

      setCookie(cookieName, "true", 365);
      setIsLiked(true);
    }
  } catch (likeError) {
    console.error(likeError);
  }
};

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim()) return;
    if (!member) {
      setCommentError("Google 로그인 후 댓글을 등록할 수 있습니다.");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError("");
      const newComment = await createComment(id, commentText.trim());
      setComments((currentComments) => [newComment, ...currentComments]);
      setCommentText("");
      await loadMember();
      await loadComments({ showError: false });
    } catch (submitError) {
      setCommentError(submitError.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCommentLike = (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? (comment.likes ?? 0) - 1 : (comment.likes ?? 0) + 1,
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

  const canManageBook = member?.role === "AUTHOR" || member?.role === "ADMIN";

  return (
    <section className="container page-section detail-page">
      <div className="detail-toolbar">
        <Link className="back-link" to="/">목록으로</Link>
        {canManageBook && (
          <div className="action-row">
            <Link className="button button-secondary" to={`/edit/${id}`}>정보 수정</Link>
            <button className="button button-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </div>

      <div className="detail-layout">
        <div className="cover-column">
          <BookCover book={book} className="detail-cover" />
          {canManageBook && (
            <Link className="button button-accent button-wide" to={`/edit/cover/${id}`}>
              AI 표지 {book.coverImageUrl ? "재생성" : "생성"}하기
            </Link>
          )}
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
            <span
              className="button"
              style={{ cursor: "default", backgroundColor: "#f0f0f0", color: "#333", border: "none" }}
            >
              조회수 {book.views ?? 0}
            </span>
            <button className="button" onClick={handleLike}>
              {isLiked ? "❤️ 좋아요" : "♡ 좋아요"} ({book.likes})
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
          <ProfileAvatar imageUrl={member?.profileImageUrl} name={getMemberDisplayName(member)} />
          <div className="comment-input-box">
            <div className="comment-writer">
              <strong>{member ? getMemberDisplayName(member) : "로그인이 필요합니다"}</strong>
              {member && (
                <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                  {getRoleLabel(member.role)}
                </span>
              )}
            </div>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder={member ? "댓글을 입력해주세요..." : "Google 로그인 후 댓글을 작성할 수 있습니다."}
              maxLength={500}
              disabled={!member || submittingComment || loadingMember}
            />
            {commentError && <p className="comment-error">{commentError}</p>}
            <div className="comment-form-footer">
              <span>{commentText.length} / 500</span>
              {member ? (
                <button className="button" type="submit" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? "등록 중..." : "등록"}
                </button>
              ) : (
                <a className="button button-secondary" href="/oauth2/authorization/google">
                  Google 로그인
                </a>
              )}
            </div>
          </div>
        </form>

        <div className="comment-list">
          {sortedComments.map((comment) => (
            <div className="comment-item" key={comment.id}>
              <ProfileAvatar imageUrl={comment.memberProfileImageUrl} name={comment.memberName} />
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.memberName}</strong>
                  <span className={`role-badge role-${comment.memberRole?.toLowerCase()}`}>
                    {comment.memberRoleLabel || getRoleLabel(comment.memberRole)}
                  </span>
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
                    좋아요 {comment.likes ?? 0}
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