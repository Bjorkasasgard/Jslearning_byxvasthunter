-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "jobVacancyId" INTEGER NOT NULL,
    "coverLetter" TEXT,
    "answers" JSONB,
    "resumeLink" TEXT,
    "notificationRead" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Application_jobVacancyId_fkey" FOREIGN KEY ("jobVacancyId") REFERENCES "JobVacancy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Application" ("answers", "coverLetter", "createdAt", "id", "jobVacancyId", "resumeLink", "status", "updatedAt", "userId") SELECT "answers", "coverLetter", "createdAt", "id", "jobVacancyId", "resumeLink", "status", "updatedAt", "userId" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
CREATE UNIQUE INDEX "Application_userId_jobVacancyId_key" ON "Application"("userId", "jobVacancyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
