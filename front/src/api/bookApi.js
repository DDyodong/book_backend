const BASE_URL = "http://localhost:4000/books";

const getTimestamp = () => new Date().toISOString();

async function request(url, options, failureMessage) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(failureMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getBooks() {
  return request(BASE_URL, undefined, "도서 목록을 불러오지 못했습니다.");
}

export function getBookById(id) {
  return request(`${BASE_URL}/${id}`, undefined, "도서 정보를 불러오지 못했습니다.");
}

export function createBook(bookData) {
  const now = getTimestamp();

  return request(
    BASE_URL,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bookData,
        coverImageUrl: "",
        createdAt: now,
        updatedAt: now,
        views: 0,
        likes: 0,
      }),
    },
    "도서 등록에 실패했습니다.",
  );
}

export function viewCounter({ id, currentViews }) {

  return request(
    `${BASE_URL}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        views: currentViews + 1,
        updatedAt: getTimestamp(),
      }),
    },
    "조회수 업데이트에 실패했습니다.",
  );
}

export function likeCounter({ id, currentLikes }) {
  
  return request(
    `${BASE_URL}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        likes: currentLikes + 1,
        updatedAt: getTimestamp(),
      }),
    },
    "좋아요 업데이트에 실패했습니다.",
  );
}

export function updateBook(id, changes) {
  return request(
    `${BASE_URL}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...changes,
        updatedAt: getTimestamp(),
      }),
    },
    "도서 수정에 실패했습니다.",
  );
}

export async function deleteBook(id) {
  await request(
    `${BASE_URL}/${id}`,
    { method: "DELETE" },
    "도서 삭제에 실패했습니다.",
  );
}
