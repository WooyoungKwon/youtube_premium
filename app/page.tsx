import { getStats } from '@/lib/data';
import HomeClient from '@/app/components/HomeClient';

// 페이지를 동적으로 렌더링하도록 설정 (항상 최신 데이터 조회)
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 서버에서 데이터 조회
  const initialStats = await getStats();

  // 클라이언트 컴포넌트에 초기 데이터 전달
  return <HomeClient initialStats={initialStats} />;
}