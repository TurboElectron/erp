<!--  -->
 <template>
  <el-form :inline="true" size="small" :model="queryForm" class="demo-form-inline">
    <el-form-item label="供应商：">
      <supplier-select v-model="queryForm.supplierId" />
    </el-form-item>

    <el-form-item label="开始时间：" prop="startDate">
      <el-date-picker v-model="queryForm.startDate" type="datetime" format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss" placeholder="出库开始时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间：" prop="endDate">
      <el-date-picker v-model="queryForm.endDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
        type="datetime" placeholder="出库结束时间">
      </el-date-picker>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" icon="Search" @click="getRakingData()">查询</el-button>
    </el-form-item>

  </el-form>

  <el-table :data="allRakingData" v-loading="loadingTbl" style="width: 100%" border empty-text="暂无数据">
    <el-table-column prop="supplier.name" label="姓名" />
    <el-table-column prop="totalPrice" label="总金额" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="payPrice" label="总支付" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="allDebt" label="总欠款" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="date" label="时间">
      <template #default="scope">
        {{moment(scope.row.date).format('YYYY-MM-DD HH:mm:ss')}}
      </template>
    </el-table-column>
  </el-table>
  <div>
    <el-divider>客户购买力柱状图</el-divider>
    <BaseCharts :chartsData="rakingData" charts-type="bar" style="height:410px" v-loading="loadingTbl" />
  </div>
</template>

  <script>
import { reactive, toRefs } from 'vue'
import BaseCharts from '@temp/BaseCharts.vue'
import { getSupplierRaking} from '@/api/common'
import moment from "moment";
import SupplierSelect from "@temp/SupplierSelect";
export default {
  name: 'supplierAnalysis',
  components: {
    SupplierSelect,
    BaseCharts
  },
  setup(props, context) {
    let state = reactive({
      queryForm: {
        supplierId: '',
        startDate: '',
        endDate: ''
      },
      allRakingData: [],//消费排名折线图数据
      scatterData: {
        title: '购买商品离散图',
        data: []
      },//散点图数据
      rakingData: {
        title: '客户支付力统计',
        labelType: 'inside',
        xAxisData: [],
        data: []
      },
      loadingTbl: false,
      loadignData: false,//查询客户
      scatterType: 'month',//商品销售分布图统计类型
      loadingScatter: false
    })

    const methods = {
      /**
       * 获取排名前五十客户 以及搜索
       */
      getRakingData() {
        state.loadingTbl = true
        const res = getSupplierRaking(state.queryForm).then(res => {
          if (res.code === 200) {
            const resData = res.message;
            state.allRakingData = res.message;
            state.rakingData.xAxisData = resData.map(v => v.supplier.name)
            state.rakingData.data = [{
              name: '购买力',
              color: '#2184e7',
              data: resData.map(v => ({
                value: v.totalPrice?.toFixed(2),
                unitName: '元'
              }))
            }, {
              name: '支付力',
              color: '#34bfa3',
              data: resData.map(v => ({
                value: v.payPrice?.toFixed(2),
                unitName: '元'
              }))
            }, {
              name: '欠款',
              color: '#f4516c',
              data: resData.map(v => ({
                value: v.allDebt?.toFixed(2),
                unitName: '元'
              }))
            }]
            console.log(state.rakingData.data)
          }
        }).finally(() => {
          state.loadingTbl = false
        })
      },
    }

    //获取排名前五十的客户数据
    methods.getRakingData()
    return {
      ...toRefs(state), //抛出
      ...methods,
      moment
    }
  },
}
  </script>
  <style lang='scss' scoped>
.total-item-layout {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
}
</style>
