<script setup lang="ts">
import 'leaflet';                 
import 'leaflet/dist/leaflet.css'  ;      
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import { ref } from 'vue';

import type { LatLngExpression } from 'leaflet'


defineProps<{
  markerPositions: LatLngExpression[],
  center: [number, number]
}>();


const zoom   = ref<number>(5);


</script>

<template>
    <div class="max-h-screen h-full">
        <l-map
            v-model:zoom="zoom"
            :center="center"  
        >
            <l-tile-layer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors" />
            <l-marker v-for="markerPos in markerPositions" :lat-lng="markerPos" v-bind:key="markerPos.toString()"/>
        </l-map>
    </div>
</template>
