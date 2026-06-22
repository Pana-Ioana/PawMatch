<template>
  <nav class="navbar">
    <router-link to="/" class="logo">
  🐾 <span>PawMatch</span>
</router-link>

    <div class="nav-links">
      <router-link to="/" class="nav-link">
        Acasă
      </router-link>

      <router-link to="/pets" class="nav-link">
        Animăluțe
      </router-link>

      <router-link to="/quiz" class="nav-link">
        Quiz
      </router-link>

      <router-link to="/favorites" class="nav-link">
        Favorite
      </router-link>
    </div>

    <button class="account-btn">
      Contul meu
    </button>
  </nav>
</template>