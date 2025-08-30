<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  type: { type: String, default: 'text' },
  placeholder: String,
  name: String,
  id: String,
  modelValue: { type: String, required: false }
});

const emit = defineEmits(['update:modelValue']);

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <input
    class="border-b-1 rounded-xs border-gray-300 p-1 focus:outline-1 my-2"
    :type="type"
    :placeholder="placeholder"
    :name="name"
    :id="id"
    :value="modelValue"
    @input="onInput"
  >
</template>
