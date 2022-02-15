-- CreateTable
CREATE TABLE "category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "pid" INTEGER
);

-- CreateTable
CREATE TABLE "goods" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cid" INTEGER,
    "type" TEXT,
    "brand" TEXT,
    "unit" TEXT,
    "color" TEXT,
    "standard" TEXT,
    "material" TEXT,
    "buyPrice" REAL,
    "salePrice" REAL,
    "descs" TEXT,
    "updater" TEXT,
    "updatime" DATETIME,
    "state" INTEGER NOT NULL DEFAULT 1,
    "picture" TEXT,
    CONSTRAINT "goods_cid_fkey" FOREIGN KEY ("cid") REFERENCES "category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "supplierId" INTEGER,
    "code" TEXT,
    "payPrice" REAL,
    "totalPrice" REAL,
    "userId" INTEGER,
    "descs" TEXT NOT NULL,
    "date" DATETIME,
    CONSTRAINT "purchase_order_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "purchase_supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_order_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "repoId" INTEGER NOT NULL,
    "goodsId" INTEGER,
    "amount" INTEGER,
    "price" REAL,
    "totalPrice" REAL,
    CONSTRAINT "purchase_order_item_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "goods" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "purchase_order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_item_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "linkman" TEXT NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "descs" TEXT,
    "state" INTEGER NOT NULL DEFAULT 1,
    "updater" TEXT,
    "updatime" DATETIME
);

-- CreateTable
CREATE TABLE "repo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "descs" TEXT,
    "adminId" INTEGER,
    "updater" TEXT,
    "updatime" DATETIME,
    "state" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "sale_customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "linkman" TEXT NOT NULL,
    "mobile" TEXT,
    "address" TEXT,
    "descs" TEXT,
    "state" INTEGER NOT NULL DEFAULT 1,
    "updater" TEXT,
    "updatime" DATETIME
);

-- CreateTable
CREATE TABLE "sale_order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER,
    "code" TEXT,
    "payPrice" REAL,
    "totalPrice" REAL,
    "userId" INTEGER,
    "descs" TEXT NOT NULL,
    "date" DATETIME,
    "otherFee" REAL,
    "payOtherFee" REAL,
    CONSTRAINT "sale_order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "sale_customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sale_order_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "repoId" INTEGER NOT NULL,
    "goodsId" INTEGER,
    "amount" INTEGER,
    "price" REAL,
    "totalPrice" REAL,
    CONSTRAINT "sale_order_item_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "goods" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "sale_order_item_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sale_order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "sale_order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "goodsId" INTEGER NOT NULL,
    "repoId" INTEGER NOT NULL,
    "totalCount" INTEGER,
    "saleCount" INTEGER,
    "buyPrice" REAL,
    "avgBuyPrice" REAL,
    "salePrice" REAL,
    "totalBuyPrice" REAL,
    "totalSalePrice" REAL,
    "updatime" DATETIME,
    "state" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "stock_goodsId_fkey" FOREIGN KEY ("goodsId") REFERENCES "goods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "repo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "account" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER,
    "roleName" TEXT,
    "employeeId" INTEGER,
    "updater" TEXT,
    "updatime" DATETIME,
    "state" INTEGER NOT NULL DEFAULT 1,
    "isLocked" INTEGER DEFAULT 0,
    "lockTime" DATETIME
);
