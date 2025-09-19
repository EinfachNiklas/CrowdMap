<script setup lang="ts">
import ToolbarOption from '@/components/ToolbarOption.vue';

const handleAddEvent = ()=>{
    console.log("ToDo: addEvent")
};
</script>

<template>
    <div
        class="flex justify-evenly bg-gray-800 opacity-90 w-150 h-15 rounded-[50px] fixed z-50 left-1/2 -translate-x-1/2 " style="bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));">
        <ToolbarOption @click="handleAddEvent" icon="ic:outline-add-location-alt" label="Add Event"/>
    </div>
</template>