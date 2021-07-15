-- CreateTable
CREATE TABLE "captions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "captions.url_unique" ON "captions"("url");
