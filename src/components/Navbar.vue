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

    <button
      class="account-btn"
      @click="handleAccountClick"
    >
      {{ displayName }}
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import { auth, db } from "../firebase";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const router = useRouter();

const displayName = ref("Contul meu");

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      displayName.value = "Contul meu";
      return;
    }

    try {
      const snapshot = await getDoc(
        doc(db, "users", user.uid)
      );

      if (snapshot.exists()) {
        const data = snapshot.data();

        displayName.value =
          `${data.firstName} ${data.lastName}`;
      }
    } catch (error) {
      console.error(error);
    }
  });
});

const handleAccountClick = () => {
  if (displayName.value === "Contul meu") {
    router.push("/register");
  } else {
    router.push("/profile");
  }
};
</script>