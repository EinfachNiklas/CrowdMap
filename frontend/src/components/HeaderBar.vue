<script setup lang="ts">
import { fetchFromAPI } from '@/auth';
import CustomButton from './CustomButton.vue';
import SearchBar from './SearchBar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();


const emit = defineEmits<{ (e: 'coordinates-result', value: { lat: number, lon: number }): void }>();

const displayLocations = async (query: string) => {
    if (query.length < 3) {
        return;
    }
    try {
        const res = await fetchFromAPI(`/api/geocoding/coordinates/query?query=${encodeURIComponent(query)}`, { method: "GET" });
        const coordinates = await res.json() as { lat: number; lon: number };
        emit('coordinates-result', coordinates);
    } catch (e) {
        console.error(`unable to fetch coordinates for query - ${e}`);
    }
};
</script>

<template>
    <header>
        <nav
            class="relative z-20 shadow-md shadow-current bg-gray-900 grid grid-cols-[1fr_auto_1fr] w-screen px-4 py-5 items-center-safe ">
            <RouterLink class="w-fit text-3xl text-white justify-self-start" :to="{ name: 'home' }">CrowdMap
            </RouterLink>
            <SearchBar @enter="displayLocations" class="justify-self-center-safe" />
            <div class="flex gap-4 justify-between justify-self-end-safe">
                <CustomButton
                    @click="router.push({ name: 'home', query: { overlayActive: 'true', overlayType: 'signin' } })"
                    :rounded="false">Sign-In</CustomButton>
                <CustomButton
                    @click="router.push({ name: 'home', query: { overlayActive: 'true', overlayType: 'signup' } })"
                    :rounded="false">Sign-Up</CustomButton>
            </div>
        </nav>
    </header>
</template>