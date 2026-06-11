# book_backend

AIVLE 24조 도서 관리 프로젝트입니다. 프론트는 React/Vite, 백엔드는 Spring Boot, 로컬 DB는 H2를 사용합니다.

## 현재 구조

```text
book_backend/
├─ bookserver/        # Spring Boot 백엔드
├─ front/             # React/Vite 프론트
├─ .gitignore
└─ README.md
```

## 포트

| 구분 | 주소 | 설명 |
| --- | --- | --- |
| Frontend | http://localhost:5173 | React/Vite 화면 |
| Backend | http://localhost:8080 | Spring Boot API |
| H2 Console | http://localhost:8080/h2-console | 로컬 H2 DB 확인 |

프론트는 Vite proxy로 `/api`, `/oauth2`, `/login`, `/logout` 요청을 백엔드 `8080`으로 넘깁니다.

## 백엔드 실행

### IntelliJ 추천 방식

1. IntelliJ에서 `bookserver` 폴더를 프로젝트/모듈 기준으로 엽니다.
2. `bookserver/src/main/java/com/aivle/bookserver/BookserverApplication.java`를 실행합니다.
3. `bookserver/.env` 파일이 있으면 Google Client ID/Secret과 OpenAI API Key를 자동으로 읽습니다.

중요: IntelliJ Working directory는 `bookserver`로 맞추는 것을 추천합니다. 현재 설정은 repo 루트에서 실행해도 `bookserver/.env`를 읽도록 보완되어 있습니다.

### Git Bash 추천 방식

```bash
cd "/c/Users/User/Documents/Prj 1/book_backend/bookserver"
./gradlew.bat bootRun
```

Windows에서 `bash` 명령이 WSL로 잡히는 경우가 있습니다. 그럴 때는 시작 메뉴에서 Git Bash를 직접 열거나, 터미널에서 `"C:\Program Files\Git\bin\bash.exe"`를 지정해서 실행합니다.

### CMD 또는 PowerShell

```powershell
cd "C:\Users\User\Documents\Prj 1\book_backend\bookserver"
.\gradlew.bat bootRun
```

PowerShell에서 보안 정책 때문에 스크립트 실행이 막히면 현재 터미널에만 임시로 허용합니다.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

그래도 npm/gradle 명령이 PowerShell에서 꼬이면 `.cmd` 또는 `.bat` 확장자를 붙여 실행합니다.

```powershell
.\gradlew.bat bootRun
npm.cmd run dev
```

## 프론트 실행

### Git Bash 추천 방식

```bash
cd "/c/Users/User/Documents/Prj 1/book_backend/front"
npm install
npm run dev
```

주의: npm 명령은 반드시 `front` 폴더 안에서 실행합니다. repo 루트에서 `npm install`을 실행하면 불필요한 `package-lock.json`이 생길 수 있습니다.

### CMD 또는 PowerShell

```powershell
cd "C:\Users\User\Documents\Prj 1\book_backend\front"
npm.cmd install
npm.cmd run dev
```

실행 후 브라우저에서 `http://localhost:5173`으로 접속합니다.

## Google OAuth 설정

`bookserver/.env` 파일에 아래 값을 넣습니다. 실제 값은 Git에 올리지 않습니다.

```properties
GOOGLE_CLIENT_ID=구글_클라이언트_ID
GOOGLE_CLIENT_SECRET=구글_클라이언트_SECRET
OPENAI_API_KEY=OpenAI_API_KEY
```

`application.yaml`에서 `.env`를 자동 import하므로 IntelliJ에서 값을 복사해서 붙여넣지 않아도 됩니다. 별도 Active profiles 설정도 필요 없습니다.

`GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`이 모두 있으면 Google OAuth 로그인이 활성화됩니다.

`OPENAI_API_KEY`는 AI 표지 생성 API에서 서버가 사용합니다. 프론트 화면에는 API Key 입력칸이 없고, 브라우저에 키가 노출되지 않습니다.

Google Cloud Console 승인된 리디렉션 URI는 아래 주소를 등록합니다.

```text
http://localhost:8080/login/oauth2/code/google
```

로그인 시작 주소:

```text
http://localhost:8080/oauth2/authorization/google
```

프론트에서는 로그인 버튼이 `/oauth2/authorization/google`로 이동하고, Vite proxy가 백엔드로 넘깁니다.

## H2 DB 확인

백엔드를 실행한 뒤 접속합니다.

```text
http://localhost:8080/h2-console
```

입력값:

```text
JDBC URL: jdbc:h2:mem:testdb
User Name: sa
Password: 비워두기
```

주의: 현재 DB는 메모리 H2라서 백엔드 서버를 재시작하면 데이터가 초기화됩니다.

## H2에서 자주 쓰는 SQL

전체 책 조회:

```sql
SELECT * FROM BOOK;
```

책 장르 조회:

```sql
SELECT * FROM BOOK_GENRES;
```

Google 로그인 멤버 조회:

```sql
SELECT * FROM MEMBER;
```

저자 신청 내역 조회:

```sql
SELECT * FROM AUTHOR_REQUEST;
```

책과 장르를 같이 보기:

```sql
SELECT
    B.ID,
    B.TITLE,
    B.AUTHOR,
    G.GENRE,
    B.VIEWS,
    B.LIKES_COUNT,
    B.CREATED_AT
FROM BOOK B
LEFT JOIN BOOK_GENRES G ON B.ID = G.BOOK_ID
ORDER BY B.ID DESC;
```

더미 책 1개 넣기:

```sql
INSERT INTO BOOK (
    TITLE,
    AUTHOR,
    CONTENT,
    COVER_IMAGE_URL,
    VIEWS,
    LIKES_COUNT,
    CREATED_AT,
    UPDATED_AT
) VALUES (
    '달빛 도서관의 비밀',
    '한지우',
    '밤마다 책장이 스스로 움직이는 도서관에서 펼쳐지는 미스터리 판타지.',
    NULL,
    0,
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

방금 넣은 책 ID 확인:

```sql
SELECT ID, TITLE FROM BOOK ORDER BY ID DESC;
```

장르 넣기:

```sql
INSERT INTO BOOK_GENRES (BOOK_ID, GENRE) VALUES (1, '판타지');
INSERT INTO BOOK_GENRES (BOOK_ID, GENRE) VALUES (1, '미스터리');
```

위 SQL의 `BOOK_ID`는 실제 책 ID에 맞게 바꿉니다.

로그인 멤버를 저자 권한으로 바꾸기:

```sql
UPDATE MEMBER
SET ROLE = 'AUTHOR'
WHERE EMAIL = '본인_구글_이메일@gmail.com';
```

## API 확인 예시

책 목록:

```bash
curl http://localhost:8080/api/books
```

책 등록:

```bash
curl -X POST http://localhost:8080/api/books \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"달빛 도서관의 비밀\",\"author\":\"한지우\",\"genre\":[\"판타지\"],\"content\":\"밤마다 책장이 움직이는 도서관 이야기\"}"
```

현재 로그인 멤버:

```bash
curl http://localhost:8080/api/members/me
```

비로그인 상태에서는 `401` 또는 빈 로그인 상태로 보일 수 있습니다.

## Git에 올리지 않는 파일

아래 파일/폴더는 로컬 실행 산출물이므로 Git에서 제외합니다.

```text
bookserver/.env
bookserver/.gradle/
bookserver/build/
bookserver/bin/
front/node_modules/
front/dist/
*.log
```

## 시연 전 체크리스트

1. 백엔드 `8080` 실행 확인
2. 프론트 `5173` 실행 확인
3. H2 Console 접속 확인
4. `BOOK`, `BOOK_GENRES`, `MEMBER` 테이블 확인
5. Google 로그인 버튼 클릭 후 계정 선택 화면 진입 확인
6. 로그인 후 `MEMBER` 테이블에 사용자 저장 확인
