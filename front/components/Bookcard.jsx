import { Link } from "react-router-dom";
import BookCover from "./BookCover";

function formatDate(date) {
  if (!date) return "날짜 없음";

  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card">
      <BookCover book={book} className="book-card-cover" />
      <div className="book-card-body">
        <div className="chip-row">
          {book.genre?.slice(0, 2).map((genre) => (
            <span className="chip" key={genre}>
              {genre}
            </span>
          ))}
        </div>
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <small>{formatDate(book.createdAt)}</small>
      </div>
    </Link>
  );
}

export default BookCard;
