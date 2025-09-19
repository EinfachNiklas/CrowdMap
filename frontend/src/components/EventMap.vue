<script setup lang="ts">
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import { nextTick, ref, watch } from 'vue';
import type { PropType } from 'vue';

import { type LatLngExpression, type PointExpression, type PointTuple } from 'leaflet'


const props = defineProps({
    markerPositions: { type: Array as PropType<LatLngExpression[]>, required: false, default: () => [] },
    center: { type:  Object as PropType<PointTuple>, required: true },
    centerVersion: { type: Number, required: true}
});

const zoom = ref<number>(10);
const centerRef = ref<PointExpression>([0,0]);

watch(
    () => [props.center, props.centerVersion],
    async () => {
        const c = props.center;
        if (!c || c.length < 2 || !Number.isFinite(c[0]) || !Number.isFinite(c[1])) {
            return;
        }
        const d = (n: number) => (n.toString().split('.')[1] ?? '').length;
        const next = Math.sqrt((d(c[0]) + d(c[1])) * 3) * 2;
        centerRef.value = c;
        if (next !== zoom.value) {
            await nextTick();
            zoom.value = next;
        }
    },
    { deep: true, immediate: true, flush: 'post' }
);


</script>

<template>
    <div class="max-h-screen h-full">
        <l-map :zoom="zoom" v-model:center="centerRef">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors" />
            <l-marker v-for="(markerPos, i) in markerPositions" :lat-lng="markerPos" v-bind:key="i" />
        </l-map>
    </div>
</template>
