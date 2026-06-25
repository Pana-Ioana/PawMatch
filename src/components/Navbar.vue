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

      <div v-else class="user-dropdown">
        <button class="account-btn" @click="toggleDropdown">
          👤 {{ userName }}
        </button>

        <div v-if="dropdownOpen" class="dropdown-menu">
          <button @click="goToMyRequests">
            Cererile mele de adopție
          </button>

          <button @click="goToFavorites">
            Favoritele mele
          </button>

          <button v-if="!confirmLogout" @click="confirmLogout = true">
            Ieși din cont
          </button>

          <div v-else class="logout-confirm">
            <p>Sigur vrei să ieși?</p>

            <div>
              <button class="cancel-logout-btn" @click="confirmLogout = false">
                Anulează
              </button>

              <button class="confirm-logout-btn" @click="logoutUser">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
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
const dropdownOpen = ref(false);
const confirmLogout = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      userName.value = "";
      dropdownOpen.value = false;
      confirmLogout.value = false;
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

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
  confirmLogout.value = false;
};

const goToLogin = () => {
  router.push("/login");
};

const goToMyRequests = () => {
  dropdownOpen.value = false;
  router.push("/my-requests");
};

const goToFavorites = () => {
  dropdownOpen.value = false;
  router.push("/favorites");
};

const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem("pawmatchUser");

  userName.value = "";
  dropdownOpen.value = false;
  confirmLogout.value = false;

  router.push("/");
};
</script>