<template>
  <div class="pets-page">
    <div v-if="loading" class="page-loading">
      <div class="loading-box">
        Se încarcă animăluțele...
      </div>
    </div>

    <template v-else>
      <section class="pets-hero">
        <h1>Găsește-ți noul cel mai bun prieten 🐾</h1>

        <p>
          Explorează animăluțele disponibile pentru adopție și descoperă
          companionul perfect pentru stilul tău de viață.
        </p>

        <div class="stats">
          <div class="stat-card">
            <h3>{{ animals.length }}</h3>
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

      <section class="pets-results">
        <div class="results-header">
          <div>
            <h2>Animăluțe disponibile</h2>
            <p>Alege un companion și fă primul pas spre adopție.</p>
          </div>

          <span class="results-count">
            {{ filteredAnimals.length }} rezultate
          </span>
        </div>

        <div v-if="filteredAnimals.length === 0" class="empty-box">
          Nu am găsit animăluțe potrivite.
        </div>

        <div v-else class="pets-grid">
          <article
            v-for="animal in paginatedAnimals"
            :key="animal.id"
            class="pet-card"
          >
            <div class="pet-photo">
              <img
                :src="animal.imageUrl"
                :alt="animal.name"
                loading="lazy"
              />
            </div>

            <div class="pet-content">
              <div class="pet-title-row">
                <h3>{{ animal.name }}</h3>
                <span class="pet-status">{{ animal.status }}</span>
              </div>

              <p class="pet-meta">
                {{ animal.species }} • {{ animal.breed }} • {{ animal.ageLabel }}
              </p>

              <p class="pet-location">
                📍 {{ animal.city }}
              </p>

              <p class="pet-description">
                {{ animal.description }}
              </p>

              <div class="pet-tags" v-if="animal.temperament">
                <small
                  v-for="tag in splitTags(animal.temperament)"
                  :key="tag"
                >
                  {{ tag }}
                </small>
              </div>

              <div class="pet-actions">
                <button class="details-btn">Vezi detalii</button>
                <button class="favorite-outline">♡</button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="currentPage === 1" @click="goToPreviousPage">
            Înapoi
          </button>

          <span>Pagina {{ currentPage }} din {{ totalPages }}</span>

          <button :disabled="currentPage === totalPages" @click="goToNextPage">
            Înainte
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const animals = ref([]);
const loading = ref(true);
const search = ref("");

const currentPage = ref(1);
const itemsPerPage = 6;

onMounted(async () => {
  try {
    const snapshot = await getDocs(collection(db, "animals"));

    animals.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Eroare la citirea animalelor:", error);
  } finally {
    loading.value = false;
  }
});

const filteredAnimals = computed(() => {
  const query = search.value.toLowerCase().trim();

  if (!query) {
    return animals.value;
  }

  return animals.value.filter((animal) => {
    return (
      animal.name?.toLowerCase().includes(query) ||
      animal.species?.toLowerCase().includes(query) ||
      animal.breed?.toLowerCase().includes(query) ||
      animal.city?.toLowerCase().includes(query) ||
      animal.temperament?.toLowerCase().includes(query) ||
      animal.description?.toLowerCase().includes(query)
    );
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredAnimals.value.length / itemsPerPage);
});

const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return filteredAnimals.value.slice(start, end);
});

watch(search, () => {
  currentPage.value = 1;
});

watch(filteredAnimals, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value || 1;
  }
});

const splitTags = (text) => {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
};

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
</script>