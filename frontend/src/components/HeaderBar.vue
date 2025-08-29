<script setup lang="ts">
    import Button from './CustomButton.vue';
    import SearchBar from './SearchBar.vue';
</script>

<template>
    <header>
        <nav class="bg-gray-900 grid grid-cols-[1fr_auto_1fr] w-screen px-4 py-5 items-center-safe ">
            <h1 class="w-fit text-3xl text-white justify-self-start">Event-App</h1>
            <SearchBar class="justify-self-center-safe"></SearchBar>
            <div class="flex w-45 justify-between justify-self-end-safe">
                <Button :rounded="false">Sign-In</Button>
                <Button :rounded="false">Sign-Up</Button>
            </div>
        </nav>
    </header>
</template>