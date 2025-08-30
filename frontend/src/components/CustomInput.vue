<script setup lang="ts">
    defineProps({
        type: {type: String, required: true, default: "text"},
        placeholder: {type: String, required: false},
        name: {type: String, required: false},
        id: {type: String, required: false},
    });
</script>

<template>
    <input class="my-2 border-b-1 rounded-xs border-gray-300 p-1 focus:outline-1 "  :type=type :placeholder=placeholder :name=name :id=id>
</template>