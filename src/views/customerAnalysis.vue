<!--  -->
 <template>
  <el-form :inline="true" size="small" :model="queryForm" class="demo-form-inline">
    <el-form-item label="客户：">
      <customer-select v-model="queryForm.customerId" />
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
    <el-table-column type="expand">
      <template #default="props">
        <div class="outbound-detail-list">
          <el-table :data="props.row.orders">
            <el-table-column type="expand">
              <template #default="props">
                <div class="outbound-detail-list">
                  <el-table :data="props.row.sale_order_item">
                    <el-table-column prop="goods.name" label="产品名称"/>
                    <el-table-column prop="amount" label="数量"/>
                    <el-table-column prop="goods.unit" label="单位"></el-table-column>
                    <el-table-column prop="avgBuyPrice" label="平均进价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
                    <el-table-column prop="price" label="售价" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
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
          </el-table>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="customer.name" label="姓名" />
    <el-table-column prop="otherFee" label="总人工费" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="totalPrice" label="总金额（包含人工）" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="payPrice" label="总支付" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="allDebt" label="总欠款" sortable :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="profit" label="利润（含人工）" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
    <el-table-column prop="netProfit" label="利润" :formatter="(row, column, cellValue, index) => cellValue?.toFixed(2)??0"/>
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

<!--  <div>-->
<!--    <el-divider>购买商品离散图</el-divider>-->
<!--    <div class="total-item-layout">-->
<!--      <label for=""> 统计维度：</label>-->
<!--      <el-radio-group v-model="scatterType" @change="getCategorySalesData" size="small">-->
<!--        <el-radio-button label="day">日</el-radio-button>-->
<!--        <el-radio-button label="month">月</el-radio-button>-->
<!--        <el-radio-button label="year">年</el-radio-button>-->
<!--      </el-radio-group>-->
<!--    </div>-->
<!--    <BaseCharts :chartsData="scatterData" charts-type="scatter" style="height:410px" v-loading="loadingScatter" />-->
<!--  </div>-->

</template>

  <script>
import { reactive, toRefs, toRaw, watch, onMounted, onBeforeUnmount } from 'vue'
import BaseCharts from '@temp/BaseCharts.vue'
import { getCustomerRaking, customerList, getCategorySales } from '@/api/common'
import moment from "moment";
import CustomerSelect from "@temp/CustomerSelect";
export default {
  name: 'customerAnalysis',
  components: {
    CustomerSelect,
    BaseCharts
  },
  setup(props, context) {
    let state = reactive({
      queryForm: {
        customerId: '',
        startDate: '',
        endDate: ''
      },
      customerData: [],//客户数据
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
    /**



/**
 * 获取客户数据
 */
    async function getNormalCustomerData() {
      const res = await customerList({ pageSize: 20, pageNo: 1 })
      res.code === 200 && (state.customerData = res.message.records)// 客户
    }

    const methods = {
      /**
       * 获取排名前五十客户 以及搜索
       */
      getRakingData() {
        state.loadingTbl = true
        const res = getCustomerRaking(state.queryForm).then(res => {
          if (res.code === 200) {
            const resData = res.message;
            state.allRakingData = res.message;
            state.rakingData.xAxisData = resData.map(v => v.customer.name)
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

        //商品分布
        // this.getCategorySalesData()
      },
      /**
       *  按照时间 商品 客户 统计 年月日 内各个商品的销售分布
       */
      async getCategorySalesData() {
        state.loadingScatter = true
        const params = Object.assign({}, toRaw(state.queryForm))
        params.totalType = state.scatterType
        getCategorySales(params).then(res => {
          if (res.code === 200) {
            const scatterData = res.message;
            // 数据按照产品进行分组
            const groupByCategory = scatterData.reduce((p, cur) => {
              const categoryId = cur.categoryId;
              if (!p['category_' + categoryId]) {
                p['category_' + categoryId] = []
              }
              p['category_' + categoryId].push(cur)
              return p
            }, {});
            // x轴数据为日期
            const xAxisData = [...new Set(scatterData.map(v => v.date))]
            let seriesData = [];
            for (const item in groupByCategory) {
              const iterator = groupByCategory[item]
              const seriesItem = {
                name: iterator[0].categoryName,
                data: xAxisData.map(v => {
                  //根据日期查找 数据
                  const curData = iterator.find(cv => cv.date === v)
                  return {
                    value: [v, curData?.allAmount ?? null],
                    unitName: curData?.unitName ?? '',
                    categoryName: curData?.categoryName ?? ''
                  }
                })// iterator.map(v => [v.date, v.allAmount])
              }
              seriesData.push(seriesItem)
            }
            state.scatterData.data = seriesData
            console.log(seriesData)
          }
        }).finally(() => {
          state.loadingScatter = false
        })
      }
    }

    //获取排名前五十的客户数据
    methods.getRakingData()
    // 客户数据
    getNormalCustomerData()
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
