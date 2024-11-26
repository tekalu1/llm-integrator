<template>
    <div class="relative w-full scroll-smooth overflow-y-auto 
        [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-gray-100
        [&::-webkit-scrollbar-thumb]:bg-[#c397fb]
        [&::-webkit-scrollbar-thumb:hover]:bg-[#842ff7]
        [&::-webkit-scrollbar-track]:bg-opacity-0
        [&::-webkit-scrollbar-thumb]:bg-opacity-50
        [&::-webkit-scrollbar-thumb]:rounded-md
        [&::-webkit-scrollbar-thumb]:transition-all
        [&::-webkit-scrollbar-thumb]:duration-300
        transition-all duration-300">
        <slot />
    </div>
</template>