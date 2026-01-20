-- CreateTable
CREATE TABLE "SliderConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "intervalMs" INTEGER NOT NULL DEFAULT 6500,
    "transition" TEXT NOT NULL DEFAULT 'fade',
    "textAnimation" TEXT NOT NULL DEFAULT 'fade-up',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SliderConfig_locale_key" ON "SliderConfig"("locale");

