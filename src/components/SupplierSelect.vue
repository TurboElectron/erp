<template>
  <el-select
      v-model="supplierId"
      filterable
      clearable
      remote
      placeholder="请输入供应商名称"
      :remote-method="search"
      :loading="loading"
      @visible-change="(val)=> {
        if(val) {
           search()
        }
      }"
  >
    <el-option
        v-for="item in data?.message?.records??[]"
        :key="item.id"
        :label="`${item.name}`"
        :value="item.id"
    >
    </el-option>
    <el-pagination v-model:currentPage="params.pageNo" :page-sizes="[10, 20, 30, 50]" :page-size="params.pageSize"
                   style="width: 100%"
                   layout="prev, pager, next" :total="data?.message?.total??0" @size-change="run"
                   @current-change="run">
    </el-pagination>
  </el-select>
</template>
<script>
export default {
  name: 'supplier-select'
}
</script>
<script setup>
import {defineProps, ref, defineEmits, unref, watch} from "vue";
import {useVModel} from '@vueuse/core'
import {getSupplierList, goodsList} from "@api/common";
import {useRequest} from 'vue-request'

const props = defineProps({
  modelValue: {
    type: [Number, String]
  }
})
const emit = defineEmits(['update:modelValue'])
const supplierId = useVModel(props,'modelValue', emit )
const params = ref({
  pageSize: 10,
  pageNo: 1,
})
const {data, loading, run} =useRequest(()=> getSupplierList(unref(params)), {manual:true})
watch(supplierId, (val)=> {
  if (val) {
    params.value.id = val
    run()
  }
})
const search = (name)=> {
  params.value.id = undefined
  params.value.name = name
  run()
}
</script>
