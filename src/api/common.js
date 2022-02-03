import httpFetch from '@/utils/https'
import {prisma} from "@/db";
import {omit} from "lodash";
import mathJs from '@/utils/math'
/** 添加产品 */
export const addGoods = async (data = {}) => {
    // return httpFetch.post('customer/add', data)
    const res = await prisma.base_goods.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 修改产品 */
export const updateGoods  = async (data = {}) => {
    // return httpFetch.post('customer/update', data)
    const res = await prisma.base_goods.update({
        where: {id: data.id},
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 删除产品 */
export const removeGoods  = async (data = {}) => {
    // return httpFetch.post('customer/delete', data)
    const res = await prisma.base_goods.delete({
        where: {id: data.id},
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 客户产品 */
export const goodsList = async (data = {}) => {
    const {pageSize, pageNo,id, cid, name, code} = data
    let where = {}
    if (id) {
        where.id = id
    }
    if (cid) {
        where.cid = cid
    }
    if (name) {
        where.name = {
            contains: name
        }
    }
    if (code) {
        where.code = {
            contains: code
        }
    }
    const [total,records] = await prisma.$transaction([
        prisma.base_goods.count({where}),
        prisma.base_goods.findMany({
            skip: pageSize* (pageNo-1),
            take: pageSize,
            where
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}
export const goodsListV2 = async (data = {}) => {
    const {pageSize, pageNo,id, repoId, name, code} = data
    let where = {}
    if (id) {
        where.id = id
    }
    if (repoId) {
        where.repoId = repoId
    }
    if (name) {
        where.name = {
            contains: name
        }
    }
    if (code) {
        where.code = {
            contains: code
        }
    }
    const [total,records] = await prisma.$transaction([
        prisma.stock.count({where}),
        prisma.stock.findMany({
            skip: pageSize* (pageNo-1),
            take: pageSize,
            where,
            select: {
                goods: true
            },
        })
    ])
    return {
        code: 200,
        message: {
            records: records.map(_ => _.goods),
            total
        }
    }
}
/** 注册分类 */
export const addCategory = async (data = {}) => {
    // return httpFetch.post('category/addCategory', data)
    const res = await prisma.category.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 获取分类列表树 */
export const getCategoryTree = async (data = {}) => {
    // return httpFetch.post('category/getCategoriesTree', data)
    const list = await prisma.category.findMany({
        where: {pid: null},
    })
    async function iter(arr) {
        for (let i = 0; i < arr.length; i++) {
            const _ = arr[i]
            _.children = await prisma.category.findMany({
                where: {pid: _.id},
            })
            await iter(_.children)
        }
    }
    await iter(list)
    return {
        code: 200,
        message: list
    }

}

/** 修改类别*/
export const updateCategory = async (data = {}) => {
    // return httpFetch.post('category/update', data)
    const res = await prisma.category.update({
        where: {id: data.id},
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 删除类别*/
export const deleteCategory = async id => {
    // return httpFetch.post('category/deleteCategory?id=' + id)

    const list = await prisma.category.findMany({
        where: {id},
    })
    let count = 0
    const n = await prisma.base_goods.count({where: {cid: id}})
    count = count + n
    async function iter(arr) {
        for (let i = 0; i < arr.length; i++) {
            const _ = arr[i]
            const n = await prisma.base_goods.count({where: {cid: _.id}})
            count = count + n
            _.children = await prisma.category.findMany({
                where: {pid: _.id},
            })
            await iter(_.children)
        }
    }
    await iter(list)
    if (count) {
        return {
            code: 500,
            message: '分类下还有产品，请先删除产品'
        }
    }
    const res = await prisma.category.delete({
        where: {id},
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 新增批次 */
export const addSpecie = (data = {}) => {
    return httpFetch.post('specie/add', data)
}

/** 批量新增批次*/
export const addSpecieList = (data = {}) => {
    return httpFetch.post('specie/addList', data)
}

/** 更新批次*/
export const updateSpecie = (data = {}) => {
    return httpFetch.post('specie/update', data)
}

/** 批次列表*/
export const getSpecieList = (data = {}) => {
    return httpFetch.post('specie/list', data)
}
/** 根据产品id获取对应批次*/
export const getListByCategoryId = (data = {}) => {
    return httpFetch.post('specie/listByCategoryId', data)
}



/** 添加客户 */
export const addCustomer = async (data = {}) => {
    // return httpFetch.post('customer/add', data)
    const res = await prisma.sale_customer.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 修改客户 */
export const updateCustomer = async (data = {}) => {
    // return httpFetch.post('customer/update', data)
    const res = await prisma.sale_customer.update({
        where: {id: data.id},
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 删除客户 */
export const removeCustomer = async (data = {}) => {
    // return httpFetch.post('customer/delete', data)
    const res = await prisma.sale_customer.delete({
        where: {id: data.id},
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 客户列表 */
export const customerList = async (data = {}) => {
    // return httpFetch.post('customer/list', data)
    const {pageSize, pageNo, name, mobile} = data
    let where = {}
    if (name) {
        where.name = {
            contains: name
        }
    }
    if (mobile) {
        where.mobile = {
            contains: mobile
        }
    }
    const [total,records] = await prisma.$transaction([
         prisma.sale_customer.count({where}),
         prisma.sale_customer.findMany({
            skip: pageSize* (pageNo-1),
            take: pageSize,
            where
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}

/** 添加仓库 */
export const addRepo = async (data = {}) => {
    // return httpFetch.post('repo/add', data)
    const res = await prisma.base_repo.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 更新仓库 */
export const updateRepo = async (data = {}) => {
    // return httpFetch.post('repo/update', data)
    const res = await prisma.base_repo.update({
        where: {id: data.id},
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 仓库列表 */
export const getRepoList = async (data = {}) => {
    // return httpFetch.post('repo/list', data)
    const {id,name} = data
    let where = {}
    if (id) {
        where.id = id
    }
    if (name) {
        where.name = {
            contains: name
        }
    }
    const [total, records] = await prisma.$transaction([
        prisma.base_repo.count({where}),
        prisma.base_repo.findMany({
            where,
            orderBy: {
                updatime: 'desc',
            },
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}
export const getRepoListV2 = async (data = {}) => {
    // return httpFetch.post('repo/list', data)
    const {id,name, goodsId} = data
    let where = {}
    if (id) {
        where.id = id
    }
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (name) {
        where.name = {
            contains: name
        }
    }
    const [total, records] = await prisma.$transaction([
        prisma.stock.count({where}),
        prisma.stock.findMany({
            select: {
                repo: true
            },
            where
        })
    ])
    return {
        code: 200,
        message: {
            records: records.map(_ => _.repo),
            total
        }
    }
}

/** 删除仓库 */
export const deleteRepo = async id => {
    // return httpFetch.post('repo/delete?id=' + id)
    const res = await prisma.base_repo.delete({
        where: {id},
    })
    return {
        code: 200,
        message: '成功'
    }
}


/** 添加供应商 */
export const addSupplier = async (data = {}) => {
    // return httpFetch.post('supplier/add', data)
    const res = await prisma.purchase_supplier.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 更新供应商*/
export const updateSupplier = async (data = {}) => {
    // return httpFetch.post('supplier/update', data)
    const res = await prisma.purchase_supplier.update({
        where: {id: data.id},
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/**供应商列表 */
export const getSupplierList = async (data = {}) => {
    // return httpFetch.post('supplier/list', data)
    const {pageSize, pageNo, name, mobile} = data
    let where = {}
    if (name) {
        where.name = {
            contains: name
        }
    }
    if (mobile) {
        where.mobile = {
            contains: mobile
        }
    }
    const [total, records] = await prisma.$transaction([
        prisma.purchase_supplier.count({where}),
        prisma.purchase_supplier.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}
/** 删除供应商*/
export const deleteSupplier = async id => {
    // return httpFetch.post('supplier/delete?id=' + id)
    const res = await prisma.purchase_supplier.delete({
        where: {id},
    })
    return {
        code: 200,
        message: '成功'
    }
}
// 添加库存
const grnUpdateStock = async (_) => {
    const stock = await prisma.stock.findFirst({
        where: {
            goodsId: _.goodsId,
            repoId: _.repoId
        }
    })
    if (stock) {
        console.log(mathJs.divide(stock.totalBuyPrice + _.totalPrice,stock.totalCount + _.amount))
        await prisma.stock.update({
            where: {
                id: stock.id
            },
            data: {
                totalCount: stock.totalCount + _.amount,
                buyPrice: _.price,
                avgBuyPrice: mathJs.divide(stock.totalBuyPrice + _.totalPrice,stock.totalCount + _.amount),
                totalBuyPrice: stock.totalBuyPrice + _.totalPrice
            }
        })
    } else {
        console.log(mathJs.divide( _.totalPrice, _.amount))
        await prisma.stock.create({
            data: {
                goodsId: _.goodsId,
                repoId: _.repoId,
                totalCount: _.amount,
                saleCount: 0,
                totalSalePrice: 0,
                buyPrice: _.price,
                avgBuyPrice: mathJs.divide( _.totalPrice, _.amount),
                totalBuyPrice: _.totalPrice
            }
        })
    }
}
const outboundUpdateStock = async (_) => {
    const stock = await prisma.stock.findFirst({
        where: {
            goodsId: _.goodsId,
            repoId: _.repoId
        }
    })
    if (stock) {
        await prisma.stock.update({
            where: {
                id: stock.id
            },
            data: {
                totalCount: stock.totalCount - _.amount,
                saleCount: stock.saleCount + _.amount,
                salePrice:  _.price,
                totalSalePrice: stock.totalSalePrice + _.totalPrice
            }
        })
    }
}
// 减少库存
const grnDeleteStock = async (_) => {
    const stock = await prisma.stock.findFirst({
        where: {
            goodsId: _.goodsId,
            repoId: _.repoId
        }
    })
    if (stock) {
        await prisma.stock.update({
            where: {
                id: stock.id
            },
            data: {
                totalCount: stock.totalCount - _.amount,
                totalBuyPrice: stock.totalBuyPrice - _.totalPrice,
                avgBuyPrice: mathJs.divide(stock.totalBuyPrice - _.totalPrice, stock.totalCount - _.amount),
            }
        })
    }
}
const outboundDeleteStock = async  (_) => {
    const stock = await prisma.stock.findFirst({
        where: {
            goodsId: _.goodsId,
            repoId: _.repoId
        }
    })
    if (stock) {
        await prisma.stock.update({
            where: {
                id: stock.id
            },
            data: {
                totalCount: stock.totalCount + _.amount,
                salePrice:  _.price,
                totalSalePrice: stock.totalSalePrice - _.totalPrice,
            }
        })
    }
}
export const stockDetail = async (data = {}) => {
    const {repoId, goodsId} = data
    let where = {}
    if (
        repoId
    ) {
        where.repoId = repoId
    }
    if (
        goodsId
    ) {
        where.goodsId = goodsId
    }
    const res = await prisma.stock.findFirst({
        where
    })
    return {
        code: 200,
        message: res
    }
}
/** 入库*/
export const addGrnList = async (data = {}) => {
    // return httpFetch.post('grn/add', data)
    await prisma.$transaction(async () => {
        await prisma.purchase_order.create({
            data: {
                ...omit(data,['itemList']),
                date: new Date(data.date),
                itemList: {
                    create: data.itemList
                },
            },
        })
        await Promise.all(data.itemList.map(async _ => {
            await grnUpdateStock(_)
        }))
    })
    return {
        code: 200,
        message: '成功'
    }
}
//更新
export const updateGrnList = async (data = {}) => {
    // return httpFetch.post('grn/update', data)
    await prisma.$transaction(async () => {
        await prisma.purchase_order.update({
            where: {
                id: data.id
            },
            data: {
                ...omit(data, ['itemList', 'id']),
                date: new Date(data.date),
            },
        })
        const exists = await prisma.purchase_order_item.findMany({where: {
            orderId: data.id
            }})
        await Promise.all(data.itemList.map(async _ => {
            const poi = exists.find(e=> e.id === _.id)
            if (poi) {
                const stock = await prisma.stock.findFirst({
                    where: {
                        goodsId: _.goodsId,
                        repoId: _.repoId
                    }
                })
                await prisma.stock.update({
                    where: {
                        id: stock.id
                    },
                    data: {
                        totalCount:  stock.totalCount - poi.amount + _.amount,
                        buyPrice: _.price,
                        totalBuyPrice: stock.totalBuyPrice -poi.totalPrice + _.totalPrice,
                        avgBuyPrice: mathJs.divide(stock.totalBuyPrice -poi.totalPrice + _.totalPrice, stock.totalCount - poi.amount + _.amount),
                    }
                })
                await prisma.purchase_order_item.update({
                    where: {
                        id: _.id
                    },
                    data: {
                        ...omit(_, ['id', 'repo', 'goods']),
                    }
                })
            } else {
                await prisma.purchase_order_item.create({
                    data: {
                        ...omit(_, ['id', 'repo', 'goods']),
                        orderId: data.id
                    }
                })
                await grnUpdateStock(_)
            }
        }))
    })
    return {
        code: 200,
        message: '成功'
    }
}
// 删除 入库单
export const deleteGrnList = async (data = {}) => {
    // return httpFetch.post('grn/delete', data)
    await prisma.$transaction(async () => {
        const exists = await prisma.purchase_order_item.findMany({
            where: {
                orderId: data.id
            }
        })
        await Promise.all(exists.map(async _ => {
            await grnDeleteStock(_)
        }))
        await prisma.purchase_order_item.deleteMany({
            where: {
                orderId: data.id
            }
        })
        await prisma.purchase_order.delete({
            where: {
                id: data.id
            },
        })
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 获取入库表*/
export const getGrnList = async (data = {}) => {
    // return httpFetch.post('grn/list', data)
    const {pageSize, pageNo, code , supplierId, userId, startDate, endDate} = data
    let where = {}
    if (startDate) {
        where.date = {
            gte: new  Date(startDate)
        }
    }
    if (endDate) {
        where.date = {
            ...where.date,
            lte: new Date(endDate)
        }
    }
    if (
        code
    ) {
        where.code = {
            contains: code
        }
    }
    if (supplierId) {
        where.supplierId = supplierId
    }
    if (userId) {
        where.userId = userId
    }
    const [total, records] = await prisma.$transaction([
        prisma.purchase_order.count({where}),
        prisma.purchase_order.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where,
            include: {
                itemList: {
                    include: {
                        goods: true,
                        repo: true
                    }
                }
            }
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}


/** 获取入库明细表*/
export const getGrnDetailList = (data = {}) => {
    return httpFetch.post('grnDetail/list', data)
}

/** 导出入库表*/
export const exportGrnList = (data = {}) => {
    return httpFetch.get('grn/exportGrnList', data)
}

/** 入库統計、年月日 统计、开始 结束时间*/
export const geGrnTotal = (data = {}) => {
    return httpFetch.post('grn/total', data)
}
/** 入库按照 商品 最小单位、仓库进行数量统计*/
export const geGrnClassify = async (data = {}) => {
    // return httpFetch.post('grn/classify', data)
    const {pageSize, pageNo, goodsId , repoId, startDate, endDate} = data
    let isDate = {}
    if (startDate) {
        isDate.gte = new Date(startDate)
    }
    if (endDate) {
        isDate.lte = new Date(endDate)
    }
    let where = {
        purchase_order: {
            is: {
                date: isDate
            }
        }
    }
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (repoId) {
        where.repoId = repoId
    }
    const [total, records] = await prisma.$transaction([
        prisma.purchase_order_item.count({
            where,
        }),
        prisma.purchase_order_item.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where,
            include: {
                goods: true,
                repo: true,
                purchase_order: true
            }
        })
    ])
    return {
        code: 200,
        message: {
            total,
            records
        }
    }
}



/** 出库*/
export const addOutboundList = async (data = {}) => {
    // return httpFetch.post('outbound/add', data)
    await prisma.$transaction(async () => {
        await prisma.sale_order.create({
            data: {
                ...omit(data, ['itemList']),
                date: new Date(data.date),
                itemList: {
                    create: data.itemList.map(_ => {
                        return omit(_, ['stock'])
                    })
                },
            },
        })
        await Promise.all(data.itemList.map(async _ => {
            await outboundUpdateStock(_)
        }))
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 出库*/
export const updateOutboundList = async (data = {}) => {
    // return httpFetch.post('outbound/update', data)
    await prisma.$transaction(async () => {
        await prisma.sale_order.update({
            where: {
                id: data.id
            },
            data: {
                ...omit(data, ['itemList', 'id']),
                date: new Date(data.date),
            },
        })
        const exists = await prisma.sale_order_item.findMany({
            where: {
                orderId: data.id
            }
        })
        await Promise.all(data.itemList.map(async _ => {
            const soi = exists.find(e => e.id === _.id)
            if (soi) {
                const stock = await prisma.stock.findFirst({
                    where: {
                        goodsId: _.goodsId,
                        repoId: _.repoId
                    }
                })
                await prisma.stock.update({
                    where: {
                        id: stock.id
                    },
                    data: {
                        totalCount: stock.totalCount + soi.amount - _.amount,
                        salePrice: _.price,
                        totalSalePrice: stock.totalSalePrice + soi.totalPrice - _.totalPrice,
                    }
                })
                await prisma.sale_order_item.update({
                    where: {
                        id: _.id
                    },
                    data: {
                        ...omit(_, ['id', 'repo', 'goods']),
                    }
                })
            } else {
                await prisma.sale_order_item.create({
                    data: {
                        ...omit(_, ['id', 'repo', 'goods']),
                        orderId: data.id
                    }
                })
                await outboundUpdateStock(_)
            }
        }))
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 出库明细*/
export const getOutboundList = async (data = {}) => {
    // return httpFetch.post('outbound/list', data)
    const {pageSize, pageNo, code, customerId, userId, startDate, endDate} = data
    let where = {}
    if (startDate) {
        where.date = {
            gte: new Date(startDate)
        }
    }
    if (endDate) {
        where.date = {
            ...where.date,
            lte: new Date(endDate)
        }
    }
    if (
        code
    ) {
        where.code = {
            contains: code
        }
    }
    if (customerId) {
        where.customerId = customerId
    }
    if (userId) {
        where.userId = userId
    }
    const [total, records] = await prisma.$transaction([
        prisma.sale_order.count({where}),
        prisma.sale_order.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where,
            include: {
                itemList: {
                    include: {
                        goods: true,
                        repo: true
                    }
                }
            }
        })
    ])
    return {
        code: 200,
        message: {
            records,
            total
        }
    }
}
/** 出库*/
export const deleteOutboundList = async (data = {}) => {
    // return httpFetch.post('outbound/add', data)
    await prisma.$transaction(async () => {
        const exists = await prisma.sale_order_item.findMany({
            where: {
                orderId: data.id
            }
        })
        await Promise.all(exists.map(async _ => {
            await outboundDeleteStock(_)
        }))
        await prisma.sale_order_item.deleteMany({
            where: {
                orderId: data.id
            }
        })
        await prisma.sale_order.delete({
            where: {
                id: data.id
            },
        })
    })
    return {
        code: 200,
        message: '成功'
    }
}

/**出库统计 */
export const getOutboundTotal = (data = {}) => {
    return httpFetch.post('outbound/total', data)
}

/** 导出入库表*/
export const exportOutboundList = (data = {}) => {
    return httpFetch.get('outbound/exportGrnList', data)
}


/** 出库按照 商品 最小单位、仓库进行数量统计*/
export const geOutboundClassify = async (data = {}) => {
    // return httpFetch.post('outbound/classify', data)
    const {pageSize, pageNo, goodsId, repoId, startDate, endDate} = data
    let isDate = {}
    if (startDate) {
        isDate.gte = new Date(startDate)
    }
    if (endDate) {
        isDate.lte = new Date(endDate)
    }
    let where = {
        sale_order: {
            is: {
                date: isDate
            }
        }
    }
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (repoId) {
        where.repoId = repoId
    }
    const [total, records] = await prisma.$transaction([
        prisma.sale_order_item.count({
            where,
        }),
        prisma.sale_order_item.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where,
            include: {
                goods: true,
                repo: true,
                sale_order: true
            }
        })
    ])
    return {
        code: 200,
        message: {
            total,
            records
        }
    }
}

/** 按照时间维度（年 月 日 ）统计产品销售排名*/
export const getOutboundRaking = (data = {}) => {
    return httpFetch.post('outboundDetail/outboundRaking', data)
}

/**
 *  根据 时间范围 商品 用户、按照 年 月日 汇总统计销量
 * @param {*} data
 * @returns
 */
export const getCategorySales = (data = {}) => {
    return httpFetch.post('outboundDetail/categorySales', data)
}



/** 库存分页列表*/
export const getInventoryList = async (data = {}) => {
    // return httpFetch.post('inventory/list', data)
    const {pageSize, pageNo, goodsId, repoId} = data
    let where = {}
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (repoId) {
        where.repoId = repoId
    }
    const [total, records] = await prisma.$transaction([
        prisma.stock.count({
            where,
        }),
        prisma.stock.findMany({
            skip: pageSize * (pageNo - 1),
            take: pageSize,
            where,
            include: {
                goods: true,
                repo: true,
            }
        })
    ])
    return {
        code: 200,
        message: {
            total,
            records: records.map(_ => {
                return {
                    ..._,
                    profit: mathJs.subtract(_.totalSalePrice, _.totalBuyPrice)
                }
            })
        }
    }
}

/** 库存不分页列表*/
export const getInventoryAllList = (data = {}) => {
    return httpFetch.post('inventory/allList', data)
}

/** 删除库存*/
export const deleteInventoryList = (data = {}) => {
    return httpFetch.post('inventory/delete', data)
}

/** 根据名称搜索供应商*/
export const getSuppliersByName = (data = {}) => {
    return httpFetch.post('supplier/getSuppliersByName', data)
}

/** 根据名称搜索客户*/
export const getCustomersByName = (data = {}) => {
    return httpFetch.post('customer/getListByName', data)
}

/**
 *  前五十名客户 购买 欠费  实付金额 排名
 * @param {*} data
 * startDate ?: Date 开始日期
 * endDate ?: Date 结束日期
 * @returns
 */
export const getCustomerRaking = async (data = {}) => {
    // return httpFetch.post('outbound/customerRaking', data)
    const {customerId, startDate, endDate} = data
    let where = {}
    if (customerId) {
        where.customerId = customerId
    }
    if (startDate) {
        where.date = {
            gte: new Date(startDate)
        }
    }
    if (endDate) {
        where.date = {
            ...where.date,
            lte: new Date(endDate)
        }
    }
    const res = await prisma.sale_order.groupBy({
        by: ['customerId'],
        _sum: {
            totalPrice: true,
            payPrice: true
        },
        where
    })
    return {
        code: 200,
        message: await Promise.all(res.map(async _ => {
            return {
                customer: await prisma.sale_customer.findUnique({
                    where: {
                        id: _.customerId
                    }
                }),
                ..._._sum,
                allDebt: mathJs.subtract(_._sum.totalPrice,  _._sum.payPrice)
            }
        }))
    }
}












