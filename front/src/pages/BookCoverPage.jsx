import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { generateCover } from "@/api/coverApi";
import { getBookById, updateBook } from "@/api/bookApi";
import BookCover from "@/components/BookCover";
import Loading from "@/components/Loading";

const MAX_STORED_COVER_BYTES = 88 * 1024;

function buildPrompt(book) {
  const genres = Array.isArray(book.genre)
    ? book.genre.join(", ")
    : book.genre;

  return [
    `"${book.title}"라는 제목의 한국어 도서 표지를 만들어줘. 저자는 "${book.author}"이다.`,
    `장르는 ${genres}이다.`,
    `줄거리 및 핵심 내용: ${book.content}`,
    "이 이미지는 단순한 분위기 이미지가 아니라, 실제 출판용 느낌의 완성된 책 표지 디자인이어야 한다.",
    `표지에는 책 제목 "${book.title}"이 반드시 정확하게 포함되어야 하며, 눈에 잘 띄고 읽기 쉽게 표시되어야 한다.`,
    "책 제목은 크고 선명하며 또렷한 글자로 표현해줘.",
    `가능하면 저자명 "${book.author}"도 표지에 자연스럽게 포함해줘.`,
    "전체적으로 한국 출판 도서 표지처럼 세련되고 완성도 높게 디자인해줘.",
    "세로형 책 표지 구도, 앞표지 기준, 분위기 있는 조명, 높은 퀄리티의 일러스트, 정제된 타이포그래피와 시각적 스토리텔링을 반영해줘.",
  ].join("\n");
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("표지 이미지를 저장용으로 변환하지 못했습니다."));
    image.src = dataUrl;
  });
}

async function optimizeCoverForStorage(dataUrl) {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("이 브라우저에서는 이미지 저장 처리를 지원하지 않습니다.");
  }

  let width = 420;
  let optimizedImage = "";

  while (width >= 180) {
    canvas.width = width;
    canvas.height = Math.round(width * (image.height / image.width));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (let quality = 0.82; quality >= 0.34; quality -= 0.08) {
      optimizedImage = canvas.toDataURL("image/jpeg", quality);
      if (new Blob([optimizedImage]).size <= MAX_STORED_COVER_BYTES) {
        return optimizedImage;
      }
    }

    width = Math.round(width * 0.8);
  }

  return optimizedImage;
}

function BookCoverPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBook() {
      try {
        const data = await getBookById(id);
        setBook(data);
        setPrompt(buildPrompt(data));
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadBook();
  }, [id]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("표지 생성 프롬프트를 입력해주세요.");
      return;
    }

    try {
      setStatus("loading");
      setGeneratedUrl("");
      setError("");

      const result = await generateCover(prompt.trim());
      if (!result.imageDataUrl) {
        throw new Error("생성된 이미지 데이터를 받지 못했습니다.");
      }

      setGeneratedUrl(result.imageDataUrl);
      setStatus("done");
    } catch (generateError) {
      setError(generateError.message);
      setStatus("error");
    }
  };

  const handleSave = async () => {
    if (!generatedUrl) return;

    try {
      setSaving(true);
      setError("");
      const optimizedCover = await optimizeCoverForStorage(generatedUrl);
      await updateBook(id, { coverImageUrl: optimizedCover });
      navigate(`/books/${id}`);
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  };

  if (!book && !error) return <div className="container page-state">도서 정보를 불러오는 중입니다.</div>;
  if (!book) {
    return (
      <div className="container page-state error">
        <p>{error}</p>
        <Link className="button button-secondary" to="/">목록으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <section className="container page-section cover-generator">
      <div className="page-heading">
        <p className="eyebrow">{mode === "create" ? "STEP 2 OF 2" : "NEW COVER"}</p>
        <h1>{mode === "create" ? "AI 표지를 생성해 등록을 완료하세요" : "AI 표지 재생성"}</h1>
        <p>{book.title} - {book.author}</p>
      </div>

      <div className="generator-layout">
        <div className="panel prompt-panel">
          <label className="field">
            <span>표지 생성 프롬프트 <strong>수정 가능</strong></span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows="16"
            />
            <small className="field-help">OpenAI API Key는 서버의 .env에서 사용되며 브라우저에 노출되지 않습니다.</small>
          </label>
          {error && <p className="form-message error">{error}</p>}
          <button className="button button-primary button-wide" onClick={handleGenerate} disabled={status === "loading"}>
            {status === "loading" ? "표지를 생성하는 중..." : generatedUrl ? "다시 생성하기" : "AI 표지 생성하기"}
          </button>
          {mode === "edit" && (
            <Link className="button button-ghost button-wide" to={`/books/${id}`}>
              기존 표지 유지하고 돌아가기
            </Link>
          )}
        </div>

        <div className="panel preview-panel">
          <h2>표지 미리보기</h2>
          {status === "loading" && <Loading />}
          {status !== "loading" && generatedUrl && (
            <>
              <img className="generated-cover" src={generatedUrl} alt={`${book.title} 생성 표지 미리보기`} />
              <p className="preview-guide">
                저장 시 로컬 데이터 서버에 맞게 표지 이미지를 자동 최적화합니다.
              </p>
              <button className="button button-accent button-wide" onClick={handleSave} disabled={saving}>
                {saving ? "표지를 저장하는 중..." : "이 표지로 저장하기"}
              </button>
            </>
          )}
          {status !== "loading" && !generatedUrl && (
            <>
              <BookCover book={book} className="generated-cover preview-empty" />
              <p className="preview-guide">
                프롬프트를 다듬고 표지를 생성하면 결과를 저장하기 전에 확인할 수 있습니다.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookCoverPage;
