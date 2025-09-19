<script lang="ts" setup>
import { Icon } from '@iconify/vue';
defineProps({
    icon: { type: String, required: true },
    label: { type: String, required: true }
});
const emit = defineEmits<{ (e: 'click'): void }>();
</script>

<template>
    <div class="flex flex-col justify-center">
        <button type="button" @click="emit('click')"
            class="p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">

            <Icon :icon="icon" aria-hidden="true" class="text-white text-4xl transition-all hover:scale-[1.15]" />
            <span class="sr-only">{{ label }}</span>

        </button>
    </div>
</template>