# 책부침 프론트엔드

React와 Vite 기반 도서 관리 화면입니다. API 요청은 Vite 개발 서버의 `/api` 프록시를 통해 Spring Boot 백엔드로 전달됩니다.

## 실행

백엔드를 먼저 실행합니다.

```bash
cd ../bookserver
./gradlew.bat bootRun
```

프론트를 실행합니다.

```bash
npm install
npm run dev
```

접속 주소:

```text
http://localhost:5173
```

## API 연결

프론트 코드는 상대 경로를 사용합니다.

```text
/api/books
```

개발 중에는 Vite 프록시가 이 요청을 백엔드로 전달합니다.

```text
http://localhost:8080/api/books
```

데이터는 Spring Boot 백엔드와 H2 DB에서 관리합니다.

## 주요 명령어

```bash
npm run dev
npm run build
npm run lint
npm run preview
```
