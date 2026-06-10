async function request(url, options) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("로그인 정보를 불러오지 못했습니다.");
  }

  return response.json();
}

export function getCurrentMember() {
  return request("/api/members/me");
}

export function requestAuthorRole() {
  return request("/api/members/me/author-request", {
    method: "POST",
  });
}
