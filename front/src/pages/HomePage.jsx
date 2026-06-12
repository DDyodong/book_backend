import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentMember } from "@/api/authApi";
import { getBooks } from "@/api/bookApi";
import BookCard from "@/components/BookCard";

function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("전체");
  const [member, setMember] = useState(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setError("");
        setBooks(await getBooks());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  useEffect(() => {
    async function loadMember() {
      try {
        setMember(await getCurrentMember());
      } catch {
        setMember(null);
      }
    }

    const handleMemberChange = (event) => {
      setMember(event.detail?.member ?? null);
    };

    loadMember();
    window.addEventListener("focus", loadMember);
    window.addEventListener("member-state-change", handleMemberChange);

    return () => {
      window.removeEventListener("focus", loadMember);
      window.removeEventListener("member-state-change", handleMemberChange);
    };
  }, []);

  const genres = useMemo(
    () => ["전체", ...new Set(books.flatMap((book) => book.genre || []))],
    [books],
  );

  const visibleBooks = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesKeyword =
        !keyword ||
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword);
      const matchesGenre = genre === "전체" || book.genre?.includes(genre);

      return matchesKeyword && matchesGenre;
    });
  }, [books, searchTerm, genre]);

  const topViewedBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
  }, [books]);

  const topLikedBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))[0];
  }, [books]);

  const isAuthor = member?.role === "AUTHOR" || member?.role === "ADMIN";
  const showAuthorHome = isAuthor;

  return (
    <>
      <section className={`hero ${showAuthorHome ? "hero-author" : "hero-reader"}`}>
        <div className="container hero-content">
          {showAuthorHome ? (
            <>
              <p className="eyebrow">AUTHOR STUDIO</p>
              <h1>
                책의 분위기를 담은
                <br />
                나만의 표지를 완성하세요.
              </h1>
              <p className="hero-copy">
                저자 권한으로 도서를 등록하고 OpenAI 표지 생성까지 이어서 진행합니다.
              </p>
              <div className="hero-actions">
                <Link className="button button-accent hero-button" to="/create">
                  새 도서 등록하기
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">AI BOOK COLLECTION</p>
              <h1>
                마음에 드는 책을
                <br />
                발견하고 이야기하세요.
              </h1>
              <p className="hero-copy">
                책을 둘러보고 댓글로 감상을 남겨보세요. 저자 신청 후에는 직접 도서를 등록할 수 있습니다.
              </p>
              <div className="hero-actions">
                <Link className="button button-primary" to="/mypage">
                  {member ? "저자 신청하기" : "My Page 보기"}
                </Link>
                {!member && (
                  <a className="button button-secondary" href="/oauth2/authorization/google">
                    Google 로그인
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="rank">
        <div className="container stat-row" aria-label="도서 랭킹">
          <div className="ranking-card">
            <span className="ranking-label">
              조회수 <span className="rank-number">1위</span>
            </span>
            <strong>{topViewedBooks ? topViewedBooks.title : "-"}</strong>
            <div className="ranking-sub">
              <span className="ranking-author">
                {topViewedBooks ? topViewedBooks.author : "-"}
              </span>
              <span className="ranking-meta">
                조회수 {topViewedBooks ? topViewedBooks.views : 0}
              </span>
            </div>
          </div>
          <div className="ranking-card">
            <span className="ranking-label like">
              좋아요 <span className="rank-number">1위</span>
            </span>
            <strong>{topLikedBooks ? topLikedBooks.title : "-"}</strong>
            <div className="ranking-sub">
              <span className="ranking-author">
                {topLikedBooks ? topLikedBooks.author : "-"}
              </span>
              <span className="ranking-meta">
                좋아요 {topLikedBooks ? topLikedBooks.likes : 0}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container collection-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LIBRARY</p>
            <h2>도서 컬렉션</h2>
          </div>
          <p>{visibleBooks.length}권 표시 중</p>
        </div>

        <div className="filters" aria-label="도서 검색 및 필터">
          <label className="search-field">
            <span className="sr-only">제목 또는 저자 검색</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="제목 또는 저자를 검색하세요"
            />
          </label>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => (
              <option key={item} value={item}>{item === "전체" ? "모든 장르" : item}</option>
            ))}
          </select>
        </div>

        {loading && <div className="state-card">도서 목록을 불러오는 중입니다.</div>}
        {error && <div className="state-card error">{error} 로컬 데이터 서버가 실행 중인지 확인해주세요.</div>}
        {!loading && !error && visibleBooks.length === 0 && (
          <div className="state-card">
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 장르를 선택해보세요.</p>
          </div>
        )}
        {!loading && !error && visibleBooks.length > 0 && (
          <div className="book-grid">
            {visibleBooks.map((book) => <BookCard key={book.id} book={book} />)}
          </div>
        )}
      </section>
    </>
  );
}

export default HomePage;
