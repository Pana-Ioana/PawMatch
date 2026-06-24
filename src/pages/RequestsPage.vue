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
        <p v-if="pageMessage" class="success-message">
          {{ pageMessage }}
        </p>

        <p v-if="pageError" class="error-message">
          {{ pageError }}
        </p>

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

            <div class="request-actions">
              <button
                v-if="request.status === 'pending'"
                class="delete-request-btn"
                @click="deleteRequest(request.id)"
              >
                Șterge cererea
              </button>

              <span v-else class="request-locked">
                Cererea nu mai poate fi ștearsă deoarece statusul este {{ request.status }}.
              </span>
            </div>
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
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

const loading = ref(true);
const currentUser = ref(null);
const requests = ref([]);

const pageMessage = ref("");
const pageError = ref("");

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
    console.error("Eroare la citirea cererilor:", error);
    pageError.value = "Cererile nu au putut fi încărcate.";
  } finally {
    loading.value = false;
  }
};

const deleteRequest = async (requestId) => {
  pageMessage.value = "";
  pageError.value = "";

  if (!currentUser.value) {
    pageError.value = "Trebuie să fii autentificat pentru a șterge cererea.";
    return;
  }

  try {
    const requestRef = doc(db, "adoptionRequests", requestId);
    const requestSnapshot = await getDoc(requestRef);

    if (!requestSnapshot.exists()) {
      pageError.value = "Cererea nu mai există în baza de date.";
      return;
    }

    const requestData = requestSnapshot.data();

    if (requestData.userId !== currentUser.value.uid) {
      pageError.value = "Nu poți șterge o cerere care nu îți aparține.";
      return;
    }

    if (requestData.status !== "pending") {
      pageError.value =
        "Cererea nu mai poate fi ștearsă deoarece nu mai este în status pending.";
      return;
    }

    await deleteDoc(requestRef);

    requests.value = requests.value.filter(
      (request) => request.id !== requestId
    );

    pageMessage.value = "Cererea a fost ștearsă cu succes.";
  } catch (error) {
    console.error("Eroare la ștergerea cererii:", error);
    pageError.value = "Cererea nu a putut fi ștearsă. Încearcă din nou.";
  }
};
</script>