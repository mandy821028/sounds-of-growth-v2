/*
  Warnings:

  - Added the required column `requestedDateUtc` to the `LessonCancellationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LessonCancellationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lessonId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "requestedDateUtc" DATETIME NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LessonCancellationRequest_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LessonCancellationRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LessonCancellationRequest" ("createdAt", "id", "lessonId", "reason", "status", "studentId", "updatedAt") SELECT "createdAt", "id", "lessonId", "reason", "status", "studentId", "updatedAt" FROM "LessonCancellationRequest";
DROP TABLE "LessonCancellationRequest";
ALTER TABLE "new_LessonCancellationRequest" RENAME TO "LessonCancellationRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
