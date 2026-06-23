<template>
  <div class="auth-page">
    <section class="auth-card simple-auth-card">
      <div class="auth-intro">
        <span>🐾 PawMatch</span>
        <h1>Creează cont</h1>
        <p>Creează-ți contul pentru favorite și cereri de adopție.</p>
      </div>

      <form class="auth-form" @submit.prevent="registerUser">
        <div class="form-row">
          <input v-model="form.firstName" type="text" placeholder="Prenume" />
          <input v-model="form.lastName" type="text" placeholder="Nume" />
        </div>

        <input v-model="form.email" type="email" placeholder="Email" />
        <input v-model="form.password" type="password" placeholder="Parolă" />
        <input v-model="form.confirmPassword" type="password" placeholder="Confirmă parola" />

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? "Se creează contul..." : "Creează cont" }}
        </button>

        <div class="auth-footer">
          Ai deja cont?
          <router-link to="/login">Autentifică-te</router-link>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const router = useRouter();

const loading = ref(false);
const errorMessage = ref("");

const form = ref({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const validateForm = () => {
  if (!form.value.firstName.trim()) return "Prenumele este obligatoriu.";
  if (!form.value.lastName.trim()) return "Numele este obligatoriu.";
  if (!form.value.email.trim()) return "Emailul este obligatoriu.";
  if (form.value.password.length < 6) return "Parola trebuie să aibă minimum 6 caractere.";
  if (form.value.password !== form.value.confirmPassword) return "Parolele nu coincid.";
  return "";
};

const registerUser = async () => {
  errorMessage.value = "";

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  loading.value = true;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      form.value.email.trim(),
      form.value.password
    );

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      firstName: form.value.firstName.trim(),
      lastName: form.value.lastName.trim(),
      email: form.value.email.trim(),
      role: "user",
      createdAt: new Date(),
    });

    router.push("/");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      errorMessage.value = "Există deja un cont cu acest email.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage.value = "Emailul nu este valid.";
    } else if (error.code === "auth/operation-not-allowed") {
      errorMessage.value = "Activează Email/Password în Firebase Authentication.";
    } else {
      errorMessage.value = "A apărut o eroare. Încearcă din nou.";
    }
  } finally {
    loading.value = false;
  }
};
</script>