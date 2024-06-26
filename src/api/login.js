import httpFetch from '@/utils/https'
import {prisma} from "@/db";
/** 登录 */
export const login = async (data = {}) => {
    // return httpFetch.post('user/login', data, {
    //     params: data
    // })
    const user = await prisma.user.findUnique({
        where: {
            id: 1
        }
    })
    return {
        code: 200,
        message: user
    }
}
/** 注册用户 */
export const register = (data = {}) => {
    return httpFetch.post('user/register?username=' + data.username + '&password=' + data.password, data)
}

// 退出登录
export const logout = (data = {}) => {
    return httpFetch.post('user/logout', data)
}
