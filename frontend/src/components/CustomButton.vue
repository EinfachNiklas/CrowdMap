<script setup lang="ts">
defineProps({
    rounded: { type: Boolean, required: false, default: true }
});

</script>

<template>
    <button
        type="button"
        class="bg-purple-800 text-white w-fit py-1.5 px-3 border-0 cursor-pointer hover:bg-purple-700 transition-all"
        :class="{ 'rounded-[50px]': rounded, 'hover:rounded-xl': rounded }">
        <slot />
    </button>
</template>