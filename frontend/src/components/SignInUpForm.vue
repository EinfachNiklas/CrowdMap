<script setup lang="ts">
import CustomInput from './CustomInput.vue';
import CustomButton from './CustomButton.vue';
import { computed, ref } from 'vue';

const props = defineProps({
    type: { type: String, required: true }
});
if (!["signup", "signin"].includes(props.type)) {
    throw new Error("Wrong type for SignInUpForm Component");
}
const isSignUp = computed(() => props.type === 'signup')

const username = ref<string>();
const email = ref<string>();
const pwd1 = ref<string>();
const pwd2 = ref<string>();




const createUser = () => {
    console.log(username)
    fetch("/api/users", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            pwd: pwd1.value
        })
    }).then((res) => {
        console.log(res.status);
    });
}

</script>

<template>
    <h1 class="text-2xl text-center">{{ isSignUp ? "Sign Up" : "Sign In" }}</h1>
    <form class="m-auto flex flex-col w-150 h-fit mt-5 p-2 justify-around">
        <label v-if="isSignUp" for="username">Username *</label>
        <CustomInput v-if="isSignUp" type="text" name="username" id="username" v-model="username"/>
        <label for="email">Email *</label>
        <CustomInput type="email" name="email" id="email" v-model="email"/>
        <label for="pwd1">Password *</label>
        <CustomInput type="password" name="pwd1" id="pwd1" v-model="pwd1"/>
        <label v-if="isSignUp" for="pwd2">Password again *</label>
        <CustomInput v-if="isSignUp" type="password" name="pwd2" id="pwd2" v-model="pwd2"/>
        <div class="flex justify-center mt-5">
            <CustomButton @click="createUser()">Submit</CustomButton>
        </div>
    </form>
</template>