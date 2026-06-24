<template>
  <nav class="navbar">
    <router-link to="/" class="logo">
      🐾 <span>PawMatch</span>
    </router-link>

    <div class="nav-links">
      <router-link to="/" class="nav-link">Acasă</router-link>
      <router-link to="/pets" class="nav-link">Animăluțe</router-link>
      <router-link to="/quiz" class="nav-link">Quiz</router-link>
      <router-link to="/favorites" class="nav-link">Favorite</router-link>
    </div>

    <div class="account-area">
      <button v-if="!userName" class="account-btn" @click="goToLogin">
        Contul meu
      </button>

      <button v-else class="account-btn" @click="logoutUser">
        {{ userName }}
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const router = useRouter();
const userName = ref("");

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      userName.value = "";
      localStorage.removeItem("pawmatchUser");
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      userName.value = `${data.firstName} ${data.lastName}`;

      localStorage.setItem(
        "pawmatchUser",
        JSON.stringify({
          uid: user.uid,
          ...data,
        })
      );
    }
  });
});

const goToLogin = () => {
  router.push("/login");
};

const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("pawmatchUser");
  userName.value = "";
  router.push("/");
};
</script>