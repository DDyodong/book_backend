import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "@/api/bookApi";
import BookCard from "@/components/BookCard";

function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("전체");

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

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">AI BOOK COLLECTION</p>
          <h1>
            한 권의 이야기에
            <br />
            어울리는 표지를 만드세요.
          </h1>
          <p className="hero-copy">
            도서를 등록하고 OpenAI 이미지 생성 API로 나만의 표지를 완성하는<br />
            도서관리 시스템입니다.
          </p>
          <Link className="button button-accent" to="/create">
            새 도서 등록하기
          </Link>
        </div>
      </section>

      <section className="rank">
        <div className="container stat-row" aria-label="도서 랭킹">
          <div>
            <strong>{topViewedBooks ? topViewedBooks.title : "-"}</strong>
            <span>😚 조회수 1위</span>
          </div>
          <div>
            <strong>{topLikedBooks ? topLikedBooks.title : "-"}</strong>
            <span>❤️ 좋아요 1위</span>
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
