<template>
  <div class="admin-page">
    <section class="admin-header">
      <div>
        <span>Admin PawMatch</span>
        <h1>Gestionare animăluțe</h1>
        <p>Adaugă, modifică sau șterge animăluțele disponibile pentru adopție.</p>
      </div>

      <button class="admin-add-btn" @click="openCreateForm">
        + Adaugă animal
      </button>
    </section>

    <section class="admin-content">
      <div v-if="checkingAuth" class="loading-box">Se verifică accesul...</div>

      <div v-else-if="!isAdmin" class="empty-box">
        Nu ai acces la această pagină.
      </div>

      <template v-else>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <div v-if="loading" class="loading-box">Se încarcă animăluțele...</div>

        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Imagine</th>
                <th>Nume</th>
                <th>Specie</th>
                <th>Rasă</th>
                <th>Oraș</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="animal in animals" :key="animal.id">
                <td>
                  <img class="admin-pet-img" :src="animal.imageUrl" :alt="animal.name" />
                </td>

                <td>{{ animal.name }}</td>
                <td>{{ animal.species }}</td>
                <td>{{ animal.breed }}</td>
                <td>{{ animal.city }}</td>
                <td>
                  <span class="admin-status">{{ animal.status }}</span>
                </td>

                <td>
                  <div class="admin-actions">
                    <button class="edit-btn" @click="openEditForm(animal)">Edit</button>
                    <button class="delete-btn" @click="confirmDelete(animal)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </section>

    <section v-if="showForm" class="admin-modal">
      <div class="admin-form-card">
        <div class="admin-form-header">
          <h2>{{ editingAnimalId ? "Editează animal" : "Adaugă animal" }}</h2>
          <button type="button" @click="closeForm">×</button>
        </div>

        <form class="admin-form" @submit.prevent="saveAnimal">
          <div class="form-row">
            <input v-model="form.name" type="text" placeholder="Nume" />

            <select v-model="form.species">
              <option value="">Alege specia</option>
              <option v-for="species in speciesOptions" :key="species" :value="species">
                {{ species }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <input v-model="form.breed" type="text" placeholder="Rasă" />
            <input v-model="form.ageLabel" type="text" placeholder="Vârstă / ex: 2 ani" />
          </div>

          <div class="form-row">
            <input v-model="form.city" type="text" placeholder="Oraș" />

            <select v-model="form.size">
              <option value="">Alege talia</option>
              <option v-for="size in sizeOptions" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <select v-model="form.gender">
              <option value="">Alege sexul</option>
              <option v-for="gender in genderOptions" :key="gender" :value="gender">
                {{ gender }}
              </option>
            </select>

            <select v-model="form.status">
              <option value="">Alege statusul</option>
              <option v-for="status in statusOptions" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <input v-model="form.imageUrl" type="text" placeholder="URL imagine" />
          <input v-model="form.temperament" type="text" placeholder="Temperament / ex: calm, jucăuș, afectuos" />

          <textarea v-model="form.description" placeholder="Descriere"></textarea>

          <div class="admin-checkboxes">
            <label>
              <input v-model="form.isVaccinated" type="checkbox" />
              Vaccinat
            </label>

            <label>
              <input v-model="form.isSterilized" type="checkbox" />
              Sterilizat
            </label>
          </div>

          <p v-if="formError" class="error-message">{{ formError }}</p>

          <button class="admin-save-btn" type="submit" :disabled="saving">
            {{ saving ? "Se salvează..." : "Salvează" }}
          </button>
        </form>
      </div>
    </section>

    <section v-if="animalToDelete" class="admin-modal">
      <div class="delete-confirm-card">
        <h2>Ștergere animal</h2>

        <p>
          Sigur vrei să ștergi animalul
          <strong>{{ animalToDelete.name }}</strong>?
        </p>

        <div class="delete-confirm-actions">
          <button class="cancel-delete-btn" @click="animalToDelete = null">
            Anulează
          </button>

          <button class="confirm-delete-btn" @click="deleteAnimal">
            Șterge
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const speciesOptions = ["Câine", "Pisică", "Iepuraș", "Pasăre", "Hamster"];
const sizeOptions = ["Mică", "Medie", "Mare"];
const genderOptions = ["Femelă", "Mascul"];
const statusOptions = ["Disponibil", "În proces de adopție", "Adoptat"];

const animals = ref([]);
const loading = ref(false);
const saving = ref(false);
const checkingAuth = ref(true);
const isAdmin = ref(false);

const showForm = ref(false);
const editingAnimalId = ref(null);
const animalToDelete = ref(null);

const successMessage = ref("");
const errorMessage = ref("");
const formError = ref("");

const emptyForm = () => ({
  name: "",
  species: "",
  breed: "",
  ageLabel: "",
  city: "",
  size: "",
  gender: "",
  status: "Disponibil",
  imageUrl: "",
  temperament: "",
  description: "",
  isVaccinated: false,
  isSterilized: false,
});

const form = ref(emptyForm());

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    isAdmin.value = user?.email === ADMIN_EMAIL;
    checkingAuth.value = false;

    if (isAdmin.value) {
      await loadAnimals();
    }
  });
});

const loadAnimals = async () => {
  loading.value = true;

  try {
    const snapshot = await getDocs(collection(db, "animals"));

    animals.value = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error(error);
    errorMessage.value = "Animăluțele nu au putut fi încărcate.";
  } finally {
    loading.value = false;
  }
};

const isValidImageUrl = (url) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const validateForm = () => {
  if (!form.value.name.trim()) return "Numele este obligatoriu.";
  if (form.value.name.trim().length < 2) return "Numele trebuie să aibă minimum 2 caractere.";

  if (!form.value.species) return "Specia este obligatorie.";
  if (!form.value.breed.trim()) return "Rasa este obligatorie.";
  if (!form.value.ageLabel.trim()) return "Vârsta este obligatorie.";
  if (!form.value.city.trim()) return "Orașul este obligatoriu.";
  if (!form.value.size) return "Talia este obligatorie.";
  if (!form.value.gender) return "Sexul este obligatoriu.";
  if (!form.value.status) return "Statusul este obligatoriu.";

  if (!form.value.imageUrl.trim()) return "URL-ul imaginii este obligatoriu.";
  if (!isValidImageUrl(form.value.imageUrl.trim())) {
    return "URL-ul imaginii trebuie să înceapă cu http:// sau https://.";
  }

  if (!form.value.temperament.trim()) return "Temperamentul este obligatoriu.";
  if (!form.value.description.trim()) return "Descrierea este obligatorie.";
  if (form.value.description.trim().length < 30) {
    return "Descrierea trebuie să aibă minimum 30 de caractere.";
  }

  return "";
};

const openCreateForm = () => {
  successMessage.value = "";
  errorMessage.value = "";
  formError.value = "";
  editingAnimalId.value = null;
  form.value = emptyForm();
  showForm.value = true;
};

const openEditForm = (animal) => {
  successMessage.value = "";
  errorMessage.value = "";
  formError.value = "";
  editingAnimalId.value = animal.id;

  form.value = {
    name: animal.name || "",
    species: animal.species || "",
    breed: animal.breed || "",
    ageLabel: animal.ageLabel || "",
    city: animal.city || "",
    size: animal.size || "",
    gender: animal.gender || "",
    status: animal.status || "Disponibil",
    imageUrl: animal.imageUrl || "",
    temperament: animal.temperament || "",
    description: animal.description || "",
    isVaccinated: animal.isVaccinated || false,
    isSterilized: animal.isSterilized || false,
  };

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingAnimalId.value = null;
  form.value = emptyForm();
};

const saveAnimal = async () => {
  formError.value = "";
  successMessage.value = "";
  errorMessage.value = "";

  const validationError = validateForm();

  if (validationError) {
    formError.value = validationError;
    return;
  }

  saving.value = true;

  const animalData = {
    name: form.value.name.trim(),
    species: form.value.species,
    breed: form.value.breed.trim(),
    ageLabel: form.value.ageLabel.trim(),
    city: form.value.city.trim(),
    size: form.value.size,
    gender: form.value.gender,
    status: form.value.status,
    imageUrl: form.value.imageUrl.trim(),
    temperament: form.value.temperament.trim(),
    description: form.value.description.trim(),
    isVaccinated: form.value.isVaccinated,
    isSterilized: form.value.isSterilized,
    updatedAt: new Date(),
  };

  try {
    if (editingAnimalId.value) {
      await updateDoc(doc(db, "animals", editingAnimalId.value), animalData);
      successMessage.value = "Animalul a fost modificat cu succes.";
    } else {
      await addDoc(collection(db, "animals"), {
        ...animalData,
        createdAt: new Date(),
      });

      successMessage.value = "Animalul a fost adăugat cu succes.";
    }

    closeForm();
    await loadAnimals();
  } catch (error) {
    console.error(error);
    errorMessage.value = "Animalul nu a putut fi salvat.";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (animal) => {
  successMessage.value = "";
  errorMessage.value = "";
  animalToDelete.value = animal;
};

const deleteAnimal = async () => {
  if (!animalToDelete.value) return;

  try {
    await deleteDoc(doc(db, "animals", animalToDelete.value.id));

    animals.value = animals.value.filter(
      (animal) => animal.id !== animalToDelete.value.id
    );

    successMessage.value = "Animalul a fost șters cu succes.";
    animalToDelete.value = null;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Animalul nu a putut fi șters.";
  }
};
</script>