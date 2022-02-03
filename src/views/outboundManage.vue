<!--  -->
<template>
  <el-form :inline="true" :model="queryForm" label-width="100px" size="small" class="demo-form-inline">
    <el-form-item label="出库单号：">
      <el-input v-model="queryForm.code" @keyup.enter.native="getTableData()" clearable placeholder="请输出库单号">
      </el-input>
    </el-form-item>
    <el-form-item label="开始时间：">
      <el-date-picker v-model="queryForm.startDate" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss" placeholder="录入订单开始时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间：">
      <el-date-picker v-model="queryForm.endDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      type="datetime" placeholder="录入订单结束时间">
      </el-date-picker>
    </el-form-item>

    <el-form-item label="供货商：">
      <customer-select v-model="queryForm.customerId"/>
    </el-form-item>

    <el-form-item label="操作人：">
      <el-select v-model="queryForm.userId" clearable filterable placeholder="选择出库单录入人员">
        <el-option v-for="item in userData" :key="item.id" :label="item.account" :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="getTableData()" icon="Search">查询
      </el-button>
      <el-button icon="Plus" @click="handlerAdd()">新增出库单</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" v-loading="loadTable" row-key="id" border>
    <el-table-column type="expand">
      <template #default="props">
        <div class="outbound-detail-list">
          <el-table :data="props.row.itemList">
            <el-table-column prop="goods.name" label="产品名称"/>
            <el-table-column prop="amount" label="数量"/>
            <el-table-column prop="goods.unit" label="单位"></el-table-column>
            <el-table-column prop="price" label="售价"/>
            <el-table-column prop="totalPrice" label="总价"/>
            <el-table-column prop="repo.name" label="仓库"/>
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="date" label="创建时间" min-width="100">
      <template #default="scope">
        {{moment(scope.row.date).format('YYYY-MM-DD HH:mm:ss')}}
      </template>
    </el-table-column>
    <el-table-column prop="code" label="订单号" min-width="100"  />
    <el-table-column prop="totalPrice" label="应付" min-width="100"  />
    <el-table-column prop="payPrice" label="实付" min-width="100" sortable  />
    <el-table-column prop="descs" label="备注" min-width="200"  />
    <el-table-column label="操作" width="200">
      <template #default="scope">
        <el-button size="mini" icon="Edit" @click.prevent="handlerEdit(scope.row)">
          修改
        </el-button>
        <el-popconfirm title="确定要删除吗?" @confirm="handlerDelete(scope.row)" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button size="mini" type="danger" icon="Delete">
              删除
            </el-button>
          </template>
        </el-popconfirm>

      </template>
    </el-table-column>
  </el-table>
  <el-pagination v-model:currentPage="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
                 layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="v=>handleSizeChange(v)"
                 @current-change="v=>handleCurrentChange(v)">
  </el-pagination>
  <!--  dialog -->
  <el-dialog v-model="dialogVisible" width="800px" fullscreen :title="isEdit?'修改出库单':'新增出库单'"
             :before-close="resetDialogForm">
    <el-form size="small" ref="dialogRef" label-width="120px" :model="dialogForm" :rules="dialogFormRules"
             class="demo-form-inline">

      <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="出库单编号：" prop="code">
            <span v-if="isEdit">{{dialogForm.code}}</span>
            <el-input v-else v-model.trim="dialogForm.code" :maxlength="20" @keyup.enter.native="handlerSave()"
                      clearable placeholder="请输入出库单编号">
            </el-input>

          </el-form-item>

        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="出库日期：" prop="date">
            <span v-if="isEdit">{{dialogForm.date}}</span>
            <el-date-picker v-else v-model="dialogForm.date" format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择出库日期" style="width:100%">
            </el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="操作人：" prop="userId">
            <el-select v-model="dialogForm.userId" filterable clearable placeholder="选择出库单录入人员" style="width:100%">
              <el-option v-for="item in userData" :key="item.id" :label="item.account" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="客户：" prop="customerId">
            <customer-select v-model="dialogForm.customerId" />
          </el-form-item>
        </el-col>

      </el-row>
      <el-form-item label-width='0'>
        <el-divider> <span class="outbound-detail-title">出库产品明细</span> </el-divider>
      </el-form-item>
      <el-form-item label-width='0'>
        <el-table :data="dialogForm.itemList">
          <el-table-column label="出库仓库" min-width="220px">
            <template #default="props">
              <el-form-item label-width="0" :prop="'itemList.'+props.$index+'.repoId'" :rules="dialogFormRules.repoId">
                <repo-select-v2 v-model="props.row.repoId" :goods-id="props.row.goodsId" :is-edit="props.row.isEdit"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="出库产品" min-width="220px">
            <template #default="props">
              <el-form-item label-width="0" :prop="'itemList.'+props.$index+'.goodsId'"
                            :rules="dialogFormRules.goodsId">
                <goods-select-v2 v-model="props.row.goodsId" :repo-id="props.row.repoId" @change="getReferInfo(props.$index)" :is-edit="props.row.isEdit"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="库存数量" min-width="160px">
            <template #default="props">
              <el-form-item >
                <span>{{props.row.stock?.totalCount??0}}</span>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="出库数量" min-width="160px">
            <template #default="props">
              <el-form-item label-width="0" :prop="'itemList.'+props.$index+'.amount'" :rules="dialogFormRules.amount">
                <el-input-number v-model.number="props.row.amount" @change="getTotalPrice(props.$index)" :min="0"
                                 :max="props.row.stock?.totalCount"
                                 style="width:100%" clearable placeholder="请输入出库数量"
                :disabled="!(props.row.goodsId && props.row.repoId)"
                                 v-if="props.row.isEdit"
                >
                </el-input-number>
                <span v-else>{{props.row.amount}}</span>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="预设售价" min-width="160px">
            <template #default="props">
              <el-form-item>
                <span>{{props.row.stock?.goods?.salePrice??0}}</span>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单价" min-width="200px">
            <template #default="props">
              <el-form-item label-width="0" :prop="'itemList.'+props.$index+'.price'" :rules="dialogFormRules.price">
                <el-input-number v-model.number="props.row.price" :min="0" @change="getTotalPrice(props.$index)"
                                 style="width:100%" clearable placeholder="请输入单价"
                                 :disabled="!(props.row.goodsId && props.row.repoId)"
                                 v-if="props.row.isEdit"
                >
                </el-input-number>
                <span v-else>{{props.row.price}}</span>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="总售价" min-width="100" fixed="right">
            <template #default="props">
              <el-form-item> {{props.row.totalPrice}}</el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="props">
              <el-form-item label-width="0">
                <el-button size="mini" type="primary" @click="props.row.isEdit=!props.row.isEdit">{{props.row.isEdit ? '确认': '编辑' }}</el-button>
                <el-button size="mini" type="danger" icon="Delete" @click="removeOutboundDetail(props.$index)" v-if="props.$index!==0">删除</el-button>
              </el-form-item>
            </template>
          </el-table-column>

        </el-table>
      </el-form-item>

      <el-form-item label-width='0'>
        <el-button type="text" size="medium" icon="CirclePlus" @click="addOutboundDetailList()">添加出库产品</el-button>
      </el-form-item>

      <el-row>

        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="总成本：" prop="totalPrice">
            <div class="form-pre-flex">
              {{dialogForm.totalPrice}}
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="已付款：" prop="payPrice">
            <el-input-number v-model="dialogForm.payPrice" :precision="2" :min="0" clearable placeholder="请输入已付款"
                             style="width:100%">
            </el-input-number>
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="备注：" prop="descs">
            <el-input v-model.trim="dialogForm.descs" type="textarea" :rows="4" show-word-limit maxlength="50"
                      clearable placeholder="请输入备注信息">
            </el-input>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
    <el-divider border-style="dashed"></el-divider>
    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">关闭</el-button>
        <el-button size="small" :loading="saveLoading" type="primary" @click="handlerSave()">保存</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
import { reactive, toRefs, ref, nextTick, toRaw } from 'vue'
import moment from 'moment'
import {
  getOutboundList,
  updateOutboundList,
  addOutboundList,
  deleteOutboundList,
  getCategoryTree, stockDetail,
} from '@/api/common'
import { userList } from '@/api/user'
import { globalLoading, showMessage, downLoadFile, getDataById } from '@/utils'
import mathJs from '@/utils/math'
//远程搜索客户，客户
import remoteMix from '@/mixin/remote'
import _ from 'lodash'
import CustomerSelect from "@temp/CustomerSelect";
import RepoSelectV2 from "@temp/RepoSelectV2";
import GoodsSelectV2 from "@temp/GoodsSelectV2";
import {Decimal} from 'decimal.js'
export default {
  name: 'outboundManage',
  components: {GoodsSelectV2, RepoSelectV2, CustomerSelect},
  setup(props, context) {

    const state = reactive({
      tableData: [],
      dialogVisible: false,// 修改、新增产品dialog
      isEdit: false,
      saveLoading: false,
      currentEditData: {},// 当前修改数据
      categoryData: [],// 产品数据
      userData: [],//用户
      repoData: [],//仓库
      supplierData: [],//客户
      unitData: [],// 数量单位
      loadignData: false,//加载 产品loading
      queryForm: {
        code: '',
        startDate: moment(new Date(+new Date() - 30 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
        endDate: '',
        userId: '',
        customerId: '',//供货商
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loadTable: false,
    })

    const { remoteSupplierData } = remoteMix(state)
    //出库单数据
    const getSupplierFormData = () => ({
      code: '' + moment(new Date()).format('YYYYMMDDHHmmss'),//出库单编号
      date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),//出库日期
      userId: '',// 操作人id
      customerId: '',// 客户id
      totalPrice: 0,// 总价
      payPrice: 0, // 已付款
      descs: '', // 备注信息
      itemList: [{
        goodsId: '',
        repoId: '',
        amount: 0,
        totalPrice: 0,//采购成本
        price: 0,//单价
      }]
    })
    // 新增、修改form
    let dialogForm = reactive(getSupplierFormData())
    // 新增、修改formRules
    const dialogFormRules = {
      code: [{
        required: true, message: '请输入出库单编号', trigger: 'blur',
      }],
      date: [{
        required: true, message: '请选择出库日期', trigger: 'change',
      }],
      userId: [{
        required: true, message: '请选择操作人', trigger: 'change',
      }],
      customerId: [{
        required: true, message: '请选择客户', trigger: 'change',
      }],
      goodsId: [{
        required: true, message: '请选择出库产品', trigger: 'blur',
      }],
      amount: [{
        required: true, message: '请输入出库数量', trigger: 'blur',
      }, {
        type: 'number',
        min: 1,
        message: '出库数量最小为1',
        trigger: 'blur',
      }],
      repoId: [{
        required: true, message: '请选择仓库', trigger: 'blur',
      }],
    }
    // 新增、修改dialog ref
    const dialogRef = ref(null)
    const methods = {
      getTotalPrice(index) {
        const curOutboundDetail = dialogForm.itemList[index]
        dialogForm.itemList[index].totalPrice = mathJs.multiply(curOutboundDetail.amount, curOutboundDetail.price)
        this.calculateTotalPrice()
      },
      async getReferInfo(index) {
        const curOutboundDetail = dialogForm.itemList[index]
        const {repoId, goodsId} = curOutboundDetail
        if (repoId && goodsId) {
          const {code, message} = await stockDetail(curOutboundDetail)
          if (code === 200) {
            dialogForm.itemList[index].stock = message
            dialogForm.itemList[index].price = new Decimal(message.goods.salePrice).toNumber()
          }
        }
      },
      /**
       * 计算总价格
       */
      calculateTotalPrice() {
        const totalPrice = dialogForm.itemList.reduce((total, c) => total += c.totalPrice, 0)
        // 总价格
        dialogForm.totalPrice = totalPrice
        // 已付款
        dialogForm.payPrice = totalPrice
      },
      /**
       * 导出
       */
      handleExport() {
        const params = []
        for (const key in state.queryForm) {
          params.push(key + "=" + state.queryForm[key])
        }
        const url = process.env.VUE_APP_URL_API + "/outbound/exportOutboundList?" + params.join("&")
        downLoadFile(url)
      },
      /**
       * 移除出库明细
       */
      removeOutboundDetail(index) {
        dialogForm.itemList.splice(index, 1)
      },
      /**
       * 新增出库产品明细
       * 添加一个子级明细
       */
      addOutboundDetailList() {
        dialogForm.itemList.push({
          repoId: '',
          amount: 0,
          totalPrice: 0,//采购成本
          price: 0,//单价
          isEdit: true
        })
      },
      /**
       * 获取列表
       */
      async getTableData() {
        state.loadTable = true
        const params = Object.assign({}, state.queryForm, {
          pageSize: state.pageSize,
          pageNo: state.currentPage
        })
        console.log(params)
        const res = await getOutboundList(params)
        res.code === 200 && (state.tableData = res.message.records) && (state.total = res.message.total)
        state.loadTable = false
      },
      /**
       * 修改
       */
      handlerEdit(item) {
        item = JSON.parse(JSON.stringify(toRaw(item)));
        state.isEdit = true
        state.dialogVisible = true
        state.currentEditData = item
        nextTick(async () => {
          dialogRef.value.resetFields()
          for (const key in dialogForm) {
            if (key === 'date') {
              dialogForm[key] = moment(item[key]).format('YYYY-MM-DD HH:mm:ss')
            } else {
              dialogForm[key] = item[key]
            }
          }
          dialogForm.id = item.id
        })
      },
      /**
       * 新增
       * @param {*} item 当前操作数据
       */
      handlerAdd(item = {}) {
        state.dialogVisible = true
        state.isEdit = false
        nextTick(() => {
          dialogRef.value.resetFields()
          dialogForm.itemList = [{
            goodsId: '',
            repoId: '',
            amount: 0,
            totalPrice: 0,//采购成本
            price: 0,//单价
            isEdit: true
          }]
          dialogForm.code = moment(new Date()).format('YYYYMMDDHHmmss')
          dialogForm.date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
          state.currentEditData = item
        })
      },
      /**
       * 删除
       */
      async handlerDelete(item) {
        const loading = globalLoading()
        const updateOutbound = _.cloneDeep(item); //JSON.parse(JSON.stringify(toRaw(item)))
        //将库存清零
        for (const itemc of updateOutbound.itemList) {
          itemc.amount = 0
        }
        // 状态置为编辑--目的为添加批次id
        state.isEdit = true

        //组装批次
        const specieList = getOutboundSpecieData(updateOutbound.itemList)
        state.isEdit = false
        const prams = {
          outboundData: updateOutbound,
          outboundId: item.id,
          outboundDetailIds: item.itemList.map(v => v.id),
          specieList
        }
        const resDel = await deleteOutboundList(updateOutbound).finally(() => {
          loading.close()
        })

        showMessage(resDel.code === 200 ? 'success' : 'error', resDel.message)
        resDel.code === 200 && this.getTableData()
      },
      //保存
      handlerSave() {
        dialogRef.value.validate(async (valid) => {
          if (valid) {
            const params = Object.assign({}, dialogForm)
            const responseData = state.isEdit ? await updateOutboundList(params) : await addOutboundList(params);
            state.saveLoading = false
            // 刷新表格
            responseData.code === 200 && this.getTableData()
            //显示提示信息
            showMessage(responseData.code === 200 ? 'success' : 'error', state.isEdit ? responseData.message : responseData.message)
            responseData.code === 200 && (state.dialogVisible = false)
          }
          else {
            return false
          }
        })
      },
      /**
       * 关闭dialog 之前 重置form
       */
      resetDialogForm(done) {
        dialogRef.value.resetFields()
        done()
      },

      /**
       * 分页记录数改变
       */
      handleSizeChange(value) {
        state.pageSize = value
        this.getTableData()
      },
      /**
       * 分页页数改变
       */
      handleCurrentChange(value) {
        state.currentPage = value
        this.getTableData()
      }
    }

    /**
     * 获取出库产品批次
     */
    const getOutboundSpecieData = (outboundDetailData) => {
      if (!outboundDetailData) outboundDetailData = dialogForm.itemList;
      return outboundDetailData.map(v => {
        const unitId = Array.isArray(v.unitId) ? v.unitId.at(-1) : v.unitId;
        // 数量单位名称
        let unitNameData = getDataById(state.unitData, unitId)

        unitNameData.find(unitv => unitv.id === unitId)// state.unitData.flat(Infinity).find(unitv => unitv.id === unitId)
        const unitName = unitNameData?.[0]?.name ?? '';
        // 出库产品id
        const categoryId = Array.isArray(v.categoryId) ? v.categoryId.at(-1) : v.categoryId;
        let editParas = {}
        //修改状态下 添加批次id
        if (state.isEdit) {
          editParas.id = v.specieId;
        }
        return {
          name: v.specieName,
          categoryId,
          unitId,
          unitName,
          cost: v.price,// mathJs.divide(v.totalPrice, v.amount),//成本 = 总成 / 数量
          selling: 0,
          ...editParas
        }
      })
    }

    //查询产品树、用户列表、客户
    const getUnitAndCategoryData = async () => {
      state.loadignData = true
      const res = await Promise.all([getCategoryTree(), userList()]).finally(() => {
        state.loadignData = false
      })

      res[0].code === 200 && (state.categoryData = res[0].message)// 产品
      res[1].code === 200 && (state.userData = res[1].message.records)// 用户
      state.loadignData = false
    }
    //查询产品树
    getUnitAndCategoryData()
    //查询批次列表
    methods.getTableData()

    return {
      ...methods,
      ...toRefs(state), //抛出
      dialogFormRules,
      dialogForm,
      dialogRef,
      remoteSupplierData,
      moment
    }
  },
}
</script>
<style lang='scss' scoped>
.outbound-detail-list {
  margin: 15px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.1);

  &-item {
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 7px 0 rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
}
.outbound-detail-title {
  font-size: 25px;
  color: #409eff;
}

.form-pre-flex {
  display: flex;
  .form-pre-flex-btn {
    margin-left: 5px;
  }
}
</style>
