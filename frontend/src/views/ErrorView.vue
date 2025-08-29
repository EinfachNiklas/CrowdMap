<script setup lang="ts">
import HeaderBar from '@/components/HeaderBar.vue';


const props = defineProps({
    code: {
        required: false,
        type: String,
        default: "not-found"
    }
});

const codeDict: Record<string, { httpStatusCode: number, notice: string }> = {
    "not-found": { httpStatusCode: 404, notice: "Ooops, you took a wrong turn. The page you are looking for does not exist." },
    "internal-server-error": { httpStatusCode: 500, notice: "Ooops, there seems to be something wrong!" },
};

let httpStatusCode: number;
let notice: string;
if (Object.keys(codeDict).includes(props.code)) {
    httpStatusCode = codeDict[props.code].httpStatusCode;
    notice = codeDict[props.code].notice;
} else {
    httpStatusCode = codeDict["not-found"].httpStatusCode;
    notice = codeDict["not-found"].notice;
}



</script>

<template>
    <HeaderBar />
    <div class="w-250 m-auto mt-10 p-5 border-purple-800 rounded-2xl border-4">
        <h1 class="font-bold text-3xl">Error - {{ httpStatusCode }}</h1>
        <p class="text-xl">{{ notice }}</p>
    </div>
</template>