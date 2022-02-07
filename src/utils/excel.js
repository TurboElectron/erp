import { saveAs } from 'file-saver'
import XLSX, { WorkBook, WorkSheet } from 'xlsx'
const sheetFromDataArray = (data) => {
    const ws = {}
    const range = {
        s: {
            c: 10000000,
            r: 10000000
        },
        e: {
            c: 0,
            r: 0
        }
    }
    for (let R = 0; R !== data.length; ++R) {
        for (let C = 0; C !== data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R
            if (range.s.c > C) range.s.c = C
            if (range.e.r < R) range.e.r = R
            if (range.e.c < C) range.e.c = C
            const cell = {
                v: data[R][C],
                t: '',
                z: ''
            }
            if (cell.v == null) continue
            const cellRef = XLSX.utils.encode_cell({
                c: C,
                r: R
            })
            if (typeof cell.v === 'number') cell.t = 'n'
            else if (typeof cell.v === 'boolean') cell.t = 'b'
            else if (cell.v instanceof Date) {
                cell.t = 'n'
                cell.z = XLSX.SSF.get_table()[14]
                cell.v = datenum(cell.v)
            } else cell.t = 's'
            ws[cellRef] = cell
        }
    }
    if (range.s.c < 10000000) {
        ws['!ref'] = XLSX.utils.encode_range(range)
    }
    return ws
}

const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF
    }
    return buf
}
export const exportJson2Excel = (header, data, filename = 'excel-list', multiHeader = [], merges = [], autoWidth = true, bookType = 'xlsx') => {
    data = [...data]
    data.unshift(header)
    for (let i = multiHeader.length - 1; i > -1; i--) {
        data.unshift(multiHeader[i])
    }

    const wsName = 'SheetJS'
    const wb  = {
        SheetNames: [],
        Sheets: {}
    }
    const ws = sheetFromDataArray(data)

    if (merges.length > 0) {
        if (!ws['!merges']) {
            ws['!merges'] = []
        }
        merges.forEach(item => {
            ws['!merges'].push(XLSX.utils.decode_range(item))
        })
    }

    if (autoWidth) {
        // 设置worksheet每列的最大宽度
        const colWidth = data.map((row) => row.map((val) => {
            // 先判断是否为 null/undefined
            if (val == null) {
                return {
                    wch: 10
                }
                // 再判断是否为中文
            } else if (val.toString().charCodeAt(0) > 255) {
                return {
                    wch: val.toString().length * 2
                }
            } else {
                return {
                    wch: val.toString().length
                }
            }
        }))
        // 以第一行为初始值
        const result = colWidth[0]
        for (let i = 1; i < colWidth.length; i++) {
            for (let j = 0; j < colWidth[i].length; j++) {
                if (result[j].wch < colWidth[i][j].wch) {
                    result[j].wch = colWidth[i][j].wch
                }
            }
        }
        ws['!cols'] = result
    }

    // Add worksheet to workbook
    wb.SheetNames.push(wsName)
    wb.Sheets[wsName] = ws

    const wbout = XLSX.write(wb, {
        bookType: bookType,
        bookSST: false,
        type: 'binary'
    })

    saveAs(new Blob([s2ab(wbout)], {
        type: 'application/octet-stream'
    }), `${filename}.${bookType}`)
}
