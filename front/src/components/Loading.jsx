import { Player } from "@lottiefiles/react-lottie-player";
import bookLoading from "@/assets/book-loading.json";

function Loading() {
  return (
    <div className="cover-loading">
      <Player autoplay loop src={bookLoading} className="lottie-book" />
      <p>AI 표지를 생성하고 있습니다</p>
      <span>잠시만 기다려주세요.</span>
    </div>
  );
}

export default Loading;
