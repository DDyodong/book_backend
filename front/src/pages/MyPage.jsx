import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentMember, getLikedBooks } from "@/api/authApi";
import BookCard from "@/components/BookCard";

function MyPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [likedBooks, setLikedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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

        const booksData = await getLikedBooks();
        if (!ignore) {
          setLikedBooks(booksData || []);
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

    loadData();

    return () => {
      ignore = true;
    };
  }, [navigate]);

  if (loading) {
    return <div className="container page-state">마이페이지를 불러오는 중입니다.</div>;
  }

  if (error) {
    return (
      <div className="container page-state error">
        <p>{error}</p>
        <Link className="button button-secondary" to="/">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <>
      <section className="hero mypage-hero">
        <div className="container hero-content">
          <p className="eyebrow">MY PAGE</p>
          <h1>마이페이지</h1>
          {member && (
            <p className="hero-copy">
              환영합니다, <strong>{member.nickname || member.email}</strong>님!
            </p>
          )}
        </div>
      </section>

      <section className="container collection-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PROFILE</p>
            <h2>프로필</h2>
          </div>
        </div>

        {member && (
          <div className="panel profile-panel">
            <div className="profile-content">
              <div className="profile-avatar">
                {member.profileImageUrl ? (
                  <img src={member.profileImageUrl} alt={member.nickname || member.email} />
                ) : (
                  <div className="avatar-placeholder">{(member.nickname || member.email).charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="profile-info">
                <h3>{member.nickname || member.email}</h3>
                <p>{member.email}</p>
                <div className="profile-meta">
                  <span className={`role-badge role-${member.role?.toLowerCase()}`}>
                    {member.role === "AUTHOR" && "저자"}
                    {member.role === "ADMIN" && "관리자"}
                    {member.role === "USER" && "회원"}
                  </span>
                  <span className="provider-badge">Google 계정</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="container collection-section">
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
    </>
  );
}

export default MyPage;
