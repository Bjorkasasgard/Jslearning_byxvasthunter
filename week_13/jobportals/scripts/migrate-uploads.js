// Migrates legacy application uploads to the new local folder structure.
// - cover letter PDFs: /uploads/applications/*  -> /uploads/application_letters/*
// - resume overrides:  /uploads/applications/*  -> /uploads/resumes/*
// Also updates Prisma DB fields:
// - Application.coverLetter (legacy pdf path) -> Application.coverLetterFile
// - Application.resumeLink (legacy in /uploads/applications) -> /uploads/resumes
//
// Usage:
//   node scripts/migrate-uploads.js
//
// Notes:
// - This script is idempotent: re-running won't break if files already moved.

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/client');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function isPdfPath(p) {
  return typeof p === 'string' && p.toLowerCase().endsWith('.pdf');
}

function isLegacyApplicationsPath(p) {
  return typeof p === 'string' && p.startsWith('/uploads/applications/');
}

function safeMoveFile(src, dest) {
  if (!fs.existsSync(src)) return { moved: false, reason: 'missing' };
  ensureDir(path.dirname(dest));

  if (fs.existsSync(dest)) {
    return { moved: false, reason: 'already-exists' };
  }

  try {
    fs.renameSync(src, dest);
    return { moved: true, reason: 'renamed' };
  } catch (e) {
    // Cross-device rename or permission issue; fallback to copy+unlink.
    try {
      fs.copyFileSync(src, dest);
      fs.unlinkSync(src);
      return { moved: true, reason: 'copied' };
    } catch (e2) {
      return { moved: false, reason: `failed: ${e2.message}` };
    }
  }
}

function listFilesIfExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath)
      .map((name) => ({ name, fullPath: path.join(dirPath, name) }))
      .filter((x) => {
        try {
          return fs.statSync(x.fullPath).isFile();
        } catch (_) {
          return false;
        }
      });
  } catch (_) {
    return [];
  }
}

(async function main() {
  const root = path.join(__dirname, '..');

  // New canonical storage location (outside public/)
  const uploadsRoot = path.join(root, 'storage', 'uploads');

  // Older canonical location (inside public/) that we now migrate FROM.
  const oldPublicUploadsRoot = path.join(root, 'public', 'uploads');
  const legacyUploadsRoot = path.join(root, 'routes', 'public', 'uploads');

  // Some older runs accidentally wrote files to the parent `week_13/public/uploads` folder
  // (outside `jobportals`). Include it as an additional source location.
  const parentWeekUploadsRoot = path.join(root, '..', 'public', 'uploads');

  const legacyApplicationsPublic = path.join(oldPublicUploadsRoot, 'applications');
  const legacyApplicationsRoutes = path.join(legacyUploadsRoot, 'applications');
  const legacyApplicationsParentWeek = path.join(parentWeekUploadsRoot, 'applications');

  // Some older runs wrote directly into the parent week folder structure.
  const parentWeekResumesDir = path.join(parentWeekUploadsRoot, 'resumes');
  const parentWeekCoverLettersDir = path.join(parentWeekUploadsRoot, 'application_letters');

  const coverTargetDir = path.join(uploadsRoot, 'application_letters');
  const resumeTargetDir = path.join(uploadsRoot, 'resumes');

  ensureDir(uploadsRoot);
  ensureDir(coverTargetDir);
  ensureDir(resumeTargetDir);

  console.log('[migrate-uploads] root:', root);
  console.log('[migrate-uploads] uploadsRoot:', uploadsRoot);

  let updatedRows = 0;
  let movedFiles = 0;
  let missingFiles = 0;
  let normalizedLooseFiles = 0;

  try {
    // Find applications with legacy paths.
    const apps = await prisma.application.findMany({
      where: {
        OR: [
          { coverLetter: { contains: '/uploads/applications/' } },
          { coverLetterFile: { contains: '/uploads/applications/' } },
          { resumeLink: { contains: '/uploads/applications/' } },
        ],
      },
      select: {
        id: true,
        coverLetter: true,
        coverLetterFile: true,
        resumeLink: true,
      },
    });

    console.log(`[migrate-uploads] found ${apps.length} application(s) with legacy paths`);

    for (const app of apps) {
      const updates = {};

      // 1) Cover letter PDF migration
      const legacyCoverCandidate =
        isLegacyApplicationsPath(app.coverLetterFile) ? app.coverLetterFile :
        (isLegacyApplicationsPath(app.coverLetter) && isPdfPath(app.coverLetter) ? app.coverLetter : null);

      if (legacyCoverCandidate) {
        const filename = legacyCoverCandidate.replace('/uploads/applications/', '');
        const newUrl = `/uploads/application_letters/${filename}`;

        // If the user already moved the file manually to the new location, just update DB.
        const srcCandidates = [
          path.join(legacyApplicationsPublic, filename),
          path.join(legacyApplicationsRoutes, filename),
          path.join(legacyApplicationsParentWeek, filename),
        ];
        const dest = path.join(coverTargetDir, filename);

        if (fs.existsSync(dest)) {
          updates.coverLetterFile = newUrl;
          if (app.coverLetter === legacyCoverCandidate) updates.coverLetter = null;
        } else {

          let moved = false;
          let moveResult = { moved: false, reason: 'missing' };
          for (const src of srcCandidates) {
            moveResult = safeMoveFile(src, dest);
            if (moveResult.moved || moveResult.reason === 'already-exists') {
              moved = true;
              break;
            }
          }

          if (moved) {
            if (moveResult.moved) movedFiles += 1;
            updates.coverLetterFile = newUrl;
            // If coverLetter was just a PDF path, clear it (new system uses coverLetter for rich text HTML).
            if (app.coverLetter === legacyCoverCandidate) updates.coverLetter = null;
          } else {
            missingFiles += 1;
            console.warn(`[migrate-uploads] missing cover letter file for app=${app.id}: ${legacyCoverCandidate}`);
          }
        }
      }

      // 2) Resume override migration (only if stored in legacy applications folder)
      if (isLegacyApplicationsPath(app.resumeLink)) {
        const filename = app.resumeLink.replace('/uploads/applications/', '');
        const newUrl = `/uploads/resumes/${filename}`;

        const srcCandidates = [
          path.join(legacyApplicationsPublic, filename),
          path.join(legacyApplicationsRoutes, filename),
          path.join(legacyApplicationsParentWeek, filename),
        ];
        const dest = path.join(resumeTargetDir, filename);

        if (fs.existsSync(dest)) {
          updates.resumeLink = newUrl;
        } else {

          let moved = false;
          let moveResult = { moved: false, reason: 'missing' };
          for (const src of srcCandidates) {
            moveResult = safeMoveFile(src, dest);
            if (moveResult.moved || moveResult.reason === 'already-exists') {
              moved = true;
              break;
            }
          }

          if (moved) {
            if (moveResult.moved) movedFiles += 1;
            updates.resumeLink = newUrl;
          } else {
            missingFiles += 1;
            console.warn(`[migrate-uploads] missing resume override file for app=${app.id}: ${app.resumeLink}`);
          }
        }
      }

      if (Object.keys(updates).length) {
        await prisma.application.update({ where: { id: app.id }, data: updates });
        updatedRows += 1;
      }
    }

    // 3) Normalize any remaining loose files in legacy folders.
    // This covers cases where the file exists on disk but DB no longer references legacy URLs
    // (e.g. user manually moved files, or older experiments created orphan files).
    const legacyLoose = [
      ...listFilesIfExists(legacyApplicationsPublic),
      ...listFilesIfExists(legacyApplicationsParentWeek),
      ...listFilesIfExists(legacyApplicationsRoutes),
    ];

    if (legacyLoose.length) {
      console.log(`[migrate-uploads] normalizing ${legacyLoose.length} loose file(s) from legacy applications folders`);
    }

    for (const f of legacyLoose) {
      const filename = f.name;
      // Decide destination based on DB filename usage.
      const referencedAsResume = await prisma.application.findFirst({
        where: {
          resumeLink: { contains: filename },
        },
        select: { id: true },
      });

      const destDir = referencedAsResume ? resumeTargetDir : coverTargetDir;
      const dest = path.join(destDir, filename);
      if (fs.existsSync(dest)) {
        // Already normalized (maybe user moved manually). Remove legacy duplicate if present.
        try {
          fs.unlinkSync(f.fullPath);
        } catch (_) {}
        continue;
      }

      const r = safeMoveFile(f.fullPath, dest);
      if (r.moved) {
        movedFiles += 1;
        normalizedLooseFiles += 1;
      }
    }

    // 4) Normalize files that were saved into the parent week uploads folders.
    // These are already in the *new* subfolder names, but in the wrong root.
    const parentWeekLoose = [
      ...listFilesIfExists(parentWeekResumesDir).map((x) => ({ ...x, kind: 'resume' })),
      ...listFilesIfExists(parentWeekCoverLettersDir).map((x) => ({ ...x, kind: 'cover' })),
    ];

    if (parentWeekLoose.length) {
      console.log(`[migrate-uploads] normalizing ${parentWeekLoose.length} file(s) from parent week uploads folders`);
    }

    for (const f of parentWeekLoose) {
      const destDir = f.kind === 'resume' ? resumeTargetDir : coverTargetDir;
      const dest = path.join(destDir, f.name);
      if (fs.existsSync(dest)) {
        // Already normalized; remove duplicate if present.
        try {
          fs.unlinkSync(f.fullPath);
        } catch (_) {}
        continue;
      }

      const r = safeMoveFile(f.fullPath, dest);
      if (r.moved) {
        movedFiles += 1;
        normalizedLooseFiles += 1;
      }
    }

    // 5) Normalize files that exist in the old public/uploads structure into storage/uploads.
    const oldPublicLoose = [
      ...listFilesIfExists(path.join(oldPublicUploadsRoot, 'resumes')).map((x) => ({ ...x, kind: 'resume' })),
      ...listFilesIfExists(path.join(oldPublicUploadsRoot, 'application_letters')).map((x) => ({ ...x, kind: 'cover' })),
      ...listFilesIfExists(path.join(oldPublicUploadsRoot, 'applications')).map((x) => ({ ...x, kind: 'unknown' })),
    ];

    if (oldPublicLoose.length) {
      console.log(`[migrate-uploads] normalizing ${oldPublicLoose.length} file(s) from old public/uploads folders`);
    }

    for (const f of oldPublicLoose) {
      const destDir = f.kind === 'resume' ? resumeTargetDir : coverTargetDir;
      const dest = path.join(destDir, f.name);
      if (fs.existsSync(dest)) {
        try {
          fs.unlinkSync(f.fullPath);
        } catch (_) {}
        continue;
      }

      const r = safeMoveFile(f.fullPath, dest);
      if (r.moved) {
        movedFiles += 1;
        normalizedLooseFiles += 1;
      }
    }

    console.log('[migrate-uploads] done');
    console.log(`[migrate-uploads] updatedRows=${updatedRows} movedFiles=${movedFiles} missingFiles=${missingFiles} normalizedLooseFiles=${normalizedLooseFiles}`);
  } catch (e) {
    console.error('[migrate-uploads] failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
