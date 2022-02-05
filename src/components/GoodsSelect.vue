<template>
  <el-select
      v-model="goodsId"
      filterable
      clearable
      remote
      placeholder="请输入产品编号"
      :remote-method="searchGoods"
      :loading="loading"
      @focus="()=> searchGoods()"
      v-if="isEdit"
  >
    <el-option
        v-for="item in data?.message?.records??[]"
        :key="item.id"
        :label="`${item.code}(${item.name})`"
        :value="item.id"
    >
    </el-option>
    <el-pagination v-model:currentPage="params.pageNo" :page-sizes="[10, 20, 30, 50]" :page-size="params.pageSize"
                   style="width: 100%"
                   layout="prev, pager, next" :total="data?.message?.total??0" @size-change="run"
                   @current-change="run">
    </el-pagination>
  </el-select>
  <span v-else>{{data?.message?.records?.find(_ => _.id === goodsId)?.name}}</span>
</template>
<script>
export default {
  name: 'goods-select'
}
</script>
<script setup>
import {defineProps, ref, defineEmits, unref, watch} from "vue";
import {useVModel} from '@vueuse/core'
import {goodsList} from "@api/common";
import {useRequest} from 'vue-request'

const props = defineProps({
  modelValue: {
    type: [Number, String]
  },
  cid: {
    type: [Number, String]
  },
  isEdit: {
    type: Boolean
  }
})
const emit = defineEmits(['update:modelValue','change'])
const goodsId = useVModel(props,'modelValue', emit )
const params = ref({
  pageSize: 10,
  pageNo: 1,
})
const {data, loading, run} =useRequest(()=> goodsList({
  ...unref(params),
  cid: props.cid
}), {manual:true})
watch(goodsId, (val)=> {
  if (val) {
    params.value.id = val
    emit('change')
    run()
  }
})
const searchGoods = (name)=> {
  params.value.id = undefined
  params.value.code = name
  run()
}
</script>
