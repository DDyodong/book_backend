function BookCover({ book, className = "" }) {
  if (book.coverImageUrl) {
    return (
      <img
        className={`book-cover ${className}`}
        src={book.coverImageUrl}
        alt={`${book.title} 표지`}
      />
    );
  }

  return (
    <div className={`book-cover book-cover-placeholder ${className}`}>
      <span>{book.title?.charAt(0) || "책"}</span>
      <small>AI BOOK COVER</small>
    </div>
  );
}

export default BookCover;
