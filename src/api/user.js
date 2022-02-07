import httpFetch from '@/utils/https'
import {prisma} from "@/db";
import {prismaContains} from "@/utils";
import {omit} from "lodash";
/** 注册用户 */
export const addUser = async (data = {}) => {
    // return httpFetch.post('user/register', data)
    const res = await prisma.user.create({
        data
    })
    return {
        code: 200,
        message: '成功'
    }
}

/** 注册用户 */
export const updateUser = (data = {}) => {
    return httpFetch.post('user/update', data)
}

/** 用户列表 */
export const userList = async (data = {}) => {
    // return httpFetch.post('user/list', data)
    const {account} = data
    let where = {}
    if (account) {
        where.account = {
            contains: account
        }
    }
    const [total, records] = await prisma.$transaction([
        prisma.user.count(
            where
        ),
        prisma.user.findMany({
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

/** 修改密码 */
export const editPwd = (data = {}, userId) => {
    return httpFetch.post('user/resetUserPassword', {}, {
        params: data
    })
}

/** 删除 */
export const deleteUser = (userId) => {
    return httpFetch.post('user/delete?id=' + userId)
}
