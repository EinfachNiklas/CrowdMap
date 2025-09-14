<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';
import EventMap from '@/components/EventMap.vue';
import SignInUpForm from '@/components/SignInUpForm.vue';
import Overlay from '@/components/OverlayField.vue';
import { computed, onMounted, ref } from 'vue';
import { fetchFromAPI } from '@/auth';
type Coords = { lat: number; lon: number };

const lat = ref<number>(0);
const lon = ref<number>(0);

const props = defineProps({
    overlayActive: { type: Boolean, required: false, default: false },
    overlayType: { type: String, required: false, default: "" }
});

const isValidOverlay = computed(
    () => !!props.overlayActive && ['signin', 'signup'].includes(props.overlayType ?? '')
);

onMounted(async () => {
    try {
        const res = await fetchFromAPI("/api/geocoding/coordinates/ip", { method: "GET" });
        const { lat: la, lon: lo } = await res.json() as { lat: number; lon: number };
        lat.value = la;
        lon.value = lo;
    } catch (e) {
        console.error("unable to fetch coordinates for ip")
    }
});


</script>

<template>
    <div class="grid h-svh grid-rows-[auto_1fr]">
        <HeaderBar class="" />
        <main class="min-h-0" :class="{ 'blur-sm': isValidOverlay, 'pointer-events-none': isValidOverlay }">
            <EventMap class="h-full w-full select-none z-0 relative" :center="[lat, lon]" :marker-positions="[]" />
        </main>
    </div>
    <Overlay v-if="isValidOverlay">
        <SignInUpForm :type="overlayType" />
    </Overlay>
</template>