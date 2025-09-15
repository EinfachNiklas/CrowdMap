<script setup lang="ts">
import SearchIcon from "@/assets/icons/search.svg"
import { ref } from "vue";
const q = ref('');
const emit = defineEmits<{ (e: 'enter', value: string, ev: KeyboardEvent): void }>();
</script>

<template>
    <div class="flex border-white border-b-1 py-2 justify-between w-150">
        <SearchIcon class=""></SearchIcon>
        <input v-model="q" @keydown.enter.prevent="emit('enter', q, $event)" type="text" name="SearchBar" id="SearchBar"
            class="text-white focus:outline-none w-96/100" placeholder="Search for location">
    </div>
</template>