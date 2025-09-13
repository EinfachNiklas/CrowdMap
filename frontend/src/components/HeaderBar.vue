<script setup lang="ts">
import CustomButton from './CustomButton.vue';
import SearchBar from './SearchBar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
    <header >
        <nav class="relative z-20 shadow-md shadow-current bg-gray-900 grid grid-cols-[1fr_auto_1fr] w-screen px-4 py-5 items-center-safe ">
            <RouterLink class="w-fit text-3xl text-white justify-self-start"
                :to="{ name: 'home' }">Event-App</RouterLink>
            <SearchBar class="justify-self-center-safe" />
            <div class="flex gap-4 justify-between justify-self-end-safe">
                <CustomButton @click="router.push({name: 'home', query: {overlayActive: 'true', overlayType: 'signin'}})" :rounded="false">Sign-In</CustomButton>
                <CustomButton @click="router.push({name: 'home', query: {overlayActive: 'true', overlayType: 'signup'}})" :rounded="false">Sign-Up</CustomButton>
            </div>
        </nav>
    </header>
</template>