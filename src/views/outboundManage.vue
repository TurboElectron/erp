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
      <user-select v-model="queryForm.userId" is-edit/>
    </el-form-item>
    <el-form-item label="仅查看欠款：">
      <el-checkbox v-model="queryForm.overdraft"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="getTableData()" icon="Search">查询
      </el-button>
      <el-button type="primary" @click="exportExcel()" >导出
      </el-button>
      <el-button icon="Plus" @click="handlerAdd()">新增出库单</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" v-loading="loadTable" row-key="id" border>
    <el-table-column type="expand" >
      <template #default="props">
        <div class="outbound-detail-list">
          <el-table :data="props.row.sale_order_item" show-summary     :summary-method="getSummaries">
            <el-table-column prop="goods.name" label="产品名称"/>
            <el-table-column prop="goods.code" label="产品编号"/>
            <el-table-column prop="amount" label="数量"/>
            <el-table-column prop="goods.unit" label="单位"></el-table-column>
            <el-table-column prop="avgBuyPrice" label="平均进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
            <el-table-column prop="price" label="售价" :formatter="(row, column, cellValue, index) => (row.totalPrice?.toFixed(2)??0) / row.amount"/>
            <el-table-column prop="totalPrice" label="总价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
            <el-table-column prop="profit" label="利润" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
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
    <el-table-column prop="sale_customer.name" label="客户" min-width="100"  />
    <el-table-column prop="otherFee" label="人工应付" min-width="100"  :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="payOtherFee" label="人工实付" min-width="100"  :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="totalPrice" label="应付" min-width="100" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0" />
    <el-table-column prop="payPrice" label="实付" min-width="100"  :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="profit" label="利润" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="totalOverdraft" label="欠款总计" min-width="100"  :formatter="(row, column, cellValue, index) => row.confirm ? '0.00' : cellValue?.toFixed(2)??0"/>
    <el-table-column prop="confirm" label="是否付清" min-width="100"  :formatter="(row, column, cellValue, index) => row.confirm ? '是' : row.totalOverdraft >0 ? '否': '是'"/>
    <el-table-column prop="descs" label="备注" min-width="200"  />
    <el-table-column label="操作" width="200">
      <template #default="scope">
        <el-button size="small" icon="Edit" @click.prevent="handlerEdit(scope.row)">
          修改
        </el-button>
        <el-popconfirm title="确定要删除吗?" @confirm="handlerDelete(scope.row)" confirm-button-text="确定"
                       cancel-button-text="取消">
          <template #reference>
            <el-button size="small" type="danger" icon="Delete">
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
            <user-select v-model="dialogForm.userId" is-edit/>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="客户：" prop="customerId">
            <customer-select v-model="dialogForm.customerId" />
          </el-form-item>
        </el-col>

      </el-row>
      <el-form-item label-width='0'>
        <el-divider> <span class="outbound-detail-title" style="cursor: pointer;" @click="reloadTable">出库产品明细（点击刷新）</span> </el-divider>
      </el-form-item>
      <el-form-item label-width='0' v-if="detailsShow">
        <div style="height: 400px; width: 100%;">
        <el-auto-resizer>
          <template #default="{ height, width }">
        <el-table-v2 :data="dialogForm.sale_order_item" table-layout="auto" :width="width"  ref="tableRef"   :height="height" :columns="tableColumns">
<!--          <template #row="props">-->
<!--            {{props.repoId}}-->
<!--          </template>-->
<!--          <el-table-column label="出库仓库" >-->
<!--            <template #default="props">-->
<!--              <el-form-item label-width="0" :prop="'sale_order_item.'+props.$index+'.repoId'" :rules="dialogFormRules.repoId">-->
<!--                <repo-select-v2 v-model="props.row.repoId" :goods-id="props.row.goodsId" :is-edit="props.row.isEdit"/>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="出库产品" >-->
<!--            <template #default="props">-->
<!--              <el-form-item label-width="0" :prop="'sale_order_item.'+props.$index+'.goodsId'"-->
<!--                            :rules="dialogFormRules.goodsId">-->
<!--                <goods-select-v2 v-model="props.row.goodsId" :repo-id="props.row.repoId" @change="getReferInfo(props.$index)" :is-edit="props.row.isEdit"/>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="库存剩余" >-->
<!--            <template #default="props">-->
<!--              <el-form-item>-->
<!--                <span>{{props.row.stock?.totalCount}}</span>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="出库数量" >-->
<!--            <template #default="props">-->
<!--              <el-form-item label-width="0" :prop="'sale_order_item.'+props.$index+'.amount'" :rules="dialogFormRules.amount">-->
<!--                <el-input-number v-model.number="props.row.amount" @change="getTotalPrice(props.$index)" :min="0"-->
<!--                                 :max="props.row.maxAmount"-->
<!--                                 style="width:100%" clearable placeholder="请输入出库数量"-->
<!--                :disabled="!(props.row.goodsId && props.row.repoId)"-->
<!--                                 v-if="props.row.isEdit"-->
<!--                >-->
<!--                </el-input-number>-->
<!--                <span v-else>{{props.row.amount}}</span>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="单价" >-->
<!--            <template #default="props">-->
<!--              <el-form-item label-width="0" :prop="'sale_order_item.'+props.$index+'.price'" :rules="dialogFormRules.price">-->
<!--                <input v-model.number="props.row.price"-->
<!--                       type="number"-->
<!--                       :min="0"-->
<!--                       :step="0.01"-->
<!--                       oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"-->
<!--                       @change="getTotalPrice(props.$index)"-->
<!--                                 style="width:100%" clearable placeholder="请输入单价"-->
<!--                                 :disabled="!(props.row.goodsId && props.row.repoId)"-->
<!--                                 v-if="props.row.isEdit"-->
<!--                />-->
<!--                <span v-else>{{props.row.price?.toFixed(2)??0}}</span>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column label="预设售价" >-->
<!--            <template #default="props">-->
<!--              <el-form-item>-->
<!--                <span>{{props.row.stock?.goods?.salePrice?.toFixed(2)??0}}</span>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->

<!--          <el-table-column label="总售价"  fixed="right">-->
<!--            <template #default="props">-->
<!--              <el-form-item> {{props.row.totalPrice?.toFixed(2)??0}}</el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->

<!--          <el-table-column label="操作" width="200" fixed="right">-->
<!--            <template #default="props">-->
<!--              <el-form-item label-width="0">-->
<!--                <el-button size="small" type="primary" @click="handleConfirm(props.row)">{{props.row.isEdit ? '确认': '编辑' }}</el-button>-->
<!--                <el-popconfirm title="确定要删除吗?" @confirm="removeOutboundDetail(props.$index)" confirm-button-text="确定"-->
<!--                               cancel-button-text="取消">-->
<!--                  <template #reference>-->
<!--                    <el-button size="small" type="danger" icon="Delete">删除</el-button>-->
<!--                  </template>-->
<!--                </el-popconfirm>-->
<!--              </el-form-item>-->
<!--            </template>-->
<!--          </el-table-column>-->

        </el-table-v2>
          </template>
        </el-auto-resizer>
        </div>
      </el-form-item>

      <el-form-item label-width='0'>
        <el-button type="text"  icon="CirclePlus" @click="addOutboundDetailList()">添加出库产品</el-button>
      </el-form-item>
      <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="人工费：" prop="otherFee">
            <input v-model="dialogForm.otherFee"
                   type="number"
                   :min="0"
                   :step="0.01"
                   oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
                   placeholder="请输入人工费用"
                             @change="calculateTotalPrice"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="已付款：" prop="payPrice">
            <input v-model="dialogForm.payOtherFee"
                   type="number"
                   :min="0"
                   :step="0.01"
                   oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
                   placeholder="请输入已付款"
                             style="width:100%"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="总成本：" prop="totalPrice">
            <div class="form-pre-flex">
              {{dialogForm.totalPrice?.toFixed(2)??0}}
            </div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
          <el-form-item label="已付款：" prop="payPrice">
            <input v-model="dialogForm.payPrice"
                   type="number"
                   :min="0"
                   :step="0.01"
                   oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
                   placeholder="请输入已付款"
                             style="width:100%"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="备注：" prop="descs">
            <el-input v-model.trim="dialogForm.descs" type="textarea" :rows="4" show-word-limit maxlength="50"
                      clearable placeholder="请输入备注信息">
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="已付清">
          <el-checkbox v-model="dialogForm.confirm"/>
        </el-form-item>
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
import {reactive, toRefs, ref, nextTick, toRaw, h} from 'vue'
import moment from 'moment'
import {
  getOutboundList,
  updateOutboundList,
  addOutboundList,
  deleteOutboundList,
  stockDetail, getInventoryList,
} from '@/api/common'
import {formatJson, globalLoading, showMessage} from '@/utils'
import _ from 'lodash'
import CustomerSelect from "@temp/CustomerSelect";
import RepoSelectV2 from "@temp/RepoSelectV2";
import GoodsSelectV2 from "@temp/GoodsSelectV2";
import {math} from "@/utils";
import UserSelect from "@temp/UserSelect";
import {exportJson2Excel} from "@/utils/excel";
import {ElButton, ElFormItem, ElInputNumber, ElPopconfirm} from "element-plus";
export default {
  name: 'outboundManage',
  components: {UserSelect, GoodsSelectV2, RepoSelectV2, CustomerSelect},
  setup(props, context) {

    const state = reactive({
      tableData: [],
      dialogVisible: false,// 修改、新增产品dialog
      isEdit: false,
      saveLoading: false,
      currentEditData: {},// 当前修改数据
      loadignData: false,//加载 产品loading
      queryForm: {
        code: '',
        startDate: moment(new Date(+new Date() - 365 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
        endDate: '',
        userId: '',
        customerId: '',//供货商
        overdraft: false
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loadTable: false,
      detailsShow: true
    })
    //出库单数据
    const getSupplierFormData = () => ({
      code: '' + moment(new Date()).format('YYYYMMDDHHmmss'),//出库单编号
      date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),//出库日期
      userId: '',// 操作人id
      customerId: '',// 客户id
      totalPrice: 0,// 总价
      payPrice: 0, // 已付款
      otherFee: 0, // 人工费
      payOtherFee: 0, // 人工费
      descs: '', // 备注信息
      confirm: false, //实付付清
      sale_order_item: [{
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
      async exportExcel() {
        const tHeader = ['订单号', '客户', '人工应付', '人工实付', '商品应付', '商品实付', '总计欠款']
        const filterVal = ['code', 'sale_customer.name', 'otherFee', 'payOtherFee', 'totalPrice', 'payPrice', 'totalOverdraft']
        const params = Object.assign({}, state.queryForm)
        const responseData = await getOutboundList(params)
        if (responseData.code === 200) {
          const list = responseData.message.records
          const data = formatJson(filterVal, list)
          exportJson2Excel(tHeader, data)
        }
      },
      async handleConfirm(row) {
        if (row.isEdit) {
          const loading = globalLoading({
            text: '保存中'
          })
          await methods.handlerSave(false).finally(()=> {
            loading.close()
          })
        }
        row.isEdit = !row.isEdit
      },
      getTotalPrice(index) {
        const curOutboundDetail = dialogForm.sale_order_item[index]
        dialogForm.sale_order_item[index].totalPrice = Number(math.evaluate(`${curOutboundDetail.amount} * ${curOutboundDetail.price}`).valueOf())
        this.calculateTotalPrice()
      },
      async getReferInfo(index) {
        const curOutboundDetail = dialogForm.sale_order_item[index]
        const {repoId, goodsId} = curOutboundDetail
        if (repoId && goodsId) {
          const {code, message} = await stockDetail(curOutboundDetail)
          if (code === 200) {
            dialogForm.sale_order_item[index].stock = message
            dialogForm.sale_order_item[index].maxAmount = message.totalCount + curOutboundDetail.amount
            // dialogForm.sale_order_item[index].price = message.goods.salePrice
          }
        }
      },
      /**
       * 计算总价格
       */
      calculateTotalPrice() {
        const totalPrice = dialogForm.sale_order_item.reduce((total, c) => math.evaluate(
            `${total} + ${c.totalPrice}`
        ), 0).valueOf()
        // 总价格
        dialogForm.totalPrice = Number(totalPrice)
        // 已付款
        dialogForm.payPrice = Number(totalPrice)
      },
      /**
       * 移除出库明细
       */
      removeOutboundDetail(index) {
        dialogForm.sale_order_item.splice(index, 1)
        methods.calculateTotalPrice()
      },
      /**
       * 新增出库产品明细
       * 添加一个子级明细
       */
      addOutboundDetailList() {
        dialogForm.sale_order_item.push({
          repoId: '',
          amount: 0,
          totalPrice: 0,//采购成本
          price: 0,//单价
          isEdit: true
        })
        this.$nextTick(()=> {
          tableRef.value?.scrollToRow(dialogForm.sale_order_item.length)
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
          dialogForm.sale_order_item = [{
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
        const resDel = await deleteOutboundList(updateOutbound).finally(() => {
          loading.close()
        })

        showMessage(resDel.code === 200 ? 'success' : 'error', resDel.message)
        resDel.code === 200 && this.getTableData()
      },
      //保存
      handlerSave(close=true) {
        const loading = globalLoading({
          text: '保存中'
        })
        return new Promise((resolve, reject) => {
          dialogRef.value.validate(async (valid) => {
            if (valid) {
              const params = Object.assign({}, dialogForm)
              const responseData = state.isEdit ? await updateOutboundList(params) : await addOutboundList(params);
              state.saveLoading = false
              // 刷新表格
              if (responseData.code === 200) {
                this.getTableData()
                if (!state.isEdit) {
                  state.isEdit = true
                  dialogForm.id = responseData.data.id
                }
              }
              //显示提示信息
              showMessage(responseData.code === 200 ? 'success' : 'error', responseData.message)
              if (
                  close
              ) {
                responseData.code === 200 && (state.dialogVisible = false)
              }
              if (responseData.code === 200) {
                resolve(true)
              } else {
                reject(false)
              }
            }
            else {
              reject(false)
            }
          })
        }).finally(()=> {
          loading.close()
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
      },
      reloadTable() {
        state.detailsShow = false
        nextTick(()=> {
          state.detailsShow = true
        })
      }
    }
    //查询批次列表
    methods.getTableData()
    const tableRef = ref()

    return {
      tableRef,
      tableColumns: [{
        key: 'repoId',
        title: '出库仓库',
        width: 150,
        cellRenderer: (props)=> {
          return h(
              ElFormItem,
              {
                labelWidth: 0,
                prop: 'sale_order_item.'+props.rowIndex+'.repoId',
                rules: dialogFormRules.repoId,
              },
              {
                default: ()=> {
                  return h(
                      RepoSelectV2,
                      {
                        goodsId: props.rowData.goodsId,
                        isEdit: props.rowData.isEdit,
                        modelValue: props.rowData.repoId,
                        ['onUpdate:modelValue']: (val)=> {
                          props.rowData.repoId = val
                        }
                      }
                  )
                }
              }
          )
        }
      },
        {
          key: 'goodsId',
          title: '出库产品',
          width: 150,
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                  labelWidth: 0,
                  prop: 'sale_order_item.'+props.rowIndex+'.goodsId',
                  rules: dialogFormRules.goodsId,
                },
                {
                  default: ()=> {
                    return h(
                        GoodsSelectV2,
                        {
                          repoId: props.rowData.repoId,
                          isEdit: props.rowData.isEdit,
                          modelValue: props.rowData.goodsId,
                          ['onUpdate:modelValue']: (val)=> {
                            props.rowData.goodsId=val
                          },
                          ['onChange']:()=> {
                            methods.getReferInfo(props.rowIndex)
                          }
                        }
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '库存剩余',
          width: 150,
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                },
                {
                  default: ()=> {
                    return h(
                        'span',
                        {
                        },
                        props.rowData.stock?.totalCount
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '出库数量',
          width: 150,
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                  labelWidth: 0,
                  prop: 'sale_order_item.'+props.rowIndex+'.amount',
                  rules: dialogFormRules.amount,
                },
                {
                  default: ()=> {
                    return props.rowData.isEdit? h(
                        ElInputNumber,
                        {
                          disabled: !(props.rowData.goodsId && props.rowData.repoId),
                          modelValue: props.rowData.amount,
                          min: 0,
                          max: props.rowData.maxAmount,
                          ['onUpdate:modelValue']: (val)=> {
                            props.rowData.amount = val
                          },
                          ['onChange']:()=> {
                            methods.getTotalPrice(props.rowIndex)
                          }
                        }
                    ): h(
                        'span',
                        {},
                        props.rowData.amount
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '单价',
          width: 150,
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                  labelWidth: 0,
                  prop: 'sale_order_item.'+props.rowIndex+'.price',
                  rules: dialogFormRules.price,
                },
                {
                  default: ()=> {
                    return props.rowData.isEdit? h(
                        ElInputNumber,
                        {
                          clearable: true,
                          placeholder: '请输入单价',
                          style: 'width:100%',
                          disabled: !(props.rowData.goodsId && props.rowData.repoId),
                          type: 'number',
                          modelValue: props.rowData.price,
                          min: 0,
                          step: 0.01,
                          ['onUpdate:modelValue']: (val)=> {
                            props.rowData.price = val
                          },
                          ['oninput']: (value)=> {
                            value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')
                          },
                          ['onChange']: ()=> {
                            methods.getTotalPrice(props.rowIndex)
                          }
                        }
                    ): h(
                        'span',
                        {},
                        props.rowData.price
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '预设售价',
          width: 150,
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                },
                {
                  default: ()=> {
                    return h(
                        'span',
                        {
                        },
                        props.rowData.stock?.goods?.salePrice?.toFixed(2)??0
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '总售价',
          width: 150,
          fixed: 'right',
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                },
                {
                  default: ()=> {
                    return h(
                        'span',
                        {
                        },
                        props.rowData.totalPrice?.toFixed(2)??0
                    )
                  }
                }
            )
          }
        },
        {
          // key: 'goodsId',
          title: '操作',
          width: 200,
          fixed: 'right',
          cellRenderer: (props)=> {
            
            return h(
                ElFormItem,
                {
                },
                {
                  default: ()=> {
                    return [
                        h(ElButton, {
                          size: 'small',
                          type: 'primary',
                          ['onClick']: ()=> {
                          methods.handleConfirm(props.rowData)
                          }
                        }, props.rowData.isEdit ? '确认': '编辑'),
                      h(ElPopconfirm, {
                        title: '确定要删除吗?',
                        ['onConfirm']: ()=> {
                          methods.removeOutboundDetail(props.rowIndex)
                        },
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                      }, {
                        reference: ()=> {
                          return h(ElButton, {
                            size: 'small',
                            type: 'danger',
                            icon: 'Delete'
                          }, '删除')
                        }
                      })
                    ]
                  }
                }
            )
          }
        },
        ],
      ...methods,
      ...toRefs(state), //抛出
      dialogFormRules,
      dialogForm,
      dialogRef,
      moment,
       getSummaries: (param) => {
        const { columns, data } = param
        const sums = []
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = 'Total Cost'
            return
          }
          const values = data.map((item) => Number(item[column.property]))
          if (!values.every((value) => Number.isNaN(value))) {
            sums[index] = `${values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!Number.isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0).toFixed(2)}`
          } else {
            sums[index] = 'N/A'
          }
        })

        return sums
      }
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
