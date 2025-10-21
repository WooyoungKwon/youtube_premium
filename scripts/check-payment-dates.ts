import { Pool } from 'pg';

// Supabase connection
const connectionString = (process.env.YOUTUBE_DB_POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '')
  .replace('&&', '&')
  .replace('sslmode=require', '');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// 명단 데이터
const membersList = [
  { date: '21일', name: '정기석' },
  { date: '21일', name: '김호준' },
  { date: '21일', name: '조재민' },
  { date: '21일', name: '김성철' },
  { date: '21일', name: '지은열' },
  { date: '21일', name: '김지민' },
  { date: '24일', name: '지현민' },
  { date: '21일', name: '정유진' },
  { date: '23일', name: '김상언' },
  { date: '16일', name: '김준영' },
  { date: '23일', name: '장진수' },
  { date: '26일', name: '최호세' },
  { date: '2일', name: '김병수' },
  { date: '2일', name: '주상희' },
  { date: '2일', name: '우용호' },
  { date: '3일', name: '정종국' },
  { date: '2일', name: '이하연' },
  { date: '24일', name: '전방실' },
  { date: '24일', name: '박진우' },
  { date: '24일', name: '선현수' },
  { date: '24일', name: '백지수' },
  { date: '24일', name: '김명준' },
  { date: '25일', name: '조성민' },
  { date: '25일', name: '한지혜' },
  { date: '25일', name: '오수민' },
  { date: '25일', name: '김지민' },
  { date: '26일', name: '이규현' },
  { date: '27일', name: '김보영' },
  { date: '27일', name: '이지겸' },
  { date: '27일', name: '이인수' },
  { date: '28일', name: '이정호' },
  { date: '28일', name: '정윤재' },
  { date: '29일', name: '정예진' },
  { date: '30일', name: '이건용' },
  { date: '30일', name: '송진우' },
  { date: '30일', name: '당근 토리대디' },
  { date: '1일', name: '김두용' },
  { date: '1일', name: '김기형' },
  { date: '1일', name: '이동춘' },
  { date: '2일', name: '방유빈' },
  { date: '2일', name: '신동현' },
  { date: '2일', name: '김영민' },
  { date: '2일', name: '박종현' },
  { date: '2일', name: '최유민' },
  { date: '2일', name: '이민영' },
  { date: '2일', name: '김채연' },
  { date: '3일', name: '안명호' },
];

async function checkPaymentDates() {
  try {
    console.log('회원 결제일 확인 중...\n');

    const results: any[] = [];

    for (const member of membersList) {
      const { rows } = await pool.query(`
        SELECT
          name,
          email,
          TO_CHAR(payment_date, 'YYYY-MM-DD') as payment_date,
          EXTRACT(DAY FROM payment_date) as day
        FROM members
        WHERE name = $1
      `, [member.name]);

      const expectedDay = parseInt(member.date.replace('일', ''));

      if (rows.length === 0) {
        results.push({
          name: member.name,
          status: '❌ 미등록',
          expected: `${expectedDay}일`,
          actual: '-',
          match: false
        });
      } else {
        // 여러 개가 있을 경우 모두 표시
        const allMatches = rows.map(row => ({
          day: parseInt(row.day),
          date: row.payment_date,
          email: row.email
        }));

        // 예상 날짜와 일치하는 것이 있는지 확인
        const hasMatch = allMatches.some(m => m.day === expectedDay);

        if (hasMatch) {
          const matched = allMatches.find(m => m.day === expectedDay)!;
          results.push({
            name: member.name,
            status: '✅ 일치',
            expected: `${expectedDay}일`,
            actual: `${matched.day}일 (${matched.date})`,
            email: matched.email,
            match: true,
            count: rows.length
          });
        } else {
          // 일치하는 것이 없으면 모두 표시
          results.push({
            name: member.name,
            status: '⚠️ 불일치',
            expected: `${expectedDay}일`,
            actual: allMatches.map(m => `${m.day}일 (${m.date})`).join(', '),
            email: allMatches.map(m => m.email).join(', '),
            match: false,
            count: rows.length
          });
        }
      }
    }

    // 결과 출력
    console.log('='.repeat(80));
    console.log('결제일 확인 결과');
    console.log('='.repeat(80));
    console.log(`총 ${membersList.length}명 중:`);
    console.log(`  ✅ 일치: ${results.filter(r => r.match).length}명`);
    console.log(`  ⚠️ 불일치: ${results.filter(r => !r.match && r.status.includes('불일치')).length}명`);
    console.log(`  ❌ 미등록: ${results.filter(r => !r.match && r.status.includes('미등록')).length}명`);
    console.log('='.repeat(80));
    console.log('');

    // 불일치 및 미등록 회원 출력
    const issues = results.filter(r => !r.match);
    if (issues.length > 0) {
      console.log('⚠️ 확인 필요:');
      console.log('-'.repeat(80));
      issues.forEach(issue => {
        console.log(`${issue.status} ${issue.name}`);
        console.log(`  예상: ${issue.expected} | 실제: ${issue.actual}`);
        if (issue.email) {
          console.log(`  이메일: ${issue.email}`);
        }
        console.log('');
      });
    }

    // 일치하는 회원 (간단하게)
    console.log('✅ 일치하는 회원:');
    console.log('-'.repeat(80));
    results.filter(r => r.match).forEach(result => {
      console.log(`${result.name} - ${result.actual}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPaymentDates();
