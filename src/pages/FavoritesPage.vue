<template>
  <div class="favorites-page">
    <section class="favorites-header">
      <span>♡ Favorite</span>
      <h1>Animăluțele tale favorite</h1>
      <p>
        Aici vezi animăluțele salvate în lista ta personală.
      </p>
    </section>

    <section class="favorites-content">
      <div v-if="loading" class="loading-box">
        Se încarcă favoritele...
      </div>

      <div v-else-if="!currentUser" class="auth-required-box">
        <p>Trebuie să fii autentificat pentru a vedea lista de favorite.</p>

        <button @click="goToLogin">
          Mergi la login
        </button>
      </div>

      <div v-else-if="favorites.length === 0" class="empty-box">
        Nu ai adăugat încă niciun animăluț la favorite.
      </div>

      <div v-else class="pets-grid">
        <article
          v-for="animal in favorites"
          :key="animal.id"
          class="pet-card"
        >
          <div class="pet-photo">
            <img
              :src="animal.animalImageUrl"
              :alt="animal.animalName"
              loading="lazy"
            />
          </div>

          <div class="pet-content">
            <div class="pet-title-row">
              <h3>{{ animal.animalName }}</h3>
              <span class="pet-status">Favorit</span>
            </div>

            <p class="pet-meta">
              {{ animal.animalSpecies }} • {{ animal.animalBreed }} • {{ animal.animalAgeLabel }}
            </p>

            <p class="pet-location">
              📍 {{ animal.animalCity }}
            </p>

            <p class="pet-description">
              {{ animal.animalDescription }}
            </p>

            <div class="pet-actions">
              <button class="details-btn" @click="goToPetDetails(animal.animalId)">
                Vezi detalii
              </button>

              <button
                class="favorite-outline active"
                @click="removeFavorite(animal.id, animal.animalName)"
              >
                ♥
              </button>
            </div>
          </div>
        </article>
      </div>

      <p v-if="pageMessage" class="success-message favorite-page-message">
        {{ pageMessage }}
      </p>

      <p v-if="pageError" class="error-message favorite-page-message">
        {{ pageError }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "vue-router";
import { db, auth } from "../firebase";

const router = useRouter();

const loading = ref(true);
const currentUser = ref(null);
const favorites = ref([]);

const pageMessage = ref("");
const pageError = ref("");

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;

    if (!user) {
      loading.value = false;
      return;
    }

    await loadFavorites(user.uid);
  });
});

const loadFavorites = async (userId) => {
  try {
    const snapshot = await getDocs(
      collection(db, "users", userId, "favorites")
    );

    favorites.value = snapshot.docs
      .map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
  } catch (error) {
    console.error("Eroare la încărcarea favoritelor:", error);
    pageError.value = "Favoritele nu au putut fi încărcate.";
  } finally {
    loading.value = false;
  }
};

const removeFavorite = async (favoriteId, animalName) => {
  pageMessage.value = "";
  pageError.value = "";

  if (!currentUser.value) {
    pageError.value = "Trebuie să fii autentificat pentru a modifica favoritele.";
    return;
  }

  try {
    await deleteDoc(
      doc(db, "users", currentUser.value.uid, "favorites", favoriteId)
    );

    favorites.value = favorites.value.filter(
      (favorite) => favorite.id !== favoriteId
    );

    pageMessage.value = `${animalName} a fost eliminat din favorite.`;
  } catch (error) {
    console.error("Eroare la ștergerea favoritului:", error);
    pageError.value = "Favoritul nu a putut fi eliminat.";
  }
};

const goToLogin = () => {
  router.push("/login");
};

const goToPetDetails = (animalId) => {
  router.push(`/pets/${animalId}`);
};
</script>