import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCurrentMember } from "@/api/authApi";
import { getBookById, updateBook } from "@/api/bookApi";
import BookCover from "@/components/BookCover";

const GENRE_OPTIONS = [
  "소설",
  "에세이",
  "자기계발",
  "인문학",
  "SF",
  "판타지",
  "미스터리",
  "심리학",
  "경제",
  "역사",
  "과학",
  "철학",
  "예술",
  "사회",
  "정치",
  "종교",
  "여행",
  "요리",
  "로맨스",
  "동화",
  "교양",
];

const HISTORY_PRESETS = [
  {
    id: 5,
    ageInDays: 0,
    prompt: "따뜻한 햇살, 책상 위 책과 커피, 잔잔한 감성의 에세이 표지",
    active: true,
  },
  {
    id: 4,
    ageInDays: 1,
    prompt: "하늘색 배경, 손글씨 느낌, 따뜻한 문구가 적힌 종이",
  },
  {
    id: 3,
    ageInDays: 2,
    prompt: "노을 지는 풍경, 반지, 감성적인 에세이 분위기",
  },
  {
    id: 2,
    ageInDays: 4,
    prompt: "초록빛 숲길, 산책, 울림 있는 감성 에세이 표지",
  },
  {
    id: 1,
    ageInDays: 6,
    prompt: "밤하늘, 별, 조용한 분위기의 에세이 표지",
  },
];

function toFormValues(book) {
  return {
    title: book?.title || "",
    author: book?.author || "",
    genre: Array.isArray(book?.genre) ? book.genre : [],
    content: book?.content || "",
  };
}

function buildHistoryRows(book) {
  const baseDate = new Date(book?.updatedAt || book?.createdAt || Date.now());

  return HISTORY_PRESETS.map((entry) => {
    const createdAt = new Date(baseDate);
    createdAt.setDate(createdAt.getDate() - entry.ageInDays);

    return {
      id: entry.id,
      cover: entry.active ? book : { ...book, coverImageUrl: "" },
      createdAt: createdAt.toISOString(),
      prompt: entry.prompt,
      active: entry.active,
    };
  });
}

function HistoryRow({ row }) {
  return (
    <div className="cover-history-row">
      <strong>{row.id}</strong>
      <BookCover book={row.cover} className="history-cover" />
      <span>{formatHistoryDate(row.createdAt)}</span>
      <p>{row.prompt}</p>
      {row.active ? (
        <span className="history-active">현재 표지</span>
      ) : (
        <button className="history-button" type="button">
          이 표지로 변경
        </button>
      )}
    </div>
  );
}

function formatHistoryDate(value) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState(toFormValues(null));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMember, setLoadingMember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await getBookById(id);
        setBook(data);
        setFormData(toFormValues(data));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

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

  const historyRows = useMemo(() => buildHistoryRows(book), [book]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleGenreChange = (event) => {
    const { checked, value } = event.target;
    setFormData((current) => ({
      ...current,
      genre: checked
        ? [...current.genre, value]
        : current.genre.filter((genre) => genre !== value),
    }));
    setErrors((current) => ({ ...current, genre: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = "제목을 입력해주세요.";
    if (formData.genre.length === 0) nextErrors.genre = "장르를 하나 이상 선택해주세요.";
    if (!formData.content.trim()) nextErrors.content = "도서 소개를 입력해주세요.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await updateBook(id, {
        title: formData.title.trim(),
        author: formData.author,
        genre: formData.genre,
        content: formData.content.trim(),
      });
      navigate(`/books/${id}`);
    } catch (updateError) {
      setError(updateError.message);
      setSubmitting(false);
    }
  };

  const canEditBook = member?.role === "AUTHOR" || member?.role === "ADMIN";

  if (loading || loadingMember) return <div className="container page-state">도서 정보와 권한을 확인하는 중입니다.</div>;
  if (!canEditBook) {
    return (
      <div className="container page-state">
        <h1>저자 권한이 필요합니다</h1>
        <p>도서 수정은 저자 또는 관리자만 이용할 수 있습니다.</p>
        <Link className="button button-primary" to="/mypage">My Page로 이동</Link>
      </div>
    );
  }
  if (!book) {
    return (
      <div className="container page-state error">
        <p>{error || "도서를 찾을 수 없습니다."}</p>
        <Link className="button button-secondary" to="/mypage">My Page로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="container page-section edit-workspace">
      <div className="page-heading">
        <p className="eyebrow">EDIT BOOK</p>
        <h1>도서 정보 수정</h1>
        <p>도서 정보와 표지 제작 기록을 한 화면에서 함께 관리할 수 있습니다.</p>
      </div>

      <div className="edit-layout">
        <form className="panel edit-form-panel" onSubmit={handleSubmit} noValidate>
          {error && <p className="form-message error">{error}</p>}

          <label className="field">
            <span>제목 <strong>필수</strong></span>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <small className="field-error">{errors.title}</small>}
          </label>

          <fieldset className="field genre-field">
            <legend>장르 <strong>필수</strong></legend>
            <div className="genre-options">
              {GENRE_OPTIONS.map((genre) => (
                <label key={genre} className="genre-option">
                  <input
                    type="checkbox"
                    value={genre}
                    checked={formData.genre.includes(genre)}
                    onChange={handleGenreChange}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>
            {errors.genre && <small className="field-error">{errors.genre}</small>}
          </fieldset>

          <label className="field">
            <span>도서 소개 <strong>필수</strong></span>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="8"
              aria-invalid={Boolean(errors.content)}
            />
            {errors.content && <small className="field-error">{errors.content}</small>}
          </label>

          <button className="button button-primary button-wide" type="submit" disabled={submitting}>
            {submitting ? "저장 중..." : "수정 내용 저장하기"}
          </button>
          <Link className="button button-ghost button-wide" to="/mypage">취소</Link>
        </form>

        <aside className="panel cover-history-panel">
          <div className="cover-history-header">
            <div>
              <h2>히스토리 <span>(표지 제작 기록)</span></h2>
              <p>해당 도서의 최근 표지 이미지와 제작 프롬프트를 확인합니다.</p>
            </div>
            <Link className="button button-secondary" to={`/edit/cover/${id}`}>
              AI 표지 재생성
            </Link>
          </div>

          <div className="cover-history-table">
            <div className="cover-history-row cover-history-head">
              <span>No.</span>
              <span>표지 이미지</span>
              <span>생성 일시</span>
              <span>프롬프트</span>
              <span>작업</span>
            </div>
            {historyRows.map((row) => <HistoryRow key={row.id} row={row} />)}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BookEditPage;
