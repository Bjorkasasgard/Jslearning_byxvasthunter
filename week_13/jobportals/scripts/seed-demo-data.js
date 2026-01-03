// Seeds demo data: 3 admins, 10 members, 25 vacancies, optional sample applications.
// Password for all accounts: qwerty123
// Key logins: admin@gmail.com / qwerty123, user@gmail.com / qwerty123
// Usage: node scripts/seed-demo-data.js

require('dotenv').config();

const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

const PASSWORD = 'qwerty123';
const RESUME_PLACEHOLDER = '/uploads/resumes/demo.pdf';

const adminSeeds = [
  { email: 'admin@gmail.com', name: 'Admin Utama' },
  { email: 'admin2@gmail.com', name: 'Admin Kedua' },
  { email: 'admin3@gmail.com', name: 'Admin Ketiga' },
];

const memberSeeds = [
  { email: 'user@gmail.com', name: 'Member Utama' },
  { email: 'user2@gmail.com', name: 'Member 2' },
  { email: 'user3@gmail.com', name: 'Member 3' },
  { email: 'user4@gmail.com', name: 'Member 4' },
  { email: 'user5@gmail.com', name: 'Member 5' },
  { email: 'user6@gmail.com', name: 'Member 6' },
  { email: 'user7@gmail.com', name: 'Member 7' },
  { email: 'user8@gmail.com', name: 'Member 8' },
  { email: 'user9@gmail.com', name: 'Member 9' },
  { email: 'user10@gmail.com', name: 'Member 10' },
];

const vacancies = [
  { title: 'Frontend Engineer', company: 'PT Alpha Digital', location: 'Jakarta', description: 'Bangun UI modern untuk produk SaaS.', requirements: 'React, TypeScript, Tailwind.', salary: 'Rp 12-18jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Ceritakan pengalaman membangun UI kompleks.'] },
  { title: 'Backend Engineer', company: 'PT Alpha Digital', location: 'Remote', description: 'Microservices dan API performa tinggi.', requirements: 'Node.js, Express, PostgreSQL.', salary: 'Rp 13-20jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Pengalaman scaling API?'] },
  { title: 'Mobile Developer', company: 'PT Nusantara Apps', location: 'Bandung', description: 'Aplikasi Android/iOS produk lifestyle.', requirements: 'Flutter/React Native.', salary: 'Rp 10-16jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Pernah publish app production?'] },
  { title: 'Data Analyst', company: 'PT Insight Data', location: 'Jakarta', description: 'Analisis data bisnis & dashboarding.', requirements: 'SQL, Python, Tableau/Looker.', salary: 'Rp 9-14jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Contoh insight berdampak?'] },
  { title: 'DevOps Engineer', company: 'PT Cloud Karya', location: 'Remote', description: 'CI/CD, observability, infra-as-code.', requirements: 'Docker, Kubernetes, Terraform.', salary: 'Rp 15-23jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Pengalaman membuat pipeline end-to-end?'] },
  { title: 'QA Engineer', company: 'PT Quality First', location: 'Jakarta', description: 'Testing manual & otomatis.', requirements: 'Cypress/Playwright, test design.', salary: 'Rp 8-12jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Bagaimana strategi regression testing?'] },
  { title: 'UI/UX Designer', company: 'Studio Desain', location: 'Jakarta', description: 'Rancang pengalaman produk mobile/web.', requirements: 'Figma, design system.', salary: 'Rp 8-13jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Contoh design system yang pernah dibangun?'] },
  { title: 'Product Manager', company: 'PT Produk Kita', location: 'Jakarta', description: 'Lead squad produk B2C.', requirements: 'Discovery, delivery, analitik.', salary: 'Rp 18-28jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Bagaimana memprioritaskan backlog?'] },
  { title: 'Security Engineer', company: 'PT SecureNow', location: 'Remote', description: 'Hardening dan monitoring keamanan.', requirements: 'OWASP, SIEM, cloud security.', salary: 'Rp 17-26jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Pengalaman mitigasi incident?'] },
  { title: 'SRE', company: 'PT Reliabilitas', location: 'Remote', description: 'Reliability, SLO/SLI, incident response.', requirements: 'Linux, observability stack.', salary: 'Rp 18-27jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Contoh postmortem yang pernah dibuat?'] },
  { title: 'Fullstack Engineer', company: 'PT Alpha Digital', location: 'Jakarta', description: 'End-to-end fitur web.', requirements: 'React, Node.js, SQL.', salary: 'Rp 12-19jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Lebih suka front atau back? kenapa?'] },
  { title: 'Data Engineer', company: 'PT Insight Data', location: 'Remote', description: 'Pipeline data & warehouse.', requirements: 'Airflow, dbt, SQL.', salary: 'Rp 16-24jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Contoh pipeline yang pernah dibangun?'] },
  { title: 'Business Analyst', company: 'PT Produk Kita', location: 'Jakarta', description: 'Requirement gathering & BRD.', requirements: 'SQL basic, komunikasi.', salary: 'Rp 9-13jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Contoh dokumentasi yang kamu buat.'] },
  { title: 'Technical Writer', company: 'PT Alpha Digital', location: 'Remote', description: 'Dokumentasi API & produk.', requirements: 'Menulis jelas, paham API.', salary: 'Rp 8-12jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Link docs/portfolio?'] },
  { title: 'Machine Learning Engineer', company: 'PT Insight Data', location: 'Jakarta', description: 'Modeling dan deployment ML.', requirements: 'Python, ML, MLOps dasar.', salary: 'Rp 18-28jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Cerita model yang sukses di production.'] },
  { title: 'IT Support', company: 'PT Supportindo', location: 'Jakarta', description: 'Support internal tools & hardware.', requirements: 'Troubleshoot, komunikasi.', salary: 'Rp 6-9jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Pengalaman handle incident IT?'] },
  { title: 'Network Engineer', company: 'PT Netlink', location: 'Jakarta', description: 'Manage network & security.', requirements: 'Routing, firewall, monitoring.', salary: 'Rp 10-15jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Topologi jaringan terakhir yang kamu kelola?'] },
  { title: 'Solution Architect', company: 'PT Cloud Karya', location: 'Remote', description: 'Rancang arsitektur solusi cloud.', requirements: 'Cloud, design patterns.', salary: 'Rp 22-35jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Contoh arsitektur referensimu.'] },
  { title: 'Scrum Master', company: 'PT Produk Kita', location: 'Jakarta', description: 'Fasilitasi scrum squad.', requirements: 'Agile, komunikasi.', salary: 'Rp 12-18jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Bagaimana menangani blocker tim?'] },
  { title: 'HR Tech Recruiter', company: 'PT Talentia', location: 'Jakarta', description: 'Hiring peran teknologi.', requirements: 'Sourcing, interview teknik.', salary: 'Rp 9-14jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Contoh pipeline hiring yang efektif.'] },
  { title: 'Finance Analyst', company: 'PT FinancePro', location: 'Jakarta', description: 'Analisis kinerja finansial.', requirements: 'Excel/Sheets, dasar akuntansi.', salary: 'Rp 9-13jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Pengalaman membuat forecast?'] },
  { title: 'Content Strategist', company: 'PT Alpha Digital', location: 'Remote', description: 'Konten B2C dan B2B.', requirements: 'Copywriting, SEO dasar.', salary: 'Rp 8-12jt', jobType: 'REMOTE', status: 'ACTIVE', questions: ['Bagikan contoh kampanye konten.'] },
  { title: 'Customer Success', company: 'PT Produk Kita', location: 'Jakarta', description: 'Kelola pelanggan enterprise.', requirements: 'Komunikasi, analitik dasar.', salary: 'Rp 9-14jt', jobType: 'HYBRID', status: 'ACTIVE', questions: ['Contoh churn-prevention yang pernah kamu lakukan.'] },
  { title: 'Field Sales', company: 'PT Salesku', location: 'Surabaya', description: 'Penjualan B2B lapangan.', requirements: 'Negosiasi, CRM.', salary: 'Rp 7-11jt + bonus', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Deal terbesar yang pernah kamu tutup?'] },
  { title: 'Marketing Analyst', company: 'PT Alpha Digital', location: 'Jakarta', description: 'Analitik performa campaign.', requirements: 'SQL/Sheets, atribusi.', salary: 'Rp 10-15jt', jobType: 'FULLTIME', status: 'ACTIVE', questions: ['Pengalaman membaca funnel marketing.'] },
];

async function upsertUser({ email, name, role, city = 'Jakarta', phone }) {
  const hashed = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, city, phone: phone || null, password: hashed },
    create: { email, name, role, city, phone: phone || null, password: hashed },
    select: { id: true, email: true, role: true, name: true },
  });
}

(async function main() {
  try {
    console.log('[seed-demo-data] seeding...');

    const admins = [];
    for (const a of adminSeeds) {
      admins.push(await upsertUser({ ...a, role: 'ADMIN', phone: '0812-0000-0000' }));
    }

    const members = [];
    for (const m of memberSeeds) {
      members.push(await upsertUser({ ...m, role: 'MEMBER', phone: '0813-0000-0000' }));
    }

    // Clear existing demo vacancies with same titles to keep idempotent.
    await prisma.jobVacancy.deleteMany({ where: { title: { in: vacancies.map(v => v.title) } } });

    const createdVacancies = [];
    for (let i = 0; i < vacancies.length; i++) {
      const admin = admins[i % admins.length];
      const payload = vacancies[i];
      const v = await prisma.jobVacancy.create({
        data: {
          ...payload,
          createdBy: admin.id,
        },
        select: { id: true, title: true, createdBy: true, status: true },
      });
      createdVacancies.push(v);
    }

    // Create a handful of sample applications so the UI has data.
    const sampleApps = [];
    const applicationCount = Math.min(12, createdVacancies.length);
    for (let i = 0; i < applicationCount; i++) {
      const member = members[i % members.length];
      const vacancy = createdVacancies[i];
      const app = await prisma.application.create({
        data: {
          userId: member.id,
          jobVacancyId: vacancy.id,
          coverLetter: `Halo, saya tertarik pada role ${vacancy.title}. Pengalaman saya relevan dan siap kontribusi.`,
          resumeLink: RESUME_PLACEHOLDER,
          answers: [
            `Alasan melamar: tertarik dengan ${vacancy.company}.`,
            'Siap mulai dalam 2 minggu.',
          ],
        },
        select: { id: true, userId: true, jobVacancyId: true, status: true },
      });
      sampleApps.push(app);
    }

    console.log('[seed-demo-data] done');
    console.log(
      JSON.stringify(
        {
          login:
            {
              admin: { email: 'admin@gmail.com', password: PASSWORD },
              member: { email: 'user@gmail.com', password: PASSWORD },
            },
          totals: {
            admins: admins.length,
            members: members.length,
            vacancies: createdVacancies.length,
            applications: sampleApps.length,
          },
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error('[seed-demo-data] failed:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
