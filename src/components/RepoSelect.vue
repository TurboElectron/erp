<template>
  <el-select
      v-model="repoId"
      filterable
      remote
      placeholder="请输入仓库名称"
      :remote-method="search"
      :loading="loading"
      @focus="()=> search()"
  >
    <el-option
        v-for="item in data?.message?.records??[]"
        :key="item.id"
        :label="`${item.name}`"
        :value="item.id"
    >
    </el-option>
  </el-select>
</template>
<script>
export default {
  name: 'repo-select'
}
</script>
<script setup>
import {defineProps, ref, defineEmits, unref, watch} from "vue";
import {useVModel} from '@vueuse/core'
import {getRepoList} from "@api/common";
import {useRequest} from 'vue-request'

const props = defineProps({
  modelValue: {
    type: [Number, String]
  }
})
const emit = defineEmits(['update:modelValue'])
const repoId = useVModel(props,'modelValue', emit )
const params = ref({
})
const {data, loading, run} =useRequest(()=> getRepoList(unref(params)), {manual:true})
watch(repoId, (val)=> {
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
