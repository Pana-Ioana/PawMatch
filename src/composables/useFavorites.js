import { ref } from "vue";
import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export function useFavorites() {
  const currentUser = ref(null);
  const favoriteIds = ref([]);
  const favoriteMessage = ref("");
  const favoriteError = ref("");

  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user;

    if (user) {
      await loadFavorites(user.uid);
    } else {
      favoriteIds.value = [];
    }
  });

  const loadFavorites = async (userId) => {
    const snapshot = await getDocs(
      collection(db, "users", userId, "favorites")
    );

    favoriteIds.value = snapshot.docs.map((docItem) => docItem.id);
  };

  const isFavorite = (animalId) => {
    return favoriteIds.value.includes(animalId);
  };

  const toggleFavorite = async (animal) => {
    favoriteMessage.value = "";
    favoriteError.value = "";

    if (!currentUser.value) {
      favoriteError.value =
        "Trebuie să fii autentificat pentru a adăuga animăluțe la favorite.";
      return;
    }

    const favoriteRef = doc(
      db,
      "users",
      currentUser.value.uid,
      "favorites",
      animal.id
    );

    if (isFavorite(animal.id)) {
      await deleteDoc(favoriteRef);
      favoriteIds.value = favoriteIds.value.filter((id) => id !== animal.id);
      favoriteMessage.value = `${animal.name} a fost eliminat din favorite.`;
      return;
    }

    await setDoc(favoriteRef, {
      animalId: animal.id,
      animalName: animal.name,
      animalSpecies: animal.species,
      animalBreed: animal.breed,
      animalAgeLabel: animal.ageLabel,
      animalCity: animal.city,
      animalImageUrl: animal.imageUrl,
      animalDescription: animal.description,
      createdAt: new Date(),
    });

    favoriteIds.value.push(animal.id);
    favoriteMessage.value = `${animal.name} a fost adăugat la favorite.`;
  };

  return {
    currentUser,
    favoriteIds,
    favoriteMessage,
    favoriteError,
    isFavorite,
    toggleFavorite,
  };
}