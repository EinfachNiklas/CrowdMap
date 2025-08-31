<template>
    <div class="fixed inset-0 z-30 grid place-items-center p-4 ">
        <div class="rounded-2xl w-fit bg-gray-700 text-white p-5 shadow-md shadow-gray-700 transition-all" role="dialog" aria-modal="true">
            <slot />
        </div>
    </div>
</template>