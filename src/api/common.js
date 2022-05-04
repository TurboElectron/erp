import httpFetch from '@/utils/https'
import {prisma} from "@/db";
import {intersection, intersectionWith, omit, pick} from "lodash";
import * as math from "mathjs";
const orderMap = {
    "ascending": 'asc',
    "descending": 'desc',
}
/** 添加产品 */
export const addGoods = async (data = {}) => {
    // return httpFetch.post('customer/add', data)
    delete data.id
    const res = await prisma.goods.create({
        data: {
            ...data,
            updatime: new Date()
        }
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 修改产品 */
export const updateGoods  = async (data = {}) => {
    // return httpFetch.post('customer/update', data)
    const res = await prisma.goods.update({
        where: {id: data.id},
        data: {
            ...data,
            updatime: new Date()
        }
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 删除产品 */
export const removeGoods  = async (data = {}) => {
    // return httpFetch.post('customer/delete', data)
    await prisma.$transaction(async () => {
        await prisma.stock.deleteMany({
            where: {
                goodsId: data.id
            }
        })
        const res = await prisma.goods.delete({
            where: {id: data.id},
        })
    })
    return {
        code: 200,
        message: '成功'
    }
}
export const goodsDetail = async (data={}) => {
    const {id} = data
    const res = await prisma.goods.findUnique({
        where: {
            id
        }
    })
    return {
        code: 200,
        message: res
    }
}
/** 客户产品 */
export const goodsList = async (data = {}) => {
    const {pageSize, pageNo,id, cid, name, code} = data
    let where = {

    }
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
        prisma.goods.count({where}),
        prisma.goods.findMany({
            skip: pageSize* (pageNo-1),
            take: pageSize,
            where,
            orderBy: {
                'updatime': 'desc'
            }
        })
    ])
    console.log(records)
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
        where.goodsId = id
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
        prisma.stock.groupBy({
            by: ['goodsId'],
            where,
        }),
        prisma.stock.findMany({
            distinct: ['goodsId'],
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
            total: total.length
        }
    }
}
/** 注册分类 */
export const addCategory = async (data = {}) => {
    // return httpFetch.post('category/addCategory', data)
    delete data.id
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
    const n = await prisma.goods.count({where: {cid: id}})
    count = count + n
    async function iter(arr) {
        for (let i = 0; i < arr.length; i++) {
            const _ = arr[i]
            const n = await prisma.goods.count({where: {cid: _.id}})
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




/** 添加客户 */
export const addCustomer = async (data = {}) => {
    // return httpFetch.post('customer/add', data)
    delete data.id
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
    delete data.id
    const res = await prisma.repo.create({
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
    const res = await prisma.repo.update({
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
        prisma.repo.count({where}),
        prisma.repo.findMany({
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
        where.repoId = id
    }
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (name) {
        where.name = {
            contains: name
        }
    }
    const [records] = await prisma.$transaction([
        prisma.stock.findMany({
            distinct: ['repoId'],
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
        }
    }
}

/** 删除仓库 */
export const deleteRepo = async id => {
    // return httpFetch.post('repo/delete?id=' + id)
    const res = await prisma.repo.delete({
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
    delete data.id
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
        await prisma.stock.update({
            where: {
                id: stock.id
            },
            data: {
                totalCount: stock.totalCount + _.amount,
                buyPrice: _.price,
                avgBuyPrice: math.evaluate(`(${stock.totalBuyPrice} + ${_.totalPrice}) / ${stock.totalCount} + ${_.amount}`),
                totalBuyPrice: math.evaluate(`${stock.totalBuyPrice} + ${_.totalPrice}`)
            }
        })
    } else {
        await prisma.stock.create({
            data: {
                goodsId: _.goodsId,
                repoId: _.repoId,
                totalCount: _.amount,
                saleCount: 0,
                totalSalePrice: 0,
                buyPrice: _.price,
                avgBuyPrice: math.evaluate(`${_.totalPrice} / ${_.amount}`),
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
                totalCount: stock.totalCount??0 - _.amount??0,
                saleCount: stock.saleCount??0 + _.amount??0,
                salePrice:  _.price??0,
                totalSalePrice: math.evaluate(`${stock.totalSalePrice??0} + ${_.totalPrice??0}`)
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
                totalBuyPrice: math.evaluate(`${stock.totalBuyPrice} - ${_.totalPrice}`),
                avgBuyPrice: math.evaluate(`(${stock.totalBuyPrice} -  ${_.totalPrice}) / (${stock.totalCount} - ${_.amount})`),
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
                totalCount: stock.totalCount??0 + _.amount??0,
                saleCount: stock.saleCount??0 - _.amount??0,
                salePrice:  _.price??0,
                totalSalePrice: math.evaluate(`${stock.totalSalePrice??0} - ${_.totalPrice??0}`),
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
        where,
        include: {
            goods: true
        }
    })
    return {
        code: 200,
        message: res
    }
}
/** 入库*/
export const addGrnList = async (data = {}) => {
    // return httpFetch.post('grn/add', data)
    const res =    await prisma.$transaction(async () => {
       let res=  await prisma.purchase_order.create({
            data: {
                ...omit(data,['purchase_order_item', 'id']),
                date: new Date(data.date),
                purchase_order_item: {
                    create: data.purchase_order_item.map(_ => {
                        return omit(_, ['repo','goods','isEdit', 'cid', 'id'])
                    })
                },
            },
        })
        for (const _ of data.purchase_order_item) {
            await grnUpdateStock(_)
        }
        return res
    })
    return {
        code: 200,
        data: res,
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
                ...omit(data, ['purchase_order_item', 'id']),
                date: new Date(data.date),
            },
        })
        const exists = await prisma.purchase_order_item.findMany({where: {
            orderId: data.id
            }})
        const existIds = 	intersection(exists.map(_ => _.id),data.purchase_order_item.map(_ => _.id) );
        const deletes = exists.filter(_ => !existIds.includes(_.id))
        const updates = data.purchase_order_item.filter(_ => existIds.includes(_.id))
        const adds = data.purchase_order_item.filter(_ => !existIds.includes(_.id))
        for (const _ of deletes) {
            await prisma.purchase_order_item.delete({
                where: {
                    id: _.id
                }
            })
            await grnDeleteStock(_)
        }
        for (const _ of adds) {
            await prisma.purchase_order_item.create({
                data: {
                    ...omit(_, ['id', 'repo', 'goods', 'isEdit', 'cid']),
                    orderId: data.id
                }
            })
            await grnUpdateStock(_)
        }
        for (const _ of updates) {
            const poi = exists.find(e=> e.id === _.id)
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
                    totalBuyPrice:  math.evaluate(`${stock.totalBuyPrice} - ${poi.totalPrice} + ${_.totalPrice}`),
                    avgBuyPrice: math.evaluate(`(${stock.totalBuyPrice} - ${poi.totalPrice} + ${_.totalPrice}) / (${stock.totalCount} - ${poi.amount} + ${_.amount})`) ,
                }
            })
            await prisma.purchase_order_item.update({
                where: {
                    id: _.id
                },
                data: {
                    ...omit(_, ['id', 'repo', 'goods', 'isEdit', 'cid']),
                }
            })
        }
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
        for (const _ of exists) {
            await grnDeleteStock(_)
        }
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
                purchase_supplier: true,
                purchase_order_item: {
                    include: {
                        goods: true,
                        repo: true,
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
   const res =  await prisma.$transaction(async () => {
        const res =  await prisma.sale_order.create({
            data: {
                ...omit(data, ['sale_order_item', 'id']),
                date: new Date(data.date),
                sale_order_item: {
                    create: data.sale_order_item.map(_ => {
                        return omit(_, ['stock','isEdit', 'cid', 'id', 'maxAmount'])
                    })
                },
            },
        })
        for(const  _ of data.sale_order_item) {
            await outboundUpdateStock(_)
        }
        return res
    })
    return {
        code: 200,
        data: res,
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
                ...omit(data, ['sale_order_item', 'id']),
                date: new Date(data.date),
            },
        })
        const exists = await prisma.sale_order_item.findMany({
            where: {
                orderId: data.id
            }
        })
        const existIds = 	intersection(exists.map(_ => _.id),data.sale_order_item.map(_ => _.id) );
        const deletes = exists.filter(_ => !existIds.includes(_.id))
        const updates = data.sale_order_item.filter(_ => existIds.includes(_.id))
        const adds = data.sale_order_item.filter(_ => !existIds.includes(_.id))
        for (const _ of deletes ) {
            await outboundDeleteStock(_)
            await prisma.sale_order_item.delete({
                where: {
                    id: _.id
                }
            })
        }
        for (const _ of adds ) {
            await outboundUpdateStock(_)
            await prisma.sale_order_item.create({
                data: {
                    ...omit(_, ['id', 'repo', 'goods', 'isEdit', 'stock', 'cid', 'maxAmount']),
                    orderId: data.id
                }
            })
        }
        for (const _ of updates ) {
            const soi = exists.find(e => e.id === _.id)
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
                    totalCount: math.evaluate(`${stock.totalCount} + ${soi.amount} - ${_.amount}`),
                    salePrice: _.price,
                    totalSalePrice: math.evaluate(`${stock.totalSalePrice} + ${soi.totalPrice} - ${_.totalPrice}`),
                }
            })
            await prisma.sale_order_item.update({
                where: {
                    id: _.id
                },
                data: {
                    ...omit(_, ['id', 'repo', 'goods','isEdit', 'stock', 'maxAmount']),
                }
            })
        }
    })
    return {
        code: 200,
        message: '成功'
    }
}
/** 出库明细*/
export const getOutboundList = async (data = {}) => {
    // return httpFetch.post('outbound/list', data)
    const {pageSize, pageNo, code, customerId, userId, startDate, endDate, overdraft} = data
    let where = `WHERE 1=1 `
    if(overdraft) {
        where += ` AND confirm = 0 AND totalPrice > payPrice OR otherFee > payOtherFee`
    }
    if (startDate) {
        where += ` AND date >= ${new Date(startDate).getTime()}`
    }
    if (endDate) {
        where += ` AND date <= ${new Date(endDate).getTime()}`
    }
    if (
        code
    ) {
        where += ` AND code like '%${code}%'`
    }
    if (customerId) {
        where += ` AND customerId = ${customerId}`
    }
    if (userId) {
        where += ` AND userId = ${userId}`
    }
    const res = await prisma.$transaction(async ()=> {
        const totals = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM sale_order ${where}`)
        if (pageSize !== undefined && pageNo !== undefined) {
            where += ` LIMIT ${pageSize} OFFSET ${pageSize * (pageNo - 1)}`
        }
        const orders = await  prisma.$queryRawUnsafe(`SELECT *, (otherFee - payOtherFee + totalPrice - payPrice)   as totalOverdraft FROM sale_order ${where}`)
        const records = []
        for (const _ of orders) {
            const sale_customer = await prisma.sale_customer.findUnique({
                where: {
                    id: _.customerId
                }
            })
            const sale_order_item = await prisma.sale_order_item.findMany({
                where: {
                    orderId: _.id
                }
            })
            for (const v of sale_order_item) {
                const goods = await prisma.goods.findUnique({where: {
                    id: v.goodsId
                    }})
                const repo = await prisma.repo.findUnique({where: {
                        id: v.repoId
                    }})
                v.goods = goods
                v.repo = repo
            }
            records.push({
                ..._,
                sale_customer,
                sale_order_item
            })
        }
        return {
            records,
            total: totals[0].count
        }
    })
    return {
        code: 200,
        message: res
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
        for (const _ of exists) {
            await outboundDeleteStock(_)
        }
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
    const {pageSize, pageNo, goodsId, repoId, orderBy} = data
    let where = {}
    if (goodsId) {
        where.goodsId = goodsId
    }
    if (repoId) {
        where.repoId = repoId
    }
    let page = {

    }
    if (pageNo !== undefined && pageSize !== undefined) {
        page = {
            skip: pageSize * (pageNo - 1),
            take: pageSize,
        }
    }
    const [total, records] = await prisma.$transaction([
        prisma.stock.count({
            where,
        }),
        prisma.stock.findMany({
            ...page,
            where,
            orderBy: orderBy.map(_ => {
                return {
                    [_.prop]: orderMap[_.order]
                }
            }),
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
                    profit: math.evaluate(`${_.totalSalePrice} - ${_.totalBuyPrice}`)
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
            payPrice: true,
            otherFee: true
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
                allDebt: math.evaluate(`${_._sum.totalPrice} -  ${_._sum.payPrice}`)
            }
        }))
    }
}

/**
 *  前五十名客户 购买 欠费  实付金额 排名
 * @param {*} data
 * startDate ?: Date 开始日期
 * endDate ?: Date 结束日期
 * @returns
 */
export const getSupplierRaking = async (data = {}) => {
    // return httpFetch.post('outbound/customerRaking', data)
    const {supplierId, startDate, endDate} = data
    let where = {}
    if (supplierId) {
        where.supplierId = supplierId
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
    const res = await prisma.purchase_order.groupBy({
        by: ['supplierId'],
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
                supplier: await prisma.purchase_supplier.findUnique({
                    where: {
                        id: _.supplierId
                    }
                }),
                ..._._sum,
                allDebt: math.evaluate(`${_._sum.totalPrice} -  ${_._sum.payPrice}`)
            }
        }))
    }
}

export const getProfit = async (data={}) => {
    const {startDate, endDate} = data
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
    const purchase = await prisma.purchase_order.aggregate({
        _sum: {
            totalPrice: true,
            payPrice: true,
        },
        where
    })
    const sale = await prisma.sale_order.aggregate({
        _sum: {
            totalPrice: true,
            payPrice: true,
            otherFee: true,
            payOtherFee: true,
        },
        where
    })
    return {
        code: 200,
        message: {
            purchase,
            sale,
            overdraftPurchase: math.evaluate(`${purchase._sum.totalPrice??0} - ${purchase._sum.payPrice??0}`),
            overdraftSale: math.evaluate(`${sale._sum.totalPrice??0} - ${sale._sum.payPrice??0}`),
            overdraftOtherFee: math.evaluate(`${sale._sum.otherFee??0} - ${sale._sum.payOtherFee??0}`),
            profit: math.evaluate(`${sale._sum.totalPrice??0} - ${purchase._sum.totalPrice??0} + ${sale._sum.otherFee??0}`),
            realProfit: math.evaluate(`${sale._sum.payPrice??0} - ${purchase._sum.payPrice??0} + ${sale._sum.payOtherFee??0}`)
        }
    }
}

export const fixStock = async () => {
    await prisma.$transaction(async ()=> {
        const purchaseList = await prisma.$queryRaw`select *, SUM(amount) as amount, SUM(totalPrice) as totalPrice 
from purchase_order_item  GROUP BY
goodsId, repoId;`
        const saleList = await prisma.$queryRaw`select *, SUM(amount) as amount, SUM(totalPrice) as totalPrice 
from sale_order_item  GROUP BY
goodsId, repoId;`
        const stocks = await prisma.stock.findMany()
        for(const stock of stocks) {
            const sale = saleList.find(e => stock.goodsId === e.goodsId && stock.repoId === e.repoId)
            const purchase = purchaseList.find(e => stock.goodsId === e.goodsId && stock.repoId === e.repoId)
            if (!sale && !purchase) {
                await prisma.stock.delete({
                    where: {
                        id: stock.id
                    }
                })
            } else {
                await prisma.stock.update({
                    where: {
                        id: stock.id
                    },
                    data: {
                        totalBuyPrice: purchase?.totalPrice??0,
                        totalSalePrice: sale?.totalPrice??0,
                        totalCount: math.evaluate(`${purchase?.amount??0} - ${sale?.amount??0}`),
                        saleCount: sale?.amount??0,
                        avgBuyPrice: math.evaluate(`${purchase?.totalPrice??0} / ${purchase?.amount??0}`)
                    }
                })
            }


        }
    })
}








