-- CreateTable
CREATE TABLE "ProductBid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT,
    "customerId" TEXT,
    "customerName" TEXT,
    "productId" TEXT,
    "productTitle" TEXT,
    "productPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
