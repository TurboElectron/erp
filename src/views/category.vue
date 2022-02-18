<!--  -->
 <template>
   <v-contextmenu ref="contextmenu">
     <v-contextmenu-item @click="handlerAdd(currentEditData)">新增</v-contextmenu-item>
     <v-contextmenu-item @click="handlerEdit(currentEditData)">修改</v-contextmenu-item>
     <v-contextmenu-item @click="handlerDelete(currentEditData)">删除</v-contextmenu-item>
   </v-contextmenu>
  <div style="display: flex;flex-direction: column;height: 100%;">
    <el-form :inline="true" size="small" class="demo-form-inline">
      <el-form-item>
        <el-button  type="primary" icon="Plus" @click="handlerAdd({})">新增分类</el-button>
        <el-button  type="primary" icon="Plus" @click="$refs.goodsRef.addGoods()" :disabled="!currentEditData.id">新增产品</el-button>
        <goods-select v-model="goodsId" is-edit style="margin: 0 20px"/>
        <el-button  type="primary"  @click="$refs.goodsRef.onQuery({id: goodsId})">查找</el-button>
      </el-form-item>
    </el-form>
    <div style="flex: 1 0 auto;  height: 0;display: flex;gap: 20px;overflow:auto">
        <el-tree
          :data="treeData"
          node-key="id"
          :expand-on-click-node="true"
          :highlight-current="true"
          @node-click="handleClickNode"
          style="overflow: auto;height:100%"
      >
        <template #default="{ node, data }">
          <div v-contextmenu:contextmenu @contextmenu="currentEditData = data">{{ node.label }}</div>
        </template>
      </el-tree>
      <goods :cid="currentEditData.id" ref="goodsRef" />
    </div>
  </div>

  <!-- 新增产品分类 dialog -->
  <el-dialog v-model="dialogVisible" width="500px" :title="isEdit?'修改产品类别':'新增产品分类'" :before-close="resetDialogForm">
    <el-form size="small" ref="dialogRef" :model="dialogForm" :rules="dialogFormRules" class="demo-form-inline">
      <el-form-item label="产品分类：" prop="label">
        <el-input v-model="dialogForm.label" clearable placeholder="请输入产品名称"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">关闭</el-button>
        <el-button size="small" :loading="saveLoading" type="primary" @click="handlerSava()">保存</el-button>
      </span>
    </template>
  </el-dialog>

</template>

  <script>
import { reactive, toRefs, ref } from 'vue'
import { getCategoryTree, addCategory, updateCategory, deleteCategory } from '@/api/common'
import { globalLoading, showMessage } from '@/utils'
import Goods from "@/views/goods";
import GoodsSelect from "@temp/GoodsSelect";
export default {
  name: 'category',
  components: {GoodsSelect, Goods},
  setup(props, context) {
    const state = reactive({
      treeData: [],
      tableData: [],
      dialogVisible: false,// 修改、新增产品dialog
      isEdit: false,
      saveLoading: false,
      currentEditData: {},//当前修改数据
      goodsId: undefined
    })
    const goodsRef = ref()
    // 新增、修改form
    const dialogForm = reactive({
      label: ''
    })
    // 新增、修改formRules
    const dialogFormRules = {
      label: [{
        required: true, message: '请输入产品名称', trigger: 'blur',
      }],
    }
    // 新增、修改dialog ref
    const dialogRef = ref(null)
    const methods = {
      handleClickNode(node){
        state.currentEditData = node
        goodsRef.value.onQuery({cid: node.id})
      },
      /**
       * 修改产品
       */
      handlerEdit(item) {
        state.isEdit = true
        state.currentEditData = item
        dialogForm.label = item.label
        state.dialogVisible = true
      },
      /**
       * 新增类别
       * @param {*} item 当前操作数据
       */
      handlerAdd(item = {}) {
        state.currentEditData = item
        dialogForm.label = ''
        state.isEdit = false
        state.dialogVisible = true
      },
      /**
       * 删除
       */
      async handlerDelete(item) {
        const loading = globalLoading()
        const res = await deleteCategory(item.id)
        loading.close()
        showMessage(res.code === 200 ? 'success' : 'error', res.message)
        res.code === 200 && handlerGetCategory()
      },
      //保存
      async handlerSava() {
        const params = {
          label: dialogForm.label,
          pid: state.currentEditData?.pid ?? null
        }
        //修改参数添加id
        state.isEdit && (params.id = state.currentEditData.id)
        !state.isEdit && (params.pid = state.currentEditData.id)
        state.saveLoading = true
        const responseData = state.isEdit ? await updateCategory(params) : await addCategory(params);
        state.saveLoading = false
        // 刷新表格
        responseData.code === 200 && handlerGetCategory()
        //显示提示信息
        showMessage(responseData.code === 200 ? 'success' : 'error', responseData.message)
        responseData.code === 200 && (state.dialogVisible = false)
      },
      /**
       * 关闭dialog 之前 重置form
       */
      resetDialogForm(done) {
        dialogRef.value.resetFields()
        done()
      }
    }
    /**
     * 获取产品分类树
     */
    const handlerGetCategory = async () => {
      const categorytreeData = await getCategoryTree()
      state.treeData = categorytreeData.message
    }
    //加载产品类别数据
    handlerGetCategory()

    return {
      ...methods,
      ...toRefs(state), //抛出
      dialogFormRules,
      dialogForm,
      dialogRef,
      goodsRef
    }
  },
}
  </script>
  <style lang='scss' scoped></style>
