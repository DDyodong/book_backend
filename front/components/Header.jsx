import { Link, NavLink } from "react-router-dom";

function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" aria-label="책빛 홈">
          <span className="brand-mark">AI</span>
          <span>
            <strong>책빛</strong>
            <small>AI Cover Library</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          <NavLink to="/">도서 목록</NavLink>
          <Link className="button button-primary" to="/create">
            새 도서 등록
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
