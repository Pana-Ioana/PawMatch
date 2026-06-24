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
            <button class="adopt-btn" @click="openAdoptionForm">
              Trimite cerere de adopție 🐾
            </button>

            <button class="favorite-profile-btn">
              ♡ Salvează la favorite
            </button>
          </div>

          <div v-if="authMessage" class="auth-required-box">
            <p>{{ authMessage }}</p>

            <button @click="goToLogin">
              Mergi la login
            </button>
          </div>
        </div>
      </section>

      <section v-if="showAdoptionForm" class="adoption-box">
        <h2>Cerere adopție pentru {{ animal.name }}</h2>

        <p>
          Completează câteva informații, iar cererea ta va fi salvată cu status pending.
        </p>

        <form class="adoption-form" @submit.prevent="submitAdoptionRequest">
          <input
            v-model="requestForm.fullName"
            type="text"
            placeholder="Numele tău complet"
          />

          <input
            v-model="requestForm.email"
            type="email"
            placeholder="Email"
          />

          <input
            v-model="requestForm.phone"
            type="text"
            placeholder="Telefon"
          />

          <textarea
            v-model="requestForm.message"
            placeholder="De ce vrei să adopți acest animăluț?"
          ></textarea>

          <p v-if="formError" class="error-message">
            {{ formError }}
          </p>

          <p v-if="successMessage" class="success-message">
            {{ successMessage }}
          </p>

          <button class="adopt-btn" type="submit" :disabled="submitting">
            {{ submitting ? "Se trimite cererea..." : "Trimite cererea" }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

const route = useRoute();
const router = useRouter();

const animal = ref(null);
const currentUser = ref(null);

const loading = ref(true);
const submitting = ref(false);
const showAdoptionForm = ref(false);

const authMessage = ref("");
const formError = ref("");
const successMessage = ref("");

const requestForm = ref({
  fullName: "",
  email: "",
  phone: "",
  message: "",
});

onMounted(async () => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });

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

const openAdoptionForm = () => {
  authMessage.value = "";
  formError.value = "";
  successMessage.value = "";

  if (!currentUser.value) {
    showAdoptionForm.value = false;
    authMessage.value =
      "Trebuie să fii autentificat pentru a trimite o cerere de adopție.";
    return;
  }

  showAdoptionForm.value = true;
};

const validateAdoptionForm = () => {
  if (!requestForm.value.fullName.trim()) {
    return "Numele complet este obligatoriu.";
  }

  if (!requestForm.value.email.trim()) {
    return "Emailul este obligatoriu.";
  }

  if (!requestForm.value.email.includes("@")) {
    return "Emailul nu este valid.";
  }

  if (!requestForm.value.phone.trim()) {
    return "Telefonul este obligatoriu.";
  }

  if (requestForm.value.phone.trim().length < 10) {
    return "Telefonul trebuie să aibă minimum 10 caractere.";
  }

  if (!requestForm.value.message.trim()) {
    return "Mesajul este obligatoriu.";
  }

  if (requestForm.value.message.trim().length < 20) {
    return "Mesajul trebuie să aibă minimum 20 de caractere.";
  }

  return "";
};

const submitAdoptionRequest = async () => {
  formError.value = "";
  successMessage.value = "";

  if (!currentUser.value) {
    showAdoptionForm.value = false;
    authMessage.value =
      "Trebuie să fii autentificat pentru a trimite o cerere de adopție.";
    return;
  }

  const validationError = validateAdoptionForm();

  if (validationError) {
    formError.value = validationError;
    return;
  }

  submitting.value = true;

  try {
    await addDoc(collection(db, "adoptionRequests"), {
  animalId: animal.value.id,
  animalName: animal.value.name,
  animalSpecies: animal.value.species,
  animalImageUrl: animal.value.imageUrl,

  userId: currentUser.value.uid,
  userEmail: currentUser.value.email,

  fullName: requestForm.value.fullName.trim(),
  email: requestForm.value.email.trim(),
  phone: requestForm.value.phone.trim(),
  message: requestForm.value.message.trim(),

  status: "pending",
  createdAt: new Date(),
});

    successMessage.value =
      "Cererea ta a fost trimisă cu succes și este în pending.";

    requestForm.value = {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    };
  } catch (error) {
    console.error("Eroare la trimiterea cererii:", error);
    formError.value = "Cererea nu a putut fi trimisă. Încearcă din nou.";
  } finally {
    submitting.value = false;
  }
};

const splitTags = (text) => {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
};

const goBack = () => {
  router.push("/pets");
};

const goToLogin = () => {
  router.push("/login");
};
</script>