<!--  -->
<template>
  <div style="display: flex;flex-direction: column;height: 100%;">
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
  <div style="flex: 1 0 auto;  height: 0;display: flex;gap: 20px;overflow:auto">
    <div>
      <el-button @click="clearTarget">清除选中</el-button>
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
    </div>
    <div style="width: 80%;height:100%;overflow:auto;display:flex;flex-direction:column">
      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loadTable"  style="height:0;flex:1 0 auto;overflow:auto" border empty-text="暂无数据"
                :summary-method="onSummaryMethod"
      >
        <el-table-column prop="repo.name" label="仓库名称" />
        <el-table-column prop="goods.name" label="商品名称" />
        <el-table-column prop="amount" label="数量"></el-table-column>
        <el-table-column prop="totalPrice" label="总价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"></el-table-column>
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
    </div>
  </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, ref } from 'vue';
import moment from 'moment'
import {geOutboundClassify, getCategoryTree} from '@/api/common'
import RepoSelect from "@temp/RepoSelect";
import GoodsSelect from "@temp/GoodsSelect";
import RepoSelectV2 from "@temp/RepoSelectV2";
import GoodsSelectV2 from "@temp/GoodsSelectV2";
import {onClickOutside} from "@vueuse/core";
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
        startDate: moment(new Date(+new Date() - 365 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
        endDate: '',
        cid: ''
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableData: [],
      loadTable: true,
      categoryData: [],
      repoData: [],
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
      },
      onSummaryMethod({columns, data}) {
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = '总价';
            return;
          }

          const values = data.map(item => Number(item[column.property]));
          if (column.property === 'totalPrice') {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0).toFixed(2);
            sums[index] += ' 元';
          }else{
            sums[index] = '--'
          }

          if (column.property === 'amount') {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            sums[index] += ' ';
          }

        });

        return sums;
      },
      clearTarget() {
        state.queryForm.cid = ''
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

    // onClickOutside(target, (event) => {
    //   state.queryForm.cid = ''
    //   methods.getTableData()
    // })
    return {
      ...toRefs(state),
      ...methods,
      moment,
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
