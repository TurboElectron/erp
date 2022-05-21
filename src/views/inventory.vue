<!--  -->
 <template>
   <div style="display: flex;flex-direction: column;height: 100%;">
   <el-form :inline="true" size="small" :model="queryForm" class="demo-form-inline">
    <el-form-item label="仓库：">
      <repo-select-v2 v-model="queryForm.repoId" :goods-id="queryForm.goodsId" is-edit/>
    </el-form-item>
    <el-form-item label="商品：">
      <goods-select-v2 v-model="queryForm.goodsId" :repo-id="queryForm.repoId" is-edit/>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" icon="Search" @click="getTableData()">查询</el-button>
    </el-form-item>

    <el-form-item>
      <el-button type="primary"  @click="exportExcel()">导出</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"  @click="fix">修正</el-button>
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
           :highlightCurrent="!!queryForm.cid"
           ref="target"
       >
       </el-tree>
       <div style="width: 80%;height:100%;overflow:auto;display:flex;flex-direction:column">
         <!-- 表格 -->
         <el-table :data="tableData" v-loading="loadingTbl"  style="height:0;flex:1 0 auto" border empty-text="暂无数据"
                   @sort-change="handleSortChange"
         >
           <el-table-column prop="repo.name" label="仓库名称" />
           <el-table-column prop="goods.name" label="商品名称" />
           <el-table-column prop="goods.code" label="商品编号" />
           <el-table-column prop="goods.buyPrice" label="预设进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
           <el-table-column prop="goods.salePrice" label="预设售价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
           <el-table-column prop="totalCount" label="库存总量" sortable="custom" />
           <el-table-column prop="saleCount" label="销售总量"  sortable="custom" />
           <el-table-column prop="totalBuyPrice" label="总进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
           <el-table-column prop="avgBuyPrice" label="平均进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
           <el-table-column prop="totalSalePrice" label="总售价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
           <el-table-column prop="profit" label="总利润" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
         </el-table>

         <el-pagination v-model:currentPage="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                        @current-change="handleCurrentChange">
         </el-pagination>
       </div>
     </div>

   </div>
</template>

  <script>
import { reactive, toRefs, onMounted, ref } from 'vue';
import {fixStock, getCategoryTree, getInventoryList} from '@/api/common'
import GoodsSelectV2 from "@temp/GoodsSelectV2";
import RepoSelectV2 from "@temp/RepoSelectV2";
import {exportJson2Excel} from "@/utils/excel";
import {formatJson} from "@/utils";
import {onClickOutside} from "@vueuse/core";
export default {
  name: 'inventory',
  components: {RepoSelectV2, GoodsSelectV2},
  setup() {

    /**
     * 数据
     */
    let state = reactive({
      /**
       * 查询数据
       */
      queryForm: {
        goodsId: '',
        repoId: '',
        orderBy: [],
        cid: ''
      },
      tableData: [],
      loadingTbl: true,
      loadingSpecie: false,//加载批次中
      currentPage: 1,//当前页数
      pageSize: 10,
      total: 0,
      treeData: []
    });
    /**
     * 方法
     */
    const methods = {
      handleClickNode(node){
        state.queryForm.cid = node.id
        methods.getTableData()
      },
      async fix() {
        await fixStock()
        await methods.getTableData()
      },
      async exportExcel() {
        const tHeader = ['仓库名称', '商品名称', '商品编号', '库存']
        const filterVal = ['repo.name', 'goods.name', 'goods.code', 'totalCount']
        const params = Object.assign({}, state.queryForm)
        const responseData = await getInventoryList(params)
        if (responseData.code === 200) {
          const list = responseData.message.records
          const data = formatJson(filterVal, list)
          exportJson2Excel(tHeader, data)
        }
      },
      handleSortChange(val) {
        if (
            val.prop === null
        ) {
          state.queryForm.orderBy.length = 0
        } else {
          const i = state.queryForm.orderBy.findIndex(_ => _.prop === val.prop)
          state.queryForm.orderBy.splice(i, 1, val)
        }
        methods.getTableData()
      },
      /**
       * 查询
       */
      async getTableData() {
        const params = Object.assign({}, state.queryForm, {
          pageSize: state.pageSize,
          pageNo: state.currentPage
        })
        state.loadingTbl = true
        const responseData = await getInventoryList(params)
        if (responseData.code === 200) {
          let tblData = responseData.message.records;
          state.total = responseData.message.total;
          state.tableData = tblData
        }
        state.loadingTbl = false
      },
      /**
      * 分页记录数改变
      */
      handleSizeChange(value) {
        state.pageSize = value
        methods.getTableData()
      },
      /**
       * 分页页数改变
       */
      handleCurrentChange(value) {
        state.currentPage = value
        methods.getTableData()
      }
    }
    onMounted(() => {
      //查询客户数据
      methods.getTableData()

    })
    /**
     * 获取产品分类树
     */
    const handlerGetCategory = async () => {
      const categorytreeData = await getCategoryTree()
      state.treeData = categorytreeData.message
    }
    //加载产品类别数据
    handlerGetCategory()
    const target = ref(null)

    onClickOutside(target, (event) => {
      state.queryForm.cid = ''
      methods.getTableData()
    })
    return {
      ...toRefs(state),
      ...methods,
      target
    }
  }
}
  </script>
  <style lang='scss' scoped>
.charts-line-con {
  width: 100%;
  height: 300px;
  margin: 30px 0;
}
</style>
