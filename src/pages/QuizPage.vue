<template>
  <div class="quiz-page">
    <section v-if="!showResults" class="quiz-shell">
      <div class="quiz-top">
        <span>Quiz PawMatch</span>
        <strong>{{ currentStep + 1 }} / {{ questions.length }}</strong>
      </div>

      <div class="quiz-progress">
        <div
          class="quiz-progress-fill"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <transition name="quiz-slide" mode="out-in">
        <div class="quiz-step-card" :key="currentQuestion.id">
          <div class="quiz-icon">{{ currentQuestion.icon }}</div>

          <h1>{{ currentQuestion.text }}</h1>
          <p>{{ currentQuestion.description }}</p>

          <div class="quiz-choice-grid">
            <button
              v-for="option in currentQuestion.options"
              :key="option.value"
              class="quiz-choice"
              :class="{ selected: answers[currentQuestion.id] === option.value }"
              @click="selectAnswer(currentQuestion.id, option.value)"
            >
              <span>{{ option.emoji }}</span>
              <strong>{{ option.label }}</strong>
              <small>{{ option.hint }}</small>
            </button>
          </div>
        </div>
      </transition>

      <div class="quiz-navigation">
        <button
          class="quiz-nav-btn secondary"
          :disabled="currentStep === 0"
          @click="previousStep"
        >
          ← Înapoi
        </button>

        <button
          class="quiz-nav-btn primary"
          :disabled="!answers[currentQuestion.id]"
          @click="nextStep"
        >
          {{ isLastQuestion ? "Vezi recomandările" : "Continuă →" }}
        </button>
      </div>
    </section>

    <section v-else class="quiz-results">
      <div class="results-header">
        <div>
          <h2>Recomandările tale PawMatch</h2>
          <p>Animăluțele sunt sortate după scorul de compatibilitate.</p>
        </div>

        <button class="reset-filters-btn" @click="resetQuiz">
          Reia quiz-ul
        </button>
      </div>

      <div v-if="loading" class="loading-box">
        Se calculează recomandările...
      </div>

      <div v-else class="pets-grid">
        <article
          v-for="animal in recommendedAnimals"
          :key="animal.id"
          class="pet-card"
        >
          <div class="pet-photo">
            <img :src="animal.imageUrl" :alt="animal.name" loading="lazy" />
          </div>

          <div class="pet-content">
            <div class="pet-title-row">
              <h3>{{ animal.name }}</h3>
              <span class="pet-status">{{ animal.score }} puncte</span>
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
              <button class="details-btn" @click="goToPet(animal.id)">
                Vezi profilul
              </button>
              <button class="favorite-outline">♡</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "vue-router";
import { db } from "../firebase";

const router = useRouter();

const loading = ref(false);
const showResults = ref(false);
const currentStep = ref(0);
const recommendedAnimals = ref([]);

const answers = ref({
  home: "",
  time: "",
  energy: "",
  experience: "",
  personality: "",
});

const questions = [
  {
    id: "home",
    icon: "🏡",
    text: "Cum arată spațiul tău de acasă?",
    description: "Alegem animăluțe potrivite pentru locuința ta.",
    options: [
      {
        label: "Apartament mic",
        value: "small_apartment",
        emoji: "🏢",
        hint: "Spațiu compact, ideal pentru companioni mici",
      },
      {
        label: "Apartament mare",
        value: "large_apartment",
        emoji: "🏙️",
        hint: "Mai mult loc pentru joacă și relaxare",
      },
      {
        label: "Casă cu curte",
        value: "house",
        emoji: "🏡",
        hint: "Perfect pentru animale active",
      },
    ],
  },
  {
    id: "time",
    icon: "⏰",
    text: "Cât timp poți petrece zilnic cu el?",
    description: "Unele animăluțe au nevoie de mai multă atenție decât altele.",
    options: [
      {
        label: "Sub 1 oră",
        value: "low",
        emoji: "🌙",
        hint: "Prefer un companion mai independent",
      },
      {
        label: "1-2 ore",
        value: "medium",
        emoji: "☀️",
        hint: "Pot oferi atenție zilnică moderată",
      },
      {
        label: "Peste 2 ore",
        value: "high",
        emoji: "🌈",
        hint: "Vreau timp mult pentru joacă și plimbări",
      },
    ],
  },
  {
    id: "energy",
    icon: "⚡",
    text: "Ce energie ți se potrivește?",
    description: "Alege ritmul care se potrivește cel mai bine stilului tău.",
    options: [
      {
        label: "Calm",
        value: "calm",
        emoji: "🧸",
        hint: "Liniște, relaxare și companie blândă",
      },
      {
        label: "Moderat",
        value: "moderate",
        emoji: "🐾",
        hint: "Un echilibru între joacă și calm",
      },
      {
        label: "Energic",
        value: "active",
        emoji: "🎾",
        hint: "Plimbări, joacă și multă mișcare",
      },
    ],
  },
  {
    id: "experience",
    icon: "🧠",
    text: "Câtă experiență ai cu animalele?",
    description: "Îți recomandăm un companion potrivit nivelului tău.",
    options: [
      {
        label: "Începător",
        value: "beginner",
        emoji: "🌱",
        hint: "Vreau un animăluț ușor de îngrijit",
      },
      {
        label: "Intermediar",
        value: "medium",
        emoji: "🌿",
        hint: "Am mai avut animale înainte",
      },
      {
        label: "Experimentat",
        value: "experienced",
        emoji: "🌳",
        hint: "Pot gestiona nevoi mai complexe",
      },
    ],
  },
  {
    id: "personality",
    icon: "💖",
    text: "Ce personalitate cauți?",
    description: "Ultimul pas: vibe-ul companionului tău ideal.",
    options: [
      {
        label: "Afectuos",
        value: "afectuos",
        emoji: "🤍",
        hint: "Vreau un animăluț lipicios și iubitor",
      },
      {
        label: "Independent",
        value: "independent",
        emoji: "✨",
        hint: "Îmi place un companion mai autonom",
      },
      {
        label: "Jucăuș",
        value: "jucăuș",
        emoji: "🧶",
        hint: "Vreau energie și distracție",
      },
      {
        label: "Protector",
        value: "protector",
        emoji: "🛡️",
        hint: "Caut loialitate și atașament",
      },
    ],
  },
];

const currentQuestion = computed(() => questions[currentStep.value]);
const isLastQuestion = computed(() => currentStep.value === questions.length - 1);

const progressPercent = computed(() => {
  return ((currentStep.value + 1) / questions.length) * 100;
});

const selectAnswer = (questionId, value) => {
  answers.value[questionId] = value;
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const nextStep = () => {
  if (isLastQuestion.value) {
    calculateRecommendations();
  } else {
    currentStep.value++;
  }
};

const calculateScore = (animal) => {
  let score = 0;
  const temperament = animal.temperament?.toLowerCase() || "";

  if (answers.value.home === "small_apartment") {
    if (animal.size === "Mică") score += 3;
    if (["Pisică", "Iepuraș", "Pasăre"].includes(animal.species)) score += 2;
  }

  if (answers.value.home === "large_apartment") {
    if (["Mică", "Medie"].includes(animal.size)) score += 2;
  }

  if (answers.value.home === "house") {
    if (animal.size === "Mare" || animal.species === "Câine") score += 3;
  }

  if (answers.value.time === "low") {
    if (temperament.includes("calm") || temperament.includes("independent")) score += 3;
  }

  if (answers.value.time === "medium") {
    if (temperament.includes("blând") || temperament.includes("prietenos")) score += 2;
  }

  if (answers.value.time === "high") {
    if (temperament.includes("energic") || temperament.includes("jucăuș")) score += 3;
  }

  if (answers.value.energy === "calm") {
    if (temperament.includes("calm") || temperament.includes("blând")) score += 3;
  }

  if (answers.value.energy === "moderate") {
    if (temperament.includes("prietenos") || temperament.includes("curios")) score += 2;
  }

  if (answers.value.energy === "active") {
    if (temperament.includes("energic") || temperament.includes("jucăuș")) score += 3;
  }

  if (answers.value.experience === "beginner") {
    if (temperament.includes("blând") || temperament.includes("calm")) score += 2;
  }

  if (answers.value.experience === "experienced") {
    if (temperament.includes("protector") || animal.size === "Mare") score += 2;
  }

  if (answers.value.personality) {
    if (temperament.includes(answers.value.personality)) score += 4;
  }

  return score;
};

const calculateRecommendations = async () => {
  loading.value = true;
  showResults.value = true;

  const snapshot = await getDocs(collection(db, "animals"));

  const animals = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  recommendedAnimals.value = animals
    .map((animal) => ({
      ...animal,
      score: calculateScore(animal),
    }))
    .sort((a, b) => b.score - a.score);

  loading.value = false;
};

const resetQuiz = () => {
  answers.value = {
    home: "",
    time: "",
    energy: "",
    experience: "",
    personality: "",
  };

  currentStep.value = 0;
  recommendedAnimals.value = [];
  showResults.value = false;
};

const splitTags = (text) => {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
};

const goToPet = (id) => {
  router.push(`/pets/${id}`);
};
</script>