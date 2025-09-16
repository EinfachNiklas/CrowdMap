<script setup lang="ts">
import 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import { computed, nextTick, ref, watch } from 'vue';
import type { PropType } from 'vue';

import { Point, type LatLngExpression, type PointExpression } from 'leaflet'


const props = defineProps({
    markerPositions: { type: Array as PropType<LatLngExpression[]>, required: false, default: () => [] },
    center: { type: [Array, Object] as PropType<PointExpression>, required: true },
    centerVersion: { type: Number, required: true}
});

const zoom = ref<number>(10);
const centerRef = ref<PointExpression>([0,0]);

watch(
    () => [props.center, props.centerVersion],
    async () => {
        const c = props.center;
        if (!c || c instanceof Point || !c[0] || !c[1]) {
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
