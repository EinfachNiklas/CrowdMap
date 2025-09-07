<script setup lang="ts">
import CustomInput from './CustomInput.vue';
import CustomButton from './CustomButton.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchFromAPI, setToken } from '@/auth';

const props = defineProps({
    type: { type: String, required: true }
});

const router = useRouter();

if (!["signup", "signin"].includes(props.type)) {
    throw new Error("Wrong type for SignInUpForm Component");
}
const isSignUp = computed(() => props.type === 'signup')



const username = ref<string>("");
const email = ref<string>("");
const pwd1 = ref<string>("");
const pwd2 = ref<string>("");
const loading = ref<boolean>(false);

const notificationMessage = ref<string>("");
const usernameIssue = ref<boolean>(false);
const emailIssue = ref<boolean>(false);
const pwd1Issue = ref<boolean>(false);
const pwd2Issue = ref<boolean>(false);


const validateInput = () => {
    notificationMessage.value = "";
    usernameIssue.value = false;
    emailIssue.value = false;
    pwd1Issue.value = false;
    pwd2Issue.value = false;

    if (isSignUp.value) {
        usernameIssue.value = !username.value;
        emailIssue.value = !email.value;
        pwd1Issue.value = !pwd1.value;
        pwd2Issue.value = !pwd2.value;
        if (usernameIssue.value || emailIssue.value || pwd1Issue.value || pwd2Issue.value) {
            notificationMessage.value = "Please fill out all required fields";
            return false;
        }
    } else {
        emailIssue.value = !email.value;
        pwd1Issue.value = !pwd1.value;
        if (emailIssue.value || pwd1Issue.value) {
            notificationMessage.value = "Please fill out all required fields";
            return false;
        }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        notificationMessage.value = "Please enter a valid email address";
        emailIssue.value = true;
        return false;
    }

    if (isSignUp.value && pwd1.value !== pwd2.value) {
        notificationMessage.value = "Passwords don't match";
        pwd1Issue.value = true;
        pwd2Issue.value = true;
        return false;
    }
    return true;
}

const createUser = async () => {
    loading.value = true;
    const existingFields = new Set<string>();
    if (!validateInput()) {
        loading.value = false;
        return;
    }

    try {
        const params = new URLSearchParams({
            username: username.value,
            email: email.value
        });
        const searchRes = await fetchFromAPI(`/api/users/availability?${params.toString()}`, {
            method: 'GET'
        });

        if (!searchRes.ok) {
            notificationMessage.value = "Something went wrong. Please try again.";
            loading.value = false;
            return;
        }

        const searchData = await searchRes.json() as { username: { available: boolean }, email: { available: boolean }, timestamp: string };
        if (searchData.username.available === false) {
            usernameIssue.value = true;
            existingFields.add("Username");
        }
        if (searchData.email.available === false) {
            emailIssue.value = true;
            existingFields.add("Email");
        }
        if (usernameIssue.value || emailIssue.value) {
            const existingFieldsArray = Array.from(existingFields);
            notificationMessage.value = `${existingFieldsArray.join(" and ")} already ${existingFieldsArray.length === 1 ? "exists" : "exist"}. Please try again.`; loading.value = false;
            return;
        }

        const createRes = await fetchFromAPI("/api/users", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                email: email.value,
                pwd: pwd1.value
            })
        });

        switch (createRes.status) {
            case 201:
                username.value = "";
                email.value = "";
                pwd1.value = "";
                pwd2.value = "";
                await router.push({ name: 'home', query: { overlayActive: 'true', overlayType: 'signin' } });
                break;
            case 400:
                notificationMessage.value = "Please fill out all required fields";
                break;
            case 409:
                notificationMessage.value = "Username or Email already exists";
                break;
            default:
                notificationMessage.value = "Something went wrong. Please try again.";
                break;
        }
    } catch {
        notificationMessage.value = "Network error. Please check your connection and try again.";
    }
    loading.value = false;
}

const signInUser = async () => {
    loading.value = true;
    if (!validateInput()) {
        loading.value = false;
        return;
    }
    const signInRes = await fetchFromAPI("/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email.value,
            pwd: pwd1.value
        })
    }, false);
    try {
        const {authToken} = await signInRes.json();
        switch (signInRes.status) {
            case 200:
                setToken(authToken);
                await router.push({ name: 'home' });
                break;
            case 400:
                notificationMessage.value = "Please fill out all required fields";
                break;
            case 401:
                emailIssue.value = true;
                pwd1Issue.value = true;
                notificationMessage.value = "Email or password incorrect. Please try again";
                break;
            default:
                notificationMessage.value = "Something went wrong. Please try again.";
                break;
        }
    } catch {
        notificationMessage.value = "Network error. Please check your connection and try again.";
    }
    loading.value = false;
}

</script>

<template>
    <h1 class="text-2xl text-center">{{ isSignUp ? "Sign Up" : "Sign In" }}</h1>
    <form @submit.prevent="isSignUp ? createUser() : signInUser()"
        class="m-auto flex flex-col w-150 h-fit mt-5 p-2 justify-around">
        <label v-if="isSignUp" for="username">Username *</label>
        <CustomInput v-if="isSignUp" @input="validateInput()" type="text" name="username" id="username"
            :issue="usernameIssue" v-model="username" />
        <label for="email">Email *</label>
        <CustomInput @input="validateInput()" type="email" name="email" id="email" :issue="emailIssue"
            v-model="email" />
        <label for="pwd1">Password *</label>
        <CustomInput @input="validateInput()" type="password" name="pwd1" id="pwd1" :issue="pwd1Issue" v-model="pwd1" />
        <label v-if="isSignUp" for="pwd2">Password again *</label>
        <CustomInput v-if="isSignUp" @input="validateInput()" type="password" name="pwd2" id="pwd2" :issue="pwd2Issue"
            v-model="pwd2" />
        <p v-if="notificationMessage" class="text-center text-red-400 mt-5">{{
            notificationMessage }}</p>
        <div class="flex justify-center mt-5">
            <CustomButton :disabled="loading" type="submit">{{ loading ? "Loading" : "Submit" }}</CustomButton>
        </div>
    </form>
</template>