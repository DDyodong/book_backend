import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getCurrentMember, requestAuthorRole } from "@/api/authApi";

function Header() {
  const [member, setMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(true);
  const [requestingAuthor, setRequestingAuthor] = useState(false);

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

  const handleAuthorRequest = async () => {
    try {
      setRequestingAuthor(true);
      await requestAuthorRole();
      setMember(await getCurrentMember());
    } finally {
      setRequestingAuthor(false);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="책부침 홈">
          <span className="brand-mark">AI</span>
          <span>
            <strong>책부침</strong>
            <small>AI Cover Library</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/">도서 목록</NavLink>
          <Link className="button button-primary" to="/create">
            새 도서 등록
          </Link>
          {!loadingMember && !member && (
            <a className="button button-secondary" href="/oauth2/authorization/google">
              Google 로그인
            </a>
          )}
          {!loadingMember && member && (
            <>
              <Link to="/my-page" className="button button-secondary">
                마이페이지
              </Link>
              <span className="chip">{member.nickname || member.email}</span>
              {member.role !== "AUTHOR" && member.role !== "ADMIN" && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={handleAuthorRequest}
                  disabled={requestingAuthor}
                >
                  {requestingAuthor ? "신청 중..." : "저자 신청"}
                </button>
              )}
              {(member.role === "AUTHOR" || member.role === "ADMIN") && (
                <span className="chip">저자 권한</span>
              )}
              <a className="button button-ghost" href="/logout">
                로그아웃
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
