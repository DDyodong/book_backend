import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember, requestAuthorRole } from "@/api/authApi";

function roleLabel(role) {
  if (role === "ADMIN") return "관리자";
  if (role === "AUTHOR") return "저자";
  return "기본 회원";
}

function ProfileAvatar({ member }) {
  if (member.profileImageUrl) {
    return (
      <img
        className="profile-avatar"
        src={member.profileImageUrl}
        alt=""
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="profile-avatar" aria-hidden="true">
      {(member.nickname || member.email || "U").slice(0, 1).toUpperCase()}
    </div>
  );
}

function MyPage() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestingAuthor, setRequestingAuthor] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMember() {
      try {
        setError("");
        setMember(await getCurrentMember());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadMember();
  }, []);

  const handleAuthorRequest = async () => {
    try {
      setRequestingAuthor(true);
      setError("");
      await requestAuthorRole();
      setMember(await getCurrentMember());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setRequestingAuthor(false);
    }
  };

  return (
    <section className="container page-section my-page">
      <div className="page-heading">
        <p className="eyebrow">MY PAGE</p>
        <h1>내 계정</h1>
        <p>Google 로그인 정보와 저자 권한 상태를 확인합니다.</p>
      </div>

      <div className="panel my-page-panel">
        {loading && <div className="state-card">로그인 정보를 불러오는 중입니다.</div>}
        {!loading && error && <div className="state-card error">{error}</div>}

        {!loading && !member && (
          <div className="my-page-empty">
            <h2>로그인이 필요합니다</h2>
            <p>Google 계정으로 로그인하면 댓글 작성과 저자 신청을 사용할 수 있습니다.</p>
            <a className="button button-primary" href="/oauth2/authorization/google">
              Google 로그인
            </a>
          </div>
        )}

        {!loading && member && (
          <div className="profile-card">
            <ProfileAvatar member={member} />
            <div className="profile-content">
              <span className={`role-badge ${member.role === "AUTHOR" ? "role-author" : ""} ${member.role === "ADMIN" ? "role-admin" : ""}`}>
                {roleLabel(member.role)}
              </span>
              <h2>{member.nickname || "이름 없음"}</h2>
              <p>{member.email}</p>

              <div className="profile-actions">
                {member.role !== "AUTHOR" && member.role !== "ADMIN" && (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={handleAuthorRequest}
                    disabled={requestingAuthor}
                  >
                    {requestingAuthor ? "신청 중..." : "저자 신청"}
                  </button>
                )}
                <Link className="button button-secondary" to="/">
                  도서 목록으로
                </Link>
                <a className="button button-ghost" href="/logout">
                  로그아웃
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default MyPage;
