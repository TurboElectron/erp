<template>
  <div style="width: 80%;height:100%;overflow:auto;display:flex;flex-direction:column">
    <el-table :data="tableData"  v-loading="loadingTbl"  border empty-text="暂无数据" style="height:0;flex:1 0 auto;overflow:auto">
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button icon="Edit" size="small" @click.prevent="editGoods(scope.row)">
            修改
          </el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="deleteGoods(scope.row)" confirm-button-text="确定"
                         cancel-button-text="取消">
            <template #reference>
              <el-button type="danger" size="small" icon="Delete">
                删除
              </el-button>
            </template>
          </el-popconfirm>

        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" width="100" />
      <el-table-column prop="code" label="编号" width="120" />
      <el-table-column prop="buyPrice" label="预设进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
      <el-table-column prop="salePrice" label="预设售价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
      <el-table-column prop="type" label="型号" />
      <el-table-column prop="brand" label="品牌" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="color" label="颜色" />
      <el-table-column prop="standard" label="规格" />
      <el-table-column prop="material" label="材质" />
      <el-table-column prop="descs" label="描述" />
    </el-table>
    <el-pagination v-model:currentPage="currentPage" :page-sizes="[10, 20, 30, 50,300, 500]" :page-size="pageSize"
                   layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                   @current-change="handleCurrentChange">
    </el-pagination>
  </div>

  <!-- 新增产品 dialog -->
  <el-dialog v-model="goodsDailog" width="500px" :title="isEditGoods?'修改产品：'+goodsDialogForm.name:'新增产品'"
             :before-close="resetDialogForm">
    <el-form size="small" ref="goodsDialogRef" :model="goodsDialogForm" :rules="goodsDialogFormRules"
             class="demo-form-inline">
      <el-form-item label="产品名称：" prop="name">
        <el-input v-model="goodsDialogForm.name"  show-word-limit clearable placeholder="请输入产品名称">
        </el-input>
      </el-form-item>
      <el-form-item label="产品编号：" prop="code">
        <el-input v-model="goodsDialogForm.code" show-word-limit clearable placeholder="请输入产品编号">
        </el-input>
      </el-form-item>
      <el-form-item label="预设进价：" prop="buyPrice">
        <el-input-number v-model.number="goodsDialogForm.buyPrice"  :precision="2" clearable placeholder="请输入预设进价"></el-input-number>
      </el-form-item>
      <el-form-item label="预设售价：" prop="salePrice">
        <el-input-number v-model.number="goodsDialogForm.salePrice"  :precision="2" clearable placeholder="请输入预设售价"></el-input-number>
      </el-form-item>
      <el-form-item label="产品型号：" prop="type">
        <el-input v-model="goodsDialogForm.type" show-word-limit clearable placeholder="请输入产品型号">
        </el-input>
      </el-form-item>
      <el-form-item label="品牌名称：" prop="brand">
        <el-input v-model="goodsDialogForm.brand"  clearable placeholder="请输入品牌名称"></el-input>
      </el-form-item>
      <el-form-item label="单位：" prop="unit">
        <el-input v-model="goodsDialogForm.unit"  clearable placeholder="请输入单位"></el-input>
      </el-form-item>
      <el-form-item label="颜色：" prop="color">
        <el-input v-model="goodsDialogForm.color"  clearable placeholder="请输入颜色"></el-input>
      </el-form-item>
      <el-form-item label="规格：" prop="standard">
        <el-input v-model="goodsDialogForm.standard"  clearable placeholder="请输入规格"></el-input>
      </el-form-item>
      <el-form-item label="材质：" prop="material">
        <el-input v-model="goodsDialogForm.material"  clearable placeholder="请输入材质"></el-input>
      </el-form-item>
      <el-form-item label="备注信息：" prop="descs">
        <el-input v-model="goodsDialogForm.descs" maxlength="50" show-word-limit autocomplete="off" :rows="3"
                  type="textarea" clearable placeholder="请输入备注信息">
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="goodsDailog = false">关闭</el-button>
        <el-button size="small" :loading="saveLoading" type="primary" @click="saveGoods()" :disabled="saveLoading">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { reactive, toRefs, ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElLoading } from "element-plus";
import { globalLoading, showMessage } from '@/utils'
import { addGoods, updateGoods, removeGoods, goodsList } from '@/api/common'
export default {
  name: 'goods',
  props: {
    cid:Number
  },
  setup(props) {
    //新增产品数据
    const getGoodsDialogFormValues = () => {
      return {
        cid: props.cid,
        name: '',
        type: '',
        code: '',
        brand: '',
        unit: '',
        color: '',
        material:'',
        standard: '',
        buyPrice: 0,
        salePrice: 0,
        descs: '',
      }
    }
    // goodsDialog ref
    const goodsDialogRef = ref();
    const passDialogRef = ref();
    /**
     * 数据
     */
    let data = reactive({
      /**
       * 查询数据
       */
      formInline: {
        name: '',
      },
      tableData: [],
      currentPage: 1,//当前页数
      pageSize: 10,
      total: 0,
      loadingTbl: true,
      goodsDailog: false,//操作产品dialog

      goodsDialogForm: getGoodsDialogFormValues(),
      editGoodsId: '',//当前修改产品id
      isEditGoods: false,
      saveLoading: false//保存时确定按钮的loading
    });

    /**
     * 新增产品 rules
     */
    const goodsDialogRules = reactive({
      goodsDialogFormRules: {
        name: [{
          required: true, message: '请输入产品名称', trigger: 'blur',
        }],
        buyPrice: [{
          required: true, message: '请输入预设进价', trigger: 'blur',
        }],
        salePrice: [{
          required: true, message: '请输入预设售价', trigger: 'blur',
        }],
        // code: [{
        //   required: true, message: '请输入产品编号', trigger: 'blur',
        // }],
      }
    })


    /**
     * 方法
     */
    const methods = {
      /**
       * 查询
       */
      async onQuery(p={}) {
        const params = Object.assign({}, data.formInline, {
          pageSize: data.pageSize,
          pageNo: data.currentPage,
          cid: props.cid,
          ...p
        })
        data.loadingTbl = true
        const responseData = await goodsList(params)
        responseData.code === 200 && (data.tableData = responseData.message.records) && (data.total = responseData.message.total);
        data.loadingTbl = false
      },
      /**
       * 编辑产品
       * @param {*} goodsData 当前产品数据
       */
      editGoods(goodsData) {
        data.isEditGoods = true
        data.goodsDialogForm = Object.assign({}, goodsData)
        data.editGoodsId = goodsData.id;
        data.goodsDailog = true;
      },
      /**
       * 删除产品
       */
      async deleteGoods(goodsData) {
        const loading = globalLoading()
        let res = await removeGoods({ id: goodsData.id });
        loading.close()
        showMessage(res.code === 200 ? 'success' : 'error', res.message)
        //删除成功进行查询
        res.code === 200 && this.onQuery()
      },
      /**
       * 新增产品
       */
      addGoods() {
        if (props.cid) {
          data.goodsDailog = true;
          data.isEditGoods = false;
          handlerResetDialogForm()
        } else {
          showMessage('error','请先选中分类（深蓝色表示选中）')
        }
      },
      /**
       * 关闭dialog 之前 重置form
       */
      resetDialogForm(done) {
        handlerResetDialogForm()
        done()
      },
      /**
       * 保存产品
       */
      saveGoods() {
        goodsDialogRef.value.validate((valid) => {
          if (valid) {
            handlerSaveGoods()
          } else {
            console.log('error submit!!')
            return false
          }
        });
      },

      /**
       * 分页记录数改变
       */
      handleSizeChange(value) {
        data.pageSize = value
        methods.onQuery()
      },
      /**
       * 分页页数改变
       */
      handleCurrentChange(value) {
        data.currentPage = value
        methods.onQuery()
      }
    }
    /**
     * 保存产品信息
     */
    const handlerSaveGoods = async () => {
      try {
        data.saveLoading = true
        //根据标识判断是新增还是修改
        const response = data.isEditGoods ? await updateGoods(data.goodsDialogForm) : await addGoods(data.goodsDialogForm);
        if (response.code === 200) {
          ElMessage.success(response.message);
          //刷新表格
          methods.onQuery()
          //关闭dialog
          data.goodsDailog = false
        } else {
          ElMessage.error(response.message);
        }
      } finally {
        data.saveLoading = false
      }
    }
    const handlerResetDialogForm = () => {
      nextTick(() => {
        goodsDialogRef.value.resetFields()
        data.goodsDialogForm = getGoodsDialogFormValues()
        data.saveLoading = false
      })
    }
    onMounted(() => {
      //查询产品数据
      methods.onQuery()

    })
    return {
      ...toRefs(data),
      ...methods,
      ...toRefs(goodsDialogRules),
      goodsDialogRef
    }
  }
}
</script>
