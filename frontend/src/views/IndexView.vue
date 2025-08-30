<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import EventMap from '@/components/EventMap.vue';
import SignInUpForm from '@/components/SignInUpForm.vue';
import Overlay from '@/components/Overlay.vue';

defineProps({
    overlayActive: {type: Boolean, required: false, default: false},
    overlayType: {type: String, required: false, default: ""}
});

</script>

<template>
    <div class="grid h-svh grid-rows-[auto_1fr]">
        <HeaderBar class="" />
        <main class="min-h-0" :class="{'blur-sm': overlayActive, 'pointer-events-none': overlayActive}" >
            <EventMap class="h-full w-full select-none z-0 relative" :center="[10, 10]"
                :marker-positions="[]" />
        </main>
    </div>
    <Overlay v-if="overlayActive" ><SignInUpForm :type="overlayType"/></Overlay>
</template>