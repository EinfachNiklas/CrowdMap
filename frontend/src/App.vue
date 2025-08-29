<script setup lang="ts">
    import Header from './components/HeaderBar.vue';
    import EventMap from './components/EventMap.vue';
</script>

<template>
    <div class="grid h-svh grid-rows-[auto_1fr]">
        <Header class="relative z-20 bg-white shadow-md shadow-current"/>
        <main class="min-h-0">
            <EventMap class="h-full w-full selection:not-enabled z-0 relative" :center="[10,10]" :marker-positions="[]"></EventMap>
        </main>
    </div>
</template>