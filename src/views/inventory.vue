<!--  -->
 <template>
  <el-form :inline="true" size="small" :model="queryForm" class="demo-form-inline">
    <el-form-item label="仓库：">
      <repo-select-v2 v-model="queryForm.repoId" :goods-id="queryForm.goodsId" is-edit/>
    </el-form-item>
    <el-form-item label="商品：">
      <goods-select-v2 v-model="queryForm.goodsId" :repo-id="queryForm.repoId" is-edit/>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" icon="Search" @click="onQuery()">查询</el-button>
    </el-form-item>

  </el-form>
  <!-- 表格 -->
  <el-table :data="tableData" v-loading="loadingTbl" show-summary style="width: 100%" border empty-text="暂无数据">
    <el-table-column prop="repo.name" label="仓库名称" />
    <el-table-column prop="goods.name" label="商品名称" />
    <el-table-column prop="goods.code" label="商品编号" />
    <el-table-column prop="totalCount" label="库存总量" />
    <el-table-column prop="totalBuyPrice" label="总进价" />
    <el-table-column prop="totalSalePrice" label="总售价" />
    <el-table-column prop="profit" label="总利润" />
  </el-table>

  <el-pagination v-model:currentPage="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
    layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
    @current-change="handleCurrentChange">
  </el-pagination>

</template>

  <script>
import { reactive, toRefs, onMounted } from 'vue';
import { getInventoryList } from '@/api/common'
import GoodsSelectV2 from "@temp/GoodsSelectV2";
import RepoSelectV2 from "@temp/RepoSelectV2";
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
      },
      tableData: [],
      loadingTbl: true,
      loadingSpecie: false,//加载批次中
      currentPage: 1,//当前页数
      pageSize: 10,
      total: 0,
    });
    /**
     * 方法
     */
    const methods = {
      /**
       * 查询
       */
      async onQuery() {
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
        methods.onQuery()
      },
      /**
       * 分页页数改变
       */
      handleCurrentChange(value) {
        state.currentPage = value
        methods.onQuery()
      }
    }
    onMounted(() => {
      //查询客户数据
      methods.onQuery()

    })
    return {
      ...toRefs(state),
      ...methods
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
