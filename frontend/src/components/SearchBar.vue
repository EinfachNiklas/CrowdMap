<script setup lang="ts">
    import SearchIcon from "@/assets/icons/search.svg"
</script>

<template>
    <div class="flex border-white border-b-1 py-2 justify-between w-150">
        <SearchIcon class=""></SearchIcon>
        <input type="text" name="SearchBar" id="SearchBar" class="text-white focus:outline-none w-96/100" placeholder="Search for location">
    </div>
</template>