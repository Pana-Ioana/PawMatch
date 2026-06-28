<template>
  <div>
    <main>
      <section class="hero">
        <div class="hero-text">
          <h1>
            Găsește animăluțul<br />
            care ți se potrivește<br />
            <span>perfect</span>
          </h1>

          <p>
            Adoptă responsabil un cățel, o pisică sau un companion mic,
            pe baza stilului tău de viață.
          </p>

          <div class="hero-buttons">
            <button class="primary-btn" @click="goToQuiz">
              Începe quiz-ul
            </button>

            <button class="secondary-btn" @click="goToPets">
              Vezi animăluțele
            </button>
          </div>
        </div>

        <div class="hero-image">
          <img
  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
  alt="pets"
/>
        </div>
      </section>

      <section class="home-stats">
        <div class="stat-card">
          <h3>{{ stats.animals }}</h3>
          <span>animăluțe disponibile</span>
        </div>

        <div class="stat-card">
          <h3>{{ stats.requests }}</h3>
          <span>cereri de adopție</span>
        </div>

        <div class="stat-card">
          <h3>{{ stats.adopted }}</h3>
          <span>adopții reușite</span>
        </div>
      </section>

      <section class="quiz-box">
        <div class="quiz-icon">📋</div>

        <div>
          <h2>Nu știi ce animăluț ți se potrivește?</h2>

          <p>
            Răspunde la câteva întrebări despre programul tău, spațiu,
            energie și experiență, iar PawMatch îți recomandă companionul ideal.
          </p>

          <button class="dark-btn" @click="goToQuiz">
            Fă quiz-ul 🐾
          </button>
        </div>
      </section>

      <section class="section-header">
        <h2>Recomandări pentru tine ♡</h2>

        <button class="text-link-btn" @click="goToPets">
          Vezi toate →
        </button>
      </section>

      <section v-if="loading" class="loading-box">
        Se încarcă recomandările...
      </section>

      <section v-else-if="recommendedPets.length === 0" class="empty-box">
        Nu există încă animăluțe disponibile.
      </section>

      <section v-else class="home-pet-grid">
        <article
  class="home-pet-card"
  v-for="pet in recommendedPets"
  :key="pet.id"
>
  <div class="home-pet-image">
    <img :src="pet.imageUrl" :alt="pet.name" />

    <button
      class="home-favorite-btn"
      :class="{ active: isFavorite(pet.id) }"
      @click="toggleFavorite(pet)"
    >
      {{ isFavorite(pet.id) ? "♥" : "♡" }}
    </button>
  </div>

  <div class="home-pet-info">
    <div class="home-pet-title">
      <h3>{{ pet.name }}</h3>
      <span>{{ pet.species }}</span>
    </div>

    <p>{{ pet.ageLabel }} • {{ pet.size || "Talie nespecificată" }}</p>

    <small>{{ pet.temperament || "Companion iubitor" }}</small>

    <button class="mini-details-btn" @click="goToPetDetails(pet.id)">
      Vezi profilul
    </button>
  </div>
</article>
      </section>

      <div v-if="favoriteMessage" class="success-message home-feedback">
        {{ favoriteMessage }}
      </div>

      <div v-if="favoriteError" class="auth-required-box home-feedback">
        <p>{{ favoriteError }}</p>

        <button @click="goToLogin">
          Mergi la login
        </button>
      </div>

      <section>
        <h2 class="title">Explorează pe categorii</h2>

        <div class="category-grid">
          <button
            class="category"
            v-for="category in categories"
            :key="category.name"
            @click="goToPets"
          >
            <div>{{ category.icon }}</div>
            <strong>{{ category.name }}</strong>
            <small>
  {{ category.count }} animăluțe disponibile
</small>
          </button>
        </div>
      </section>

      <section>
        <h2 class="title">Cum funcționează PawMatch</h2>

        <div class="steps">
          <div>
            <b>1</b>
            <div class="circle">📝</div>
            <h3>Completezi quiz-ul</h3>
            <p>Răspunde la câteva întrebări despre tine.</p>
          </div>

          <div>
            <b>2</b>
            <div class="circle">💖</div>
            <h3>Alegi animăluțul</h3>
            <p>Primești recomandări potrivite stilului tău.</p>
          </div>

          <div>
            <b>3</b>
            <div class="circle">🏠</div>
            <h3>Trimiți cererea</h3>
            <p>Faci primul pas spre adopție.</p>
          </div>
        </div>
      </section>

      <section class="cta">
        <div>
          <h2>Un suflet mic te așteaptă.</h2>
          <p>Fă diferența în viața unui animăluț.</p>
        </div>

        <button class="dark-btn" @click="goToPets">
          Începe adopția 🐾
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useFavorites } from "../composables/useFavorites";

const router = useRouter();

const loading = ref(true);
const animals = ref([]);
const adoptionRequests = ref([]);


const {
  favoriteMessage,
  favoriteError,
  isFavorite,
  toggleFavorite,
} = useFavorites();

onMounted(async () => {
  try {
    const animalsSnapshot = await getDocs(collection(db, "animals"));
    const requestsSnapshot = await getDocs(collection(db, "adoptionRequests"));

    animals.value = animalsSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    adoptionRequests.value = requestsSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("Eroare la încărcarea homepage:", error);
  } finally {
    loading.value = false;
  }
});

const availableAnimals = computed(() => {
  return animals.value.filter((animal) => animal.status !== "Adoptat");
});

const recommendedPets = computed(() => {
  return availableAnimals.value.slice(0, 4);
});


const stats = computed(() => {
  return {
    animals: availableAnimals.value.length,
    requests: adoptionRequests.value.length,
    adopted: animals.value.filter((animal) => animal.status === "Adoptat").length,
  };
});

const categoryIcons = {
  Câine: "🐶",
  Pisică: "🐱",
  Iepuraș: "🐰",
  Pasăre: "🦜",
  Hamster: "🐹",
};

const categories = computed(() => {
  const grouped = {};

  availableAnimals.value.forEach((animal) => {
    if (!animal.species) return;

    grouped[animal.species] = (grouped[animal.species] || 0) + 1;
  });

  return Object.entries(grouped).map(([name, count]) => ({
    name,
    count,
    icon: categoryIcons[name] || "🐾",
  }));
});

const goToPets = () => {
  router.push("/pets");
};

const goToQuiz = () => {
  router.push("/quiz");
};

const goToLogin = () => {
  router.push("/login");
};

const goToPetDetails = (id) => {
  router.push(`/pets/${id}`);
};
</script>