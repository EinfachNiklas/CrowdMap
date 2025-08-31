<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import EventMap from '@/components/EventMap.vue';
import SignInUpForm from '@/components/SignInUpForm.vue';
import Overlay from '@/components/OverlayField.vue';
import { computed } from 'vue';

const props = defineProps({
    overlayActive: {type: Boolean, required: false, default: false},
    overlayType: {type: String, required: false, default: ""}
});

const isValidOverlay = computed(
  () => !!props.overlayActive && ['signin','signup'].includes(props.overlayType ?? '')
);

</script>

<template>
    <div class="grid h-svh grid-rows-[auto_1fr]">
        <HeaderBar class="" />
        <main class="min-h-0" :class="{'blur-sm': isValidOverlay, 'pointer-events-none': isValidOverlay}" >
            <EventMap class="h-full w-full select-none z-0 relative" :center="[10, 10]"
                :marker-positions="[]" />
        </main>
    </div>
    <Overlay v-if="isValidOverlay" ><SignInUpForm :type="overlayType"/></Overlay>
</template>