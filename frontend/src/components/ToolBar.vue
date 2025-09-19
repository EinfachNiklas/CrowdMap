<script setup lang="ts">
import ToolbarOption from '@/components/ToolbarOption.vue';

const handleAddEvent = ()=>{
    console.log("ToDo: addEvent")
};
</script>

<template>
    <div
        class="flex justify-evenly bg-gray-800 opacity-90 w-150 h-15 rounded-[50px] absolute bottom-3 left-1/2 -translate-x-1/2 ">
        <ToolbarOption @clicking="handleAddEvent()" icon="ic:outline-add-location-alt" />
    </div>
</template>