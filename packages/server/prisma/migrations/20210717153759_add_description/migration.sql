-- CreateTable
CREATE TABLE "descriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "descriptions.url_unique" ON "descriptions"("url");
