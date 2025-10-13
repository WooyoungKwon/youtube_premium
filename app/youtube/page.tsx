import { getStats } from '@/lib/data';
import YoutubeHome from './YoutubeHome';

// 1분마다 페이지를 재생성하여 최신 상태를 유지 (ISR)
export const revalidate = 60;

export default async function YoutubePage() {
  // 서버에서 데이터 조회
  const initialStats = await getStats();

  // 클라이언트 컴포넌트에 초기 데이터 전달
  return <YoutubeHome initialStats={initialStats} />;
}
