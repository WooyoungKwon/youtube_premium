import { Pool } from 'pg';

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

async function updatePaymentDates() {
  try {
    console.log('결제일 업데이트 시작...\n');

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const member of membersList) {
      const expectedDay = parseInt(member.date.replace('일', ''));

      // 현재 회원의 payment_date 조회
      const { rows } = await pool.query(`
        SELECT
          id,
          name,
          email,
          payment_date,
          EXTRACT(DAY FROM payment_date) as current_day,
          EXTRACT(MONTH FROM payment_date) as current_month,
          EXTRACT(YEAR FROM payment_date) as current_year
        FROM members
        WHERE name = $1
      `, [member.name]);

      if (rows.length === 0) {
        console.log(`⏭️  건너뛰기: ${member.name} (미등록)`);
        skippedCount++;
        continue;
      }

      // 여러 명이 있을 경우 처리
      for (const row of rows) {
        const currentDay = parseInt(row.current_day);
        const currentMonth = parseInt(row.current_month);
        const currentYear = parseInt(row.current_year);

        if (currentDay === expectedDay) {
          console.log(`✅ 이미 일치: ${member.name} (${expectedDay}일) - ${row.email}`);
          skippedCount++;
          continue;
        }

        // 월과 연도는 유지하고 일만 변경
        const newDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(expectedDay).padStart(2, '0')}`;

        try {
          await pool.query(`
            UPDATE members
            SET payment_date = $1::date
            WHERE id = $2
          `, [newDate, row.id]);

          console.log(`🔄 업데이트: ${member.name} | ${currentDay}일 → ${expectedDay}일 (${newDate}) - ${row.email}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ 오류: ${member.name} - ${error}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('업데이트 완료');
    console.log('='.repeat(80));
    console.log(`✅ 업데이트: ${updatedCount}명`);
    console.log(`⏭️  건너뛰기: ${skippedCount}명`);
    console.log(`❌ 오류: ${errorCount}명`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updatePaymentDates();
