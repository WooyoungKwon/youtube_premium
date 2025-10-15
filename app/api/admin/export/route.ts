import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/storage';
import { MemberRequest } from '@/types';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const { requests } = await getAllRequests();

    // Excel 데이터 형식으로 변환
    const excelData = requests.map((req: MemberRequest) => ({
      'ID': req.id,
      '이메일': req.email,
      '카카오톡 ID': req.kakaoId || '-',
      '전화번호': req.phone || '-',
      '상태': req.status === 'pending' ? '대기중' : 
             req.status === 'approved' ? '승인됨' : '거절됨',
      '신청일시': new Date(req.createdAt).toLocaleString('ko-KR'),
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 열 너비 자동 조정
    const colWidths = [
      { wch: 10 },  // ID
      { wch: 30 },  // 이메일
      { wch: 20 },  // 카카오톡 ID
      { wch: 15 },  // 전화번호
      { wch: 10 },  // 상태
      { wch: 20 },  // 신청일시
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, '신청목록');
    
    // Excel 파일을 버퍼로 변환
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // 현재 날짜로 파일명 생성
    const fileName = `youtube_premium_신청목록_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // 응답 헤더 설정
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    });
  } catch (error) {
    console.error('Excel export error:', error);
    return NextResponse.json(
      { error: 'Excel 파일 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
