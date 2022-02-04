<!--  -->
<template>
  <el-form :inline="true" size="small" :model="queryForm" class="demo-form-inline">
    <el-form-item label="商品：">
      <goods-select-v2  v-model="queryForm.goodsId" :repo-id="queryForm.repoId" is-edit/>
    </el-form-item>
    <el-form-item label="仓库">
      <repo-select-v2 v-model="queryForm.repoId" :goods-id="queryForm.goodsId" is-edit/>
    </el-form-item>

    <el-form-item label="开始时间：" prop="startDate">
      <el-date-picker v-model="queryForm.startDate" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss" placeholder="录入订单开始时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间：" prop="endDate">
      <el-date-picker v-model="queryForm.endDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      type="datetime" placeholder="录入订单结束时间">
      </el-date-picker>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" icon="Search" @click="getTableData">查询</el-button>
    </el-form-item>

  </el-form>
  <!-- 表格 -->
  <el-table :data="tableData" v-loading="loadTable" show-summary style="width: 100%" border empty-text="暂无数据">
    <el-table-column prop="repo.name" label="仓库名称" />
    <el-table-column prop="goods.name" label="商品名称" />
    <el-table-column prop="amount" label="数量"></el-table-column>
    <el-table-column prop="totalPrice" label="总价"></el-table-column>
    <el-table-column prop="sale_order.date" label="时间">
      <template #default="scope">
        {{moment(scope.row.sale_order.date).format('YYYY-MM-DD HH:mm:ss')}}
      </template>
    </el-table-column>
  </el-table>
  <el-pagination v-model:currentPage="currentPage" :page-sizes="[10, 20, 30, 50]" :page-size="pageSize"
                 layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="v=>handleSizeChange(v)"
                 @current-change="v=>handleCurrentChange(v)">
  </el-pagination>

</template>

<script>
import { reactive, toRefs, onMounted } from 'vue';
import moment from 'moment'
import {geOutboundClassify} from '@/api/common'
import RepoSelect from "@temp/RepoSelect";
import GoodsSelect from "@temp/GoodsSelect";
import RepoSelectV2 from "@temp/RepoSelectV2";
import GoodsSelectV2 from "@temp/GoodsSelectV2";
export default {
  name: 'grnTotal',
  components: {GoodsSelectV2, RepoSelectV2, GoodsSelect, RepoSelect},
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
        startDate: moment(new Date(+new Date() - 30 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
        endDate: '',
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      loadTable: true,
      categoryData: [],
      repoData: []
    });
    /**
     * 方法
     */
    const methods = {
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
        const res = await geOutboundClassify(params)
        res.code === 200 && (state.tableData = res.message.records) && (state.total = res.message.total)
        state.loadTable = false
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
    onMounted(() => {
      //查询客户数据
      methods.getTableData()

    })
    return {
      ...toRefs(state),
      ...methods,
      moment
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
