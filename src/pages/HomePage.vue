<template>
  <div class="page">
    <nav class="navbar">
      <div class="logo">🐾 <span>PawMatch</span></div>

      <div class="nav-links">
        <a>Acasă</a>
        <router-link to="/pets" class="nav-link">Animăluțe</router-link>
        <a>Quiz</a>
        <a>Favorite</a>
      </div>

      <button class="account-btn">Contul meu</button>
    </nav>

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
            <button class="primary-btn">Începe quiz-ul</button>
            <button class="secondary-btn" @click="goToPets">Vezi animăluțele</button>
          </div>
        </div>

        <div class="hero-image">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
            alt="pets"
          />
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
          <button class="dark-btn">Fă quiz-ul 🐾</button>
        </div>
      </section>

      <section class="section-header">
        <h2>Recomandări pentru tine ♡</h2>
        <a>Vezi toate →</a>
      </section>

      <section class="pet-grid">
        <article class="pet-card" v-for="pet in pets" :key="pet.name">
          <div class="pet-img">
            <img :src="pet.img" :alt="pet.name" />
            <button>♡</button>
          </div>

          <div class="pet-info">
            <h3>{{ pet.name }} <span>{{ pet.type }}</span></h3>
            <p>{{ pet.info }}</p>
            <small>{{ pet.tag }}</small>
          </div>
        </article>
      </section>

      <section>
        <h2 class="title">Explorează pe categorii</h2>

        <div class="category-grid">
          <div
            class="category"
            v-for="category in categories"
            :key="category.name"
          >
            <div>{{ category.icon }}</div>
            <strong>{{ category.name }}</strong>
          </div>
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

        <button class="dark-btn">Începe adopția 🐾</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'

const router = useRouter()

const goToPets = () => {
    router.push("/pets")
}
const pets = [
  {
    name: "Milo",
    type: "Cățel",
    info: "1 an • Talie medie",
    tag: "Jucăuș 🐾",
    img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Luna",
    type: "Pisică",
    info: "8 luni • Femelă",
    tag: "Afectuoasă 🐾",
    img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Biscuit",
    type: "Iepuraș",
    info: "7 luni • Mascul",
    tag: "Blând 🐾",
    img: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Rex",
    type: "Cățel",
    info: "2 ani • Talie mare",
    tag: "Loial 🐾",
    img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80",
  },
];

const categories = [
  { icon: "🐶", name: "Câini" },
  { icon: "🐱", name: "Pisici" },
  { icon: "🐰", name: "Iepurași" },
  { icon: "🦜", name: "Păsări" },
  { icon: "🐕", name: "Senior pets" },
  { icon: "💞", name: "Special care" },
];
</script>