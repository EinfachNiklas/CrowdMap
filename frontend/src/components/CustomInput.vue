<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  type: { type: String, required: false, default: 'text' },
  placeholder: { type: String, required: false },
  name: { type: String, required: false },
  id: { type: String, required: false },
  issue: { type: Boolean, required: false },
  modelValue: { type: String, required: false }
});

const emit = defineEmits(['update:modelValue']);

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value);
};
</script>

<template>
  <input class="border-b-1 rounded-xs border-gray-300 p-1 focus:outline-1 my-2" :class="{ 'border-red-500': issue }"
    :type="type" :placeholder="placeholder" :name="name" :id="id" :value="modelValue"
    :aria-invalid="issue ? 'true' : 'false'" @input="onInput">
</template>
