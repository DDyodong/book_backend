const BASE_URL = "/api/books";

const getTimestamp = () => new Date().toISOString();

async function request(url, options, failureMessage) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let serverErrorMessage = "";
    
    // 백엔드의 JSON 에러 데이터 파싱
    try {
      const errorData = await response.json();
      serverErrorMessage = errorData.message; 
    } catch (parseError) {
      // 서버가 JSON 조차 주지 못하고 죽었을 경우 파싱 에러 무시
    }

    // 서버 메시지가 있으면 던지고, 없으면 기본 failureMessage를 던짐
    throw new Error(serverErrorMessage || failureMessage);
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
    return request(
        BASE_URL,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookData),  // ✅ 서버가 처리
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
        likes: currentLikes,
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

export function getComments(bookId) {
  return request(
    `${BASE_URL}/${bookId}/comments`,
    { credentials: "same-origin" },
    "댓글을 불러오지 못했습니다.",
  );
}

export function createComment(bookId, content) {
  return request(
    `${BASE_URL}/${bookId}/comments`,
    {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
    "댓글 등록에 실패했습니다.",
  );
}
