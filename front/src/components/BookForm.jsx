import { useState } from "react";

const EMPTY_BOOK = {
  title: "",
  author: "",
  genre: [],
  content: "",
};

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

function toFormValues(values) {
  return {
    title: values.title || "",
    author: values.author || "",
    genre: Array.isArray(values.genre) ? values.genre : [],
    content: values.content || "",
  };
}

function BookForm({
  initialValues = EMPTY_BOOK,
  submitText,
  onSubmit,
  submitting = false,
}) {
  const [formData, setFormData] = useState(() => toFormValues(initialValues));
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = "제목을 입력해주세요.";
    if (!formData.author.trim()) nextErrors.author = "저자를 입력해주세요.";
    if (!formData.content.trim()) nextErrors.content = "도서 소개를 입력해주세요.";
    if (formData.genre.length === 0) nextErrors.genre = "장르를 하나 이상 선택해주세요.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      author: formData.author.trim(),
      genre: formData.genre,
      content: formData.content.trim(),
    });
  };

  return (
    <form className="book-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label className="field">
          <span>제목 <strong>필수</strong></span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="예: 시간을 건너는 도서관"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <small className="field-error">{errors.title}</small>}
        </label>

        <label className="field">
          <span>저자 <strong>필수</strong></span>
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="저자명을 입력하세요"
            aria-invalid={Boolean(errors.author)}
          />
          {errors.author && <small className="field-error">{errors.author}</small>}
        </label>
      </div>

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
          placeholder="AI 표지 생성에 활용될 도서의 분위기와 내용을 소개해주세요."
          rows="8"
          aria-invalid={Boolean(errors.content)}
        />
        {errors.content && <small className="field-error">{errors.content}</small>}
      </label>

      <button className="button button-primary button-wide" type="submit" disabled={submitting}>
        {submitting ? "저장 중..." : submitText}
      </button>
    </form>
  );
}

export default BookForm;
