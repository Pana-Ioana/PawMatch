<template>
  <div class="pet-details-page">
    <div v-if="loading" class="page-loading">
      <div class="loading-box">Se încarcă profilul animăluțului...</div>
    </div>

    <div v-else-if="!animal" class="empty-box">
      Animăluțul nu a fost găsit.
    </div>

    <main v-else class="pet-profile">
      <button class="back-btn" @click="goBack">
        ← Înapoi la animăluțe
      </button>

      <section class="profile-layout">
        <div class="profile-image">
          <img :src="animal.imageUrl" :alt="animal.name" />
        </div>

        <div class="profile-info">
          <span class="pet-status">{{ animal.status }}</span>

          <h1>{{ animal.name }}</h1>

          <p class="profile-meta">
            {{ animal.species }} • {{ animal.breed }} • {{ animal.ageLabel }}
          </p>

          <p class="profile-location">
            📍 {{ animal.city }}
          </p>

          <p class="profile-description">
            {{ animal.description }}
          </p>

          <div class="profile-tags" v-if="animal.temperament">
            <small
              v-for="tag in splitTags(animal.temperament)"
              :key="tag"
            >
              {{ tag }}
            </small>
          </div>

          <div class="profile-facts">
            <div>
              <strong>Sex</strong>
              <span>{{ animal.gender || "Nespecificat" }}</span>
            </div>

            <div>
              <strong>Talie</strong>
              <span>{{ animal.size || "Nespecificat" }}</span>
            </div>

            <div>
              <strong>Vaccinat</strong>
              <span>{{ animal.isVaccinated ? "Da" : "Nu" }}</span>
            </div>

            <div>
              <strong>Sterilizat</strong>
              <span>{{ animal.isSterilized ? "Da" : "Nu" }}</span>
            </div>
          </div>

          <div class="profile-actions">
            <button class="adopt-btn" @click="showAdoptionForm = true">
              Trimite cerere de adopție 🐾
            </button>

            <button class="favorite-profile-btn">
              ♡ Salvează la favorite
            </button>
          </div>
        </div>
      </section>

      <section v-if="showAdoptionForm" class="adoption-box">
        <h2>Cerere adopție pentru {{ animal.name }}</h2>

        <p>
          Completează câteva informații, iar echipa PawMatch va analiza cererea ta.
        </p>

        <form class="adoption-form" @submit.prevent="submitAdoptionRequest">
          <input
            v-model="requestForm.fullName"
            type="text"
            placeholder="Numele tău complet"
            required
          />

          <input
            v-model="requestForm.email"
            type="email"
            placeholder="Email"
            required
          />

          <input
            v-model="requestForm.phone"
            type="text"
            placeholder="Telefon"
            required
          />

          <textarea
            v-model="requestForm.message"
            placeholder="De ce vrei să adopți acest animăluț?"
            required
          ></textarea>

          <button class="adopt-btn" type="submit">
            Trimite cererea
          </button>
        </form>

        <p v-if="successMessage" class="success-message">
          {{ successMessage }}
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const route = useRoute();
const router = useRouter();

const animal = ref(null);
const loading = ref(true);
const showAdoptionForm = ref(false);
const successMessage = ref("");

const requestForm = ref({
  fullName: "",
  email: "",
  phone: "",
  message: "",
});

onMounted(async () => {
  try {
    const animalId = route.params.id;
    const docRef = doc(db, "animals", animalId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      animal.value = {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }
  } catch (error) {
    console.error("Eroare la citirea profilului:", error);
  } finally {
    loading.value = false;
  }
});

const splitTags = (text) => {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
};

const goBack = () => {
  router.push("/pets");
};

const submitAdoptionRequest = async () => {
  try {
    await addDoc(collection(db, "adoptionRequests"), {
      animalId: animal.value.id,
      animalName: animal.value.name,
      ...requestForm.value,
      status: "Pending",
      createdAt: new Date(),
    });

    successMessage.value = "Cererea ta a fost trimisă cu succes!";

    requestForm.value = {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    };

    showAdoptionForm.value = false;
  } catch (error) {
    console.error("Eroare la trimiterea cererii:", error);
  }
};
</script>