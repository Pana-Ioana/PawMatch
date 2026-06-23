<template>
  <div class="auth-page">
    <section class="auth-card simple-auth-card">
      <div class="auth-intro">
        <span>🐾 PawMatch</span>

        <h1>Bine ai revenit</h1>

        <p>
          Autentifică-te pentru a salva animăluțe favorite, a trimite cereri de
          adopție și a urmări statusul acestora.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="loginUser">
        <input v-model="form.email" type="email" placeholder="Email" />
        <input v-model="form.password" type="password" placeholder="Parolă" />

        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? "Se verifică datele..." : "Autentifică-te" }}
        </button>

        <div class="auth-footer">
          Nu ai cont?
          <router-link to="/register">Creează cont</router-link>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");

const form = ref({
  email: "",
  password: "",
});

const validateForm = () => {
  if (!form.value.email.trim()) return "Emailul este obligatoriu.";
  if (!form.value.password) return "Parola este obligatorie.";

  return "";
};

const loginUser = async () => {
  errorMessage.value = "";

  const validationError = validateForm();

  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  loading.value = true;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      form.value.email.trim(),
      form.value.password
    );

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

    if (userDoc.exists()) {
      localStorage.setItem(
        "pawmatchUser",
        JSON.stringify({
          uid: userCredential.user.uid,
          ...userDoc.data(),
        })
      );
    }

    router.push("/");
  } catch (error) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      errorMessage.value = "Emailul sau parola este incorectă.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage.value = "Emailul introdus nu este valid.";
    } else {
      errorMessage.value = "Autentificarea nu a reușit. Încearcă din nou.";
    }
  } finally {
    loading.value = false;
  }
};
</script>