import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentMember, getLikedBooks, requestAuthorRole } from "@/api/authApi";
import { getBooks } from "@/api/bookApi";
import BookCard from "@/components/BookCard";
import { emitMemberChange } from "@/components/DemoToolbar";

function roleLabel(role) {
  if (role === "ADMIN") return "관리자";
  if (role === "AUTHOR") return "저자";
  return "회원";
}

function ProfileAvatar({ member }) {
  if (member.profileImageUrl) {
    return <img src={member.profileImageUrl} alt={member.nickname || member.email} />;
  }

  return (
    <div className="avatar-placeholder">
      {(member.nickname || member.email || "?").charAt(0).toUpperCase()}
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [likedBooks, setLikedBooks] = useState([]);
  const [authorBooks, setAuthorBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestingAuthor, setRequestingAuthor] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        setError("");
        const memberData = await getCurrentMember();

        if (!memberData) {
          navigate("/");
          return;
        }

        if (!ignore) {
          setMember(memberData);
        }

        const likedBooksData = await getLikedBooks();
        if (!ignore) {
          setLikedBooks(likedBooksData || []);
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

    const handleMemberChange = (event) => {
      setMember(event.detail?.member ?? null);
      setLoading(false);
    };

    loadData();
    window.addEventListener("member-state-change", handleMemberChange);

    return () => {
      ignore = true;
      window.removeEventListener("member-state-change", handleMemberChange);
    };
  }, [navigate]);

  useEffect(() => {
    async function loadAuthorBooks() {
      if (member?.role !== "AUTHOR" && member?.role !== "ADMIN") {
        setAuthorBooks([]);
        return;
      }

      try {
        setAuthorBooks(await getBooks());
      } catch {
        setAuthorBooks([]);
      }
    }

    loadAuthorBooks();
  }, [member]);

  const handleAuthorRequest = async () => {
    try {
      setRequestingAuthor(true);
      setError("");
      await requestAuthorRole();
      const updatedMember = await getCurrentMember();
      setMember(updatedMember);
      emitMemberChange(updatedMember);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRequestingAuthor(false);
    }
  };

  if (loading) {
    return <div className="container page-state">마이페이지를 불러오는 중입니다.</div>;
  }

  if (error && !member) {
    return (
      <div className="container page-state error">
        <p>{error}</p>
        <Link className="button button-secondary" to="/">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="container page-section my-page">
      <div className="page-heading">
        <p className="eyebrow">MY PAGE</p>
        <h1>내 계정</h1>
        <p>Google 로그인 정보와 저장한 도서, 저자 권한 상태를 확인합니다.</p>
      </div>

      {error && <div className="state-card error">{error}</div>}

      {member && (
        <div className="panel profile-panel">
          <div className="profile-content">
            <div className="profile-avatar">
              <ProfileAvatar member={member} />
            </div>
            <div className="profile-info">
              <br></br>
              <h3>{member.nickname || member.email}</h3>
              <p>{member.email}</p>
              <div className="profile-meta">
                <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                  {roleLabel(member.role)}
                </span>
                <span className="provider-badge">Google 계정</span>
              </div>
            </div>
          </div>

          {member.role !== "AUTHOR" && member.role !== "ADMIN" && (
            <button
              className="button button-primary"
              type="button"
              onClick={handleAuthorRequest}
              disabled={requestingAuthor}
            >
              {requestingAuthor ? "신청 중..." : "저자 신청하기"}
            </button>
          )}

          {(member.role === "AUTHOR" || member.role === "ADMIN") && (
            <Link className="button button-primary" to="/create">
              새 도서 등록
            </Link>
          )}
        </div>
      )}

      <section className="collection-section mypage-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FAVORITES</p>
            <h2>좋아요 목록</h2>
          </div>
          <p>{likedBooks.length}권 저장됨</p>
        </div>

        {likedBooks.length === 0 ? (
          <div className="state-card">
            <h3>아직 좋아요한 책이 없습니다</h3>
            <p>마음에 드는 책을 찾아 좋아요를 눌러보세요.</p>
            <Link className="button button-primary" to="/">도서 목록 보기</Link>
          </div>
        ) : (
          <div className="book-grid">
            {likedBooks.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </section>

      {member && (member.role === "AUTHOR" || member.role === "ADMIN") && (
        <section className="panel author-library-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AUTHOR LIBRARY</p>
              <h2>내 도서 관리</h2>
            </div>
            <Link className="button button-primary" to="/create">새 도서 등록</Link>
          </div>

          {authorBooks.length === 0 ? (
            <div className="state-card">아직 등록된 도서가 없습니다.</div>
          ) : (
            <div className="author-book-list">
              {authorBooks.map((book) => (
                <article className="author-book-row" key={book.id}>
                  <div>
                    <strong>{book.title}</strong>
                    <span>{book.author} · 조회수 {book.views ?? 0} · 좋아요 {book.likes ?? 0}</span>
                  </div>
                  <div className="author-book-actions">
                    <Link className="button button-secondary" to={`/books/${book.id}`}>상세</Link>
                    <Link className="button button-primary" to={`/edit/${book.id}`}>수정</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default MyPage;
