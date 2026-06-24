<template>
  <div class="my-requests-page">
    <section class="my-requests-header">
      <span>🐾 Cereri adopție</span>
      <h1>Cererile mele</h1>
      <p>Aici vezi cererile de adopție trimise și statusul lor.</p>
    </section>

    <section class="my-requests-content">
      <div v-if="loading" class="loading-box">
        Se încarcă cererile tale...
      </div>

      <div v-else-if="!currentUser" class="empty-box">
        Trebuie să fii autentificat pentru a vedea cererile de adopție.
      </div>

      <div v-else-if="requests.length === 0" class="empty-box">
        Nu ai trimis încă nicio cerere de adopție.
      </div>

      <div v-else class="requests-list">
        <article
          v-for="request in requests"
          :key="request.id"
          class="request-card"
        >
          <img
            v-if="request.animalImageUrl"
            :src="request.animalImageUrl"
            :alt="request.animalName"
          />

          <div class="request-info">
            <div class="request-title-row">
              <div>
                <h3>{{ request.animalName }}</h3>
                <p>{{ request.animalSpecies }}</p>
              </div>

              <span class="request-status">
                {{ request.status }}
              </span>
            </div>

            <p class="request-message">
              {{ request.message }}
            </p>

            <small>
              {{ request.fullName }} • {{ request.email }} • {{ request.phone }}
            </small>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

const loading = ref(true);
const currentUser = ref(null);
const requests = ref([]);

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;

    if (!user) {
      loading.value = false;
      return;
    }

    await loadRequests(user.uid);
  });
});

const loadRequests = async (userId) => {
  try {
    const requestsQuery = query(
      collection(db, "adoptionRequests"),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(requestsQuery);

    requests.value = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
  } catch (error) {
    console.error("Eroare la citirea cererilor:", error);
  } finally {
    loading.value = false;
  }
};
</script>