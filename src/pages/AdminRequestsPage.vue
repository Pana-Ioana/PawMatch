<template>
  <div class="admin-page">
    <section class="admin-header">
      <div>
        <span>Admin PawMatch</span>
        <h1>Cereri adopție</h1>
        <p>Vizualizează toate cererile trimise și actualizează statusul acestora.</p>
      </div>
    </section>

    <section class="admin-content">
      <div v-if="checkingAuth" class="loading-box">
        Se verifică accesul...
      </div>

      <div v-else-if="!isAdmin" class="empty-box">
        Nu ai acces la această pagină.
      </div>

      <template v-else>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div class="admin-toolbar">
          <input
            v-model="search"
            type="text"
            placeholder="Caută după nume animal, utilizator, email sau status..."
          />

          <select v-model="selectedStatus">
            <option value="">Toate statusurile</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div v-if="loading" class="loading-box">
          Se încarcă cererile...
        </div>

        <div v-else-if="filteredRequests.length === 0" class="empty-box">
          Nu există cereri de adopție pentru filtrele aplicate.
        </div>

        <div v-else class="admin-requests-list">
          <article
            v-for="request in filteredRequests"
            :key="request.id"
            class="admin-request-card"
          >
            <img
              v-if="request.animalImageUrl"
              :src="request.animalImageUrl"
              :alt="request.animalName"
            />

            <div class="admin-request-info">
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

              <div class="admin-status-update">
                <select v-model="request.newStatus">
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  class="admin-save-btn"
                  @click="updateRequestStatus(request)"
                  :disabled="request.status === request.newStatus"
                >
                  Actualizează status
                </button>
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const checkingAuth = ref(true);
const isAdmin = ref(false);
const loading = ref(false);

const requests = ref([]);
const search = ref("");
const selectedStatus = ref("");

const successMessage = ref("");
const errorMessage = ref("");

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isAdmin.value = user?.email === ADMIN_EMAIL;
    checkingAuth.value = false;

    if (isAdmin.value) {
      await loadRequests();
    }
  });
});

const loadRequests = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const token = await auth.currentUser.getIdToken();

const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/admin/requests`,
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

const data = await response.json();

requests.value = data.requests;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Cererile nu au putut fi încărcate.";
  } finally {
    loading.value = false;
  }
};

const filteredRequests = computed(() => {
  const query = search.value.toLowerCase().trim();

  return requests.value.filter((request) => {
    const matchesSearch =
      !query ||
      request.animalName?.toLowerCase().includes(query) ||
      request.animalSpecies?.toLowerCase().includes(query) ||
      request.fullName?.toLowerCase().includes(query) ||
      request.email?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query);

    const matchesStatus =
      !selectedStatus.value || request.status === selectedStatus.value;

    return matchesSearch && matchesStatus;
  });
});

const updateRequestStatus = async (request) => {
  successMessage.value = "";
  errorMessage.value = "";

  if (!request.newStatus) {
    errorMessage.value = "Alege un status valid.";
    return;
  }

  try {
    await updateDoc(doc(db, "adoptionRequests", request.id), {
      status: request.newStatus,
      updatedAt: new Date(),
    });

    request.status = request.newStatus;

    successMessage.value = `Statusul cererii pentru ${request.animalName} a fost actualizat.`;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Statusul nu a putut fi actualizat.";
  }
};
</script>