<template>
  <el-cascader
      :options="data??[]"
      v-model="cid"
      v-if="isEdit"
      :props="{
        value: 'id',
        emitPath: false,
        checkStrictly: true
      }"
  ></el-cascader>
  <span v-else>{{findItemNested(data??[], cid, 'children')}}</span>
</template>
<script>
export default {
  name: 'category-select'
}
</script>
<script setup>
import {defineProps, ref, defineEmits, unref, watch, computed} from "vue";
import {getCategoryTree} from "@api/common";
import {useRequest} from 'vue-request'
import {useVModel} from "@vueuse/core";

const props = defineProps({
  modelValue: {
    type: [String, Number,Array],
  },
  isEdit: {
    type: Boolean
  },
  data: Array
})
const emit = defineEmits(['update:modelValue','change'])
const cid = useVModel(props,'modelValue', emit )
const findItemNested = (arr, itemId, nestingKey) => {
  return  arr.reduce((a, item) => {
    if (a) return a;
    if (item.id === itemId) return item.label;
    if (item[nestingKey]) return findItemNested(item[nestingKey], itemId, nestingKey)
  }, null)
}
</script>
