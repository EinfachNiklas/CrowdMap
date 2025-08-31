<script setup lang="ts">
import CustomInput from './CustomInput.vue';
import CustomButton from './CustomButton.vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

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

const createUser = () => {
    if (!validateInput()) {
        return
    }

    //implement custom username or email request


    fetch("/api/users", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            pwd: pwd1.value
        })
    }).then((res) => {
        switch (res.status) {
            case 201:
                router.push({ name: 'home', query: { overlayActive: 'true', overlayType: 'signin' } });
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
    }).catch(() => {
        notificationMessage.value = "Network error. Please check your connection and try again.";
    });
}

const signInUser = () => {
    if (!validateInput()) {
        return
    }
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
        <p v-if="notificationMessage" @input="validateInput()" class="text-center text-red-400 mt-5">{{
            notificationMessage }}</p>
        <div class="flex justify-center mt-5">
            <CustomButton>Submit</CustomButton>
        </div>
    </form>
</template>