<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
      <div class="mb-6">
        <svg
          class="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
      <p class="text-gray-600 mb-6">
        Você não tem permissão para acessar esta página.
      </p>
      <div class="space-y-3">
        <button
          @click="$router.push('/')"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Voltar ao Início
        </button>
        <button
          @click="$router.go(-1)"
          class="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
        >
          Página Anterior
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This component doesn't need any script logic for basic functionality
</script>
