<template>
  <div class="pets-page">

    <section class="pets-hero">
      <h1>Găsește-ți noul cel mai bun prieten 🐾</h1>

      <p>
        Explorează animăluțele disponibile pentru adopție și descoperă
        companionul perfect pentru stilul tău de viață.
      </p>

      <div class="stats">
        <div class="stat-card">
          <h3>124</h3>
          <span>animăluțe disponibile</span>
        </div>

        <div class="stat-card">
          <h3>15</h3>
          <span>adăposturi partenere</span>
        </div>

        <div class="stat-card">
          <h3>347</h3>
          <span>adopții reușite</span>
        </div>
      </div>

      <div class="search-container">
        <input
          type="text"
          v-model="search"
          placeholder="Caută după nume, specie, oraș sau personalitate..."
        />
      </div>

    </section>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')
</script>