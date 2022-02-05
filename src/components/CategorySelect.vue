<template>
  <el-cascader
      :options="data?.message??[]"
      v-model="cid"
      v-if="isEdit"
      :props="{
        value: 'id',
        emitPath: false,
        checkStrictly: true
      }"
  ></el-cascader>
  <span v-else>{{findItemNested(data?.message??[], cid, 'children')}}</span>
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
  }
})
const emit = defineEmits(['update:modelValue','change'])
const cid = useVModel(props,'modelValue', emit )

const {data, loading, run} =useRequest(()=> getCategoryTree(), {manual:false})

const findItemNested = (arr, itemId, nestingKey) => (
    arr.reduce((a, item) => {
      if (a) return a;
      if (item.id === itemId) return item.label;
      if (item[nestingKey]) return findItemNested(item[nestingKey], itemId, nestingKey)
    }, null)
)
</script>
