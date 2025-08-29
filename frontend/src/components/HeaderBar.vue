<script setup lang="ts">
import CustomButton from './CustomButton.vue';
import SearchBar from './SearchBar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

</script>

<template>
    <header>
        <nav class="bg-gray-900 grid grid-cols-[1fr_auto_1fr] w-screen px-4 py-5 items-center-safe ">
            <RouterLink class="w-fit text-3xl text-white justify-self-start"
                :to="{ name: 'home' }">Event-App</RouterLink>
            <SearchBar class="justify-self-center-safe" />
            <div class="flex gap-4 justify-between justify-self-end-safe">
                <CustomButton :rounded="false">Sign-In</CustomButton>
                <CustomButton :rounded="false">Sign-Up</CustomButton>
            </div>
        </nav>
    </header>
</template>