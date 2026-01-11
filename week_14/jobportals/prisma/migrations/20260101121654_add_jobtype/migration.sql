-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobVacancy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "salary" TEXT,
    "jobType" TEXT NOT NULL DEFAULT 'FULLTIME',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobVacancy_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_JobVacancy" ("company", "createdAt", "createdBy", "description", "id", "location", "requirements", "salary", "status", "title", "updatedAt") SELECT "company", "createdAt", "createdBy", "description", "id", "location", "requirements", "salary", "status", "title", "updatedAt" FROM "JobVacancy";
DROP TABLE "JobVacancy";
ALTER TABLE "new_JobVacancy" RENAME TO "JobVacancy";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
