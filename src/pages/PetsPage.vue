<template>
  <div class="pets-page">
    <div v-if="loading" class="page-loading">
      <div class="loading-box">Se încarcă animăluțele...</div>
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

        <div class="filters-panel">
          <select v-model="selectedSpecies">
            <option value="">Toate speciile</option>
            <option v-for="species in speciesOptions" :key="species" :value="species">
              {{ species }}
            </option>
          </select>

          <select v-model="selectedCity">
            <option value="">Toate orașele</option>
            <option v-for="city in cityOptions" :key="city" :value="city">
              {{ city }}
            </option>
          </select>

          <select v-model="selectedSize">
            <option value="">Toate mărimile</option>
            <option v-for="size in sizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>

          <select v-model="selectedStatus">
            <option value="">Toate statusurile</option>
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>

          <select v-model.number="itemsPerPage">
            <option :value="3">3 / pagină</option>
            <option :value="6">6 / pagină</option>
            <option :value="9">9 / pagină</option>
            <option :value="12">12 / pagină</option>
          </select>

          <button class="reset-filters-btn" @click="resetFilters">
            Resetează
          </button>
        </div>

        <div v-if="activeFilters.length > 0" class="active-filters">
          <span>Filtre aplicate:</span>

          <button
            v-for="filter in activeFilters"
            :key="filter.key"
            @click="removeFilter(filter.key)"
          >
            {{ filter.label }} ×
          </button>
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

        <div v-if="favoriteMessage" class="success-message favorite-feedback">
          {{ favoriteMessage }}
        </div>

        <div v-if="favoriteError" class="auth-required-box favorite-feedback">
          <p>{{ favoriteError }}</p>
          <button @click="goToLogin">Mergi la login</button>
        </div>

        <div v-if="filteredAnimals.length === 0" class="empty-box">
          Nu am găsit animăluțe potrivite pentru filtrele aplicate.
        </div>

        <div v-else class="pets-grid">
          <article
            v-for="animal in paginatedAnimals"
            :key="animal.id"
            class="pet-card"
          >
            <div class="pet-photo">
              <img :src="animal.imageUrl" :alt="animal.name" loading="lazy" />
            </div>

            <div class="pet-content">
              <div class="pet-title-row">
                <h3>{{ animal.name }}</h3>
                <span class="pet-status">{{ animal.status }}</span>
              </div>

              <p class="pet-meta">
                {{ animal.species }} • {{ animal.breed }} • {{ animal.ageLabel }}
              </p>

              <p class="pet-location">📍 {{ animal.city }}</p>

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
                <button class="details-btn" @click="goToPetDetails(animal.id)">
                  Vezi detalii
                </button>

                <button
                  class="favorite-outline"
                  :class="{ active: isFavorite(animal.id) }"
                  @click="toggleFavorite(animal)"
                >
                  {{ isFavorite(animal.id) ? "♥" : "♡" }}
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="currentPage === 1" @click="goToPreviousPage">
            Înapoi
          </button>

          <button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="currentPage = page"
          >
            {{ page }}
          </button>

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
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";
import { db, auth } from "../firebase";

const router = useRouter();

const animals = ref([]);
const loading = ref(true);
const search = ref("");

const selectedSpecies = ref("");
const selectedCity = ref("");
const selectedSize = ref("");
const selectedStatus = ref("");

const currentPage = ref(1);
const itemsPerPage = ref(6);

const currentUser = ref(null);
const favoriteIds = ref([]);
const favoriteMessage = ref("");
const favoriteError = ref("");

onMounted(async () => {
  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;

    if (user) {
      await loadFavorites(user.uid);
    } else {
      favoriteIds.value = [];
    }
  });

  try {
    const snapshot = await getDocs(collection(db, "animals"));

    animals.value = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("Eroare la citirea animalelor:", error);
  } finally {
    loading.value = false;
  }
});

const loadFavorites = async (userId) => {
  const favoritesSnapshot = await getDocs(
    collection(db, "users", userId, "favorites")
  );

  favoriteIds.value = favoritesSnapshot.docs.map((docItem) => docItem.id);
};

const toggleFavorite = async (animal) => {
  favoriteMessage.value = "";
  favoriteError.value = "";

  if (!currentUser.value) {
    favoriteError.value =
      "Trebuie să fii autentificat pentru a adăuga animăluțe la favorite.";
    return;
  }

  const favoriteRef = doc(
    db,
    "users",
    currentUser.value.uid,
    "favorites",
    animal.id
  );

  if (favoriteIds.value.includes(animal.id)) {
    await deleteDoc(favoriteRef);

    favoriteIds.value = favoriteIds.value.filter((id) => id !== animal.id);
    favoriteMessage.value = `${animal.name} a fost eliminat din favorite.`;
    return;
  }

  await setDoc(favoriteRef, {
    animalId: animal.id,
    animalName: animal.name,
    animalSpecies: animal.species,
    animalBreed: animal.breed,
    animalAgeLabel: animal.ageLabel,
    animalCity: animal.city,
    animalImageUrl: animal.imageUrl,
    animalDescription: animal.description,
    createdAt: new Date(),
  });

  favoriteIds.value.push(animal.id);
  favoriteMessage.value = `${animal.name} a fost adăugat la favorite.`;
};

const isFavorite = (animalId) => {
  return favoriteIds.value.includes(animalId);
};

const uniqueOptions = (field) => {
  return [
    ...new Set(
      animals.value
        .map((animal) => animal[field])
        .filter((value) => value && value !== "")
    ),
  ].sort();
};

const speciesOptions = computed(() => uniqueOptions("species"));
const cityOptions = computed(() => uniqueOptions("city"));
const sizeOptions = computed(() => uniqueOptions("size"));
const statusOptions = computed(() => uniqueOptions("status"));

const filteredAnimals = computed(() => {
  const query = search.value.toLowerCase().trim();

  return animals.value.filter((animal) => {
    const matchesSearch =
      !query ||
      animal.name?.toLowerCase().includes(query) ||
      animal.species?.toLowerCase().includes(query) ||
      animal.breed?.toLowerCase().includes(query) ||
      animal.city?.toLowerCase().includes(query) ||
      animal.temperament?.toLowerCase().includes(query) ||
      animal.description?.toLowerCase().includes(query);

    const matchesSpecies =
      !selectedSpecies.value || animal.species === selectedSpecies.value;

    const matchesCity =
      !selectedCity.value || animal.city === selectedCity.value;

    const matchesSize =
      !selectedSize.value || animal.size === selectedSize.value;

    const matchesStatus =
      !selectedStatus.value || animal.status === selectedStatus.value;

    return (
      matchesSearch &&
      matchesSpecies &&
      matchesCity &&
      matchesSize &&
      matchesStatus
    );
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredAnimals.value.length / itemsPerPage.value);
});

const paginatedAnimals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;

  return filteredAnimals.value.slice(start, end);
});

const activeFilters = computed(() => {
  const filters = [];

  if (search.value.trim()) {
    filters.push({
      key: "search",
      label: `Căutare: ${search.value.trim()}`,
    });
  }

  if (selectedSpecies.value) {
    filters.push({
      key: "species",
      label: selectedSpecies.value,
    });
  }

  if (selectedCity.value) {
    filters.push({
      key: "city",
      label: selectedCity.value,
    });
  }

  if (selectedSize.value) {
    filters.push({
      key: "size",
      label: selectedSize.value,
    });
  }

  if (selectedStatus.value) {
    filters.push({
      key: "status",
      label: selectedStatus.value,
    });
  }

  return filters;
});

const resetFilters = () => {
  search.value = "";
  selectedSpecies.value = "";
  selectedCity.value = "";
  selectedSize.value = "";
  selectedStatus.value = "";
  currentPage.value = 1;
};

const removeFilter = (key) => {
  if (key === "search") search.value = "";
  if (key === "species") selectedSpecies.value = "";
  if (key === "city") selectedCity.value = "";
  if (key === "size") selectedSize.value = "";
  if (key === "status") selectedStatus.value = "";

  currentPage.value = 1;
};

watch(
  [search, selectedSpecies, selectedCity, selectedSize, selectedStatus, itemsPerPage],
  () => {
    currentPage.value = 1;
  }
);

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

const goToPetDetails = (id) => {
  router.push(`/pets/${id}`);
};

const goToLogin = () => {
  router.push("/login");
};
</script>