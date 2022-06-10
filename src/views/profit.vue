<template>
  <el-form :inline="true" :model="queryForm" label-width="100px" size="small" class="demo-form-inline">
    <el-form-item label="开始时间：">
      <el-date-picker v-model="queryForm.startDate" type="datetime" format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss" placeholder="开始时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间：">
      <el-date-picker v-model="queryForm.endDate" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
                      type="datetime" placeholder="结束时间">
      </el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="run" icon="Search">查询
      </el-button>
    </el-form-item>
  </el-form>
  <el-form v-if="data">
  <el-row >
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
        <el-form-item label="总进价：">
          {{data.message.purchase._sum.totalPrice?.toFixed(2)??0}}
        </el-form-item>
      </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="总售价：">
        {{data.message.sale._sum.totalPrice?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="买入欠款：">
        {{data.message.overdraftPurchase?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="卖出欠款：">
        {{data.message.overdraftSale?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="人工费总额：">
        {{data.message.sale._sum.payOtherFee?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="人工费欠款：">
        {{data.message.overdraftOtherFee?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="营业额：">
        {{data.message.profit?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
    <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
      <el-form-item label="实际营业额（不含欠款）：">
        {{data.message.realProfit?.toFixed(2)??0}}
      </el-form-item>
    </el-col>
  </el-row>
    <el-row>
      <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="6">
        <el-form-item label="库存剩余：" style="color: red;font-weight: bold">
          {{data.message.restStock?.toFixed(2)??0}}
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script setup>

import {getProfit} from "@api/common";
import moment from "moment";
import {computed, ref, unref} from "vue";
import {useRequest} from "vue-request";
const   queryForm = ref({
  startDate: moment(new Date(+new Date() - 30 * 24 * 60 * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
  endDate: '',
},)
const {data, loading, run} = useRequest(()=> getProfit(unref(queryForm)))
</script>
