async function request(url, options, failureMessage) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
  });

  if (!response.ok) {
    let serverErrorMessage = "";

    try {
      const errorData = await response.json();
      serverErrorMessage = errorData.message;
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(serverErrorMessage || failureMessage);
  }

  return response.json();
}

export function generateCover(prompt) {
  return request(
    "/api/covers/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    },
    "표지 이미지 생성에 실패했습니다.",
  );
}
