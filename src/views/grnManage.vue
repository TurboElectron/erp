<!--  -->
 <template>
  <el-form :inline="true" :model="queryForm" label-width="100px" size="small" class="demo-form-inline">
    <el-form-item label="入库单号：">
      <el-input v-model="queryForm.code" @keyup.enter.native="getTableData()" clearable placeholder="请输入库单号">
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
      <supplier-select v-model="queryForm.supplierId"/>
    </el-form-item>

    <el-form-item label="操作人：">
      <user-select v-model="queryForm.userId"/>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="getTableData()" icon="Search">查询
      </el-button>
      <el-button icon="Plus" @click="handlerAdd()">新增入库单</el-button>
      <el-button  @click="handlerFix()">修正</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" v-loading="loadTable" row-key="id" border>
    <el-table-column type="expand">
      <template #default="props">
        <div class="grn-detail-list">
          <el-table :data="props.row.purchase_order_item">
            <el-table-column prop="goods.name" label="产品名称"/>
            <el-table-column prop="goods.code" label="产品编号"/>
            <el-table-column prop="amount" label="数量"/>
            <el-table-column prop="goods.unit" label="单位"></el-table-column>
<!--            <el-table-column prop="price" label="进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>-->
            <el-table-column prop="price" label="平均进价" :formatter="(row, column, cellValue, index) => ((row.totalPrice??0) / row.amount)?.toFixed(2)"/>

            <el-table-column prop="totalPrice" label="总价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
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
    <el-table-column prop="purchase_supplier.name" label="供应商" min-width="100"  />
    <el-table-column prop="totalPrice" label="应付" min-width="100" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0" ></el-table-column>
    <el-table-column prop="payPrice" label="实付" min-width="100"   :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
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
  <el-dialog v-model="dialogVisible" width="800px" fullscreen :title="isEdit?'修改入库单':'新增入库单'"
    :before-close="resetDialogForm">
    <el-form size="small" ref="dialogRef" label-width="120px" :model="dialogForm" :rules="dialogFormRules"
      class="demo-form-inline">

      <el-row>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="入库单编号：" prop="code">
            <span v-if="isEdit">{{dialogForm.code}}</span>
            <el-input v-else v-model.trim="dialogForm.code" :maxlength="20" @keyup.enter.native="handlerSave()"
              clearable placeholder="请输入入库单编号">
            </el-input>

          </el-form-item>

        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="入库日期：" prop="date">
            <span v-if="isEdit">{{dialogForm.date}}</span>
            <el-date-picker v-else v-model="dialogForm.date" format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss" type="datetime" placeholder="请选择入库日期" style="width:100%">
            </el-date-picker>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="操作人：" prop="userId">
            <user-select v-model="dialogForm.userId"/>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="4">
          <el-form-item label="供应商：" prop="supplierId">
            <supplier-select v-model="dialogForm.supplierId" />
          </el-form-item>
        </el-col>

      </el-row>
      <el-form-item label-width='0'>
        <el-divider> <span class="grn-detail-title">入库产品明细</span> </el-divider>
      </el-form-item>
      <el-form-item label-width='0'>
        <el-table :data="dialogForm.purchase_order_item" table-layout="auto">
          <el-table-column label="入库产品分类">
            <template #default="props">
              <el-form-item label-width="0" :prop="'purchase_order_item.'+props.$index+'.cid'">
                  <category-select v-model="props.row.cid" :is-edit="props.row.isEdit" :data="data.message??[]"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="入库产品">
            <template #default="props">
              <el-form-item label-width="0" :prop="'purchase_order_item.'+props.$index+'.goodsId'"
                :rules="dialogFormRules.goodsId">
                    <goods-select v-model="props.row.goodsId"  @change="getReferInfo(props.$index)" :is-edit="props.row.isEdit" :cid="props.row.cid"/>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="入库仓库">
            <template #default="props">
              <el-form-item label-width="0" :prop="'purchase_order_item.'+props.$index+'.repoId'" :rules="dialogFormRules.repoId">
                <repo-select v-model="props.row.repoId" :is-edit="props.row.isEdit"/>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="入库数量">
            <template #default="props">
              <el-form-item label-width="0" :prop="'purchase_order_item.'+props.$index+'.amount'" :rules="dialogFormRules.amount">
                <el-input-number v-model.number="props.row.amount" @change="getTotalPrice(props.$index)" :min="0"
                  style="width:100%" clearable placeholder="请输入入库数量"
                                 v-if="props.row.isEdit"
                >
                </el-input-number>
                <span v-else>{{props.row.amount}}</span>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单价" >
            <template #default="props">
              <el-form-item label-width="0" :prop="'purchase_order_item.'+props.$index+'.price'" :rules="dialogFormRules.price">
                <input
                       v-model.number="props.row.price"
                       type="number"
                       :min="0"
                       :step="0.01"
                       oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"
                       @change="getTotalPrice(props.$index)"
                  style="width:100%"  placeholder="请输入单价"
                                 v-if="props.row.isEdit"
                />
                <span v-else>{{props.row.price?.toFixed(2)??0}}</span>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="预设进价" >
            <template #default="props">
              <el-form-item>
                <span>{{props.row.goods?.buyPrice?.toFixed(2)??0}}</span>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="成本"  fixed="right">
            <template #default="props">
              <el-form-item> {{props.row.totalPrice?.toFixed(2)??0}}</el-form-item>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" fixed="right">
            <template #default="props">
              <el-form-item label-width="0" >
                <el-button size="small" type="primary" @click="handleConfirm(props.row)">{{props.row.isEdit ? '确认': '编辑' }}</el-button>

                <el-popconfirm title="确定要删除吗?" @confirm="removeGrnDetail(props.$index)" confirm-button-text="确定"
                               cancel-button-text="取消"  v-if="props.$index!==0">
                  <template #reference>
                    <el-button size="small" type="danger" icon="Delete">删除</el-button>
                  </template>
                </el-popconfirm>
              </el-form-item>
            </template>
          </el-table-column>

        </el-table>
      </el-form-item>

      <el-form-item label-width='0'>
        <el-button type="text"  icon="CirclePlus" @click="addGrnDetailList()">添加入库产品</el-button>
      </el-form-item>

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
import { reactive, toRefs, ref, nextTick, toRaw, watch } from 'vue'
import moment from 'moment'
import {
  getGrnList,
  updateGrnList,
  addGrnList,
  deleteGrnList
  , goodsDetail, getCategoryTree, fixGrn,
} from '@/api/common'
import { globalLoading, showMessage, downLoadFile, getDataById } from '@/utils'
//远程搜索供应商，客户
import _ from 'lodash'
import GoodsSelect from "@temp/GoodsSelect";
import SupplierSelect from "@temp/SupplierSelect";
import RepoSelect from "@temp/RepoSelect";
import {math} from "@/utils";
import CategorySelect from "@temp/CategorySelect";
import UserSelect from "@temp/UserSelect";
import {useRequest} from "vue-request";
import {ElMessage} from "element-plus";

export default {
  name: 'grnManage',
  components: {UserSelect, CategorySelect, RepoSelect, SupplierSelect, GoodsSelect},
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
        supplierId: '',//供货商
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loadTable: false,
    })
    //入库单数据
    const getSupplierFormData = () => ({
      code: '' + moment(new Date()).format('YYYYMMDDHHmmss'),//入库单编号
      date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),//入库日期
      userId: '',// 操作人id
      supplierId: '',// 供应商id
      totalPrice: 0,// 总价
      payPrice: 0, // 已付款
      descs: '', // 备注信息
      purchase_order_item: [{
        cid: undefined,
        goodsId: undefined,
        repoId: undefined,
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
        required: true, message: '请输入入库单编号', trigger: 'blur',
      }],
      date: [{
        required: true, message: '请选择入库日期', trigger: 'change',
      }],
      userId: [{
        required: true, message: '请选择操作人', trigger: 'change',
      }],
      supplierId: [{
        required: true, message: '请选择供应商', trigger: 'change',
      }],
      goodsId: [{
        required: true, message: '请选择入库产品', trigger: 'blur',
      }],
      amount: [{
        required: true, message: '请输入入库数量', trigger: 'blur',
      }, {
        type: 'number',
        min: 1,
        message: '入库数量最小为1',
        trigger: 'blur',
      }],
      repoId: [{
        required: true, message: '请选择仓库', trigger: 'blur',
      }],
    }
    // 新增、修改dialog ref
    const dialogRef = ref(null)
    const methods = {
      async handleConfirm(row) {
        if (row.isEdit) {
          await methods.handlerSave(false)
        }
        row.isEdit = !row.isEdit
      },
      getTotalPrice(index) {
        const curGrnDetail = dialogForm.purchase_order_item[index]
        dialogForm.purchase_order_item[index].totalPrice =  Number(math.evaluate(`${curGrnDetail.amount} * ${curGrnDetail.price}`).valueOf())
        this.calculateTotalPrice()
      },
      async getReferInfo(index) {
        const curGrnDetail = dialogForm.purchase_order_item[index]
        const {goodsId} = curGrnDetail
        if (goodsId) {
          const {code, message} = await goodsDetail({id: goodsId})
          if (code === 200) {
            dialogForm.purchase_order_item[index].goods = message
            // dialogForm.purchase_order_item[index].price = message.buyPrice
            dialogForm.purchase_order_item[index].cid = message.cid
          }
        }
      },
      /**
       * 计算总价格
       */
      calculateTotalPrice() {
        const totalPrice = dialogForm.purchase_order_item.reduce((total, c) => math.evaluate(`${total} + ${c.totalPrice}`), 0).valueOf()
        // 总价格
        dialogForm.totalPrice = Number(totalPrice)
        // 已付款
        dialogForm.payPrice = Number(totalPrice)
      },
      /**
       * 导出
       */
      handleExport() {
        const params = []
        for (const key in state.queryForm) {
          params.push(key + "=" + state.queryForm[key])
        }
        const url = process.env.VUE_APP_URL_API + "/grn/exportGrnList?" + params.join("&")
        downLoadFile(url)
      },
      /**
       * 移除入库明细
       */
      removeGrnDetail(index) {
        dialogForm.purchase_order_item.splice(index, 1)
        methods.calculateTotalPrice()
      },
      /**
       * 新增入库产品明细
       * 添加一个子级明细
       */
      addGrnDetailList() {
        dialogForm.purchase_order_item.push({
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
        const res = await getGrnList(params)
        console.log(res)
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
          dialogForm.purchase_order_item = dialogForm.purchase_order_item.map(p => ({
            ...p,
            price: p.totalPrice / p.amount,
            cid: p.goods.cid
          }))
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
          dialogForm.purchase_order_item = [{
            cid: undefined,
            goodsId: undefined,
            repoId: undefined,
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

       handlerFix() {
         fixGrn().then(()=> {
           ElMessage.success('修正成功')
         }).catch(e => {
           console.log(e)
         })
      },
      /**
       * 删除
       */
      async handlerDelete(item) {
        const loading = globalLoading()
        const updateGrn = _.cloneDeep(item); //JSON.parse(JSON.stringify(toRaw(item)))
        // 状态置为编辑--目的为添加批次id
        state.isEdit = true
        state.isEdit = false
        const resDel = await deleteGrnList(updateGrn).finally(() => {
          loading.close()
        })

        showMessage(resDel.code === 200 ? 'success' : 'error', resDel.message)
        resDel.code === 200 && this.getTableData()
      },
      //保存
      handlerSave(close=true) {
        return new Promise((resolve, reject) => {
          dialogRef.value.validate(async (valid) => {
            if (valid) {
              const params = Object.assign({}, dialogForm)
              const responseData = state.isEdit ? await updateGrnList(params) : await addGrnList(params);
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
    //查询批次列表
    methods.getTableData()
    const {data, loading, run} =useRequest(()=> getCategoryTree(), {manual:false})
    return {
      ...methods,
      ...toRefs(state), //抛出
      dialogFormRules,
      dialogForm,
      dialogRef,
      moment,
      data
    }
  },
}
  </script>
  <style lang='scss' scoped>
.grn-detail-list {
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
.grn-detail-title {
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
