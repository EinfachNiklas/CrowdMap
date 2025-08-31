<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
    rounded: { type: Boolean, required: false, default: true },
    type: { type: String as PropType<'button' | 'submit' | 'reset'>, required: false, default: 'button' },
    disabled: { type: Boolean, required: false, default: false }
});

</script>

<template>
    <button :type="type" :disabled="disabled" class=" text-white w-fit py-1.5 px-3 border-0 transition-all"
        :class="[rounded && 'rounded-[50px]', rounded && !disabled && 'hover:rounded-xl', disabled ? '!bg-gray-400' : 'bg-purple-800 cursor-pointer hover:bg-purple-700']">
        <slot />
    </button>
</template>