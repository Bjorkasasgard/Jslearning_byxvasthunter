const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../app');

const uploadsRoot = path.join(__dirname, '..', '..', 'public', 'storage', 'uploads');
const resumeDir = path.join(uploadsRoot, 'resumes');
const appLettersDir = path.join(uploadsRoot, 'application_letters');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFileSync(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function cleanup(filePath) {
  try {
    fs.unlinkSync(filePath);
  } catch (_) {
    // ignore if missing
  }
}

describe('Uploads routes security & headers', () => {
  const pdfFile = path.join(resumeDir, 'integration.pdf');
  const docFile = path.join(resumeDir, 'integration.doc');
  const legacyDoc = path.join(appLettersDir, 'legacy.doc');

  beforeAll(() => {
    writeFileSync(pdfFile, '%PDF-1.4\n%EOF');
    writeFileSync(docFile, 'DOC');
    writeFileSync(legacyDoc, 'DOC');
  });

  afterAll(() => {
    cleanup(pdfFile);
    cleanup(docFile);
    cleanup(legacyDoc);
  });

  test('serves PDF resume inline with correct headers', async () => {
    const res = await request(app).get('/uploads/resumes/integration.pdf');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toMatch(/^inline/);
  });

  test('serves DOC resume as attachment', async () => {
    const res = await request(app).get('/uploads/resumes/integration.doc');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/msword');
    expect(res.headers['content-disposition']).toMatch(/^attachment/);
  });

  test('legacy applications route rejects non-PDF even if file exists', async () => {
    const res = await request(app).get('/uploads/applications/legacy.doc');
    expect(res.statusCode).toBe(404);
  });

  test('blocks encoded path traversal attempts', async () => {
    const res = await request(app).get('/uploads/resumes/..%2Fsecret.pdf');
    expect([400, 404]).toContain(res.statusCode);
  });
});