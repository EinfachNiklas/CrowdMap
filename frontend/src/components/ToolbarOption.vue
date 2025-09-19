<script lang="ts" setup>
import { Icon } from '@iconify/vue';
defineProps({
    icon: { type: String, required: true }
});
const emit = defineEmits<{ (e: 'clicking'): void }>();
</script>

<template>
    <div class="flex flex-col justify-center">
        <Icon @click.prevent="emit('clicking')" icon="ic:outline-add-location-alt"
            class="text-white text-4xl cursor-pointer transition-all hover:scale-[1.15]" />
    </div>
</template>