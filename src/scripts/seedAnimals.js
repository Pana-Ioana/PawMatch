import { faker } from "@faker-js/faker";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const speciesData = {
  "Câine": {
    breeds: ["Metis", "Labrador", "Beagle", "Golden Retriever", "Border Collie", "Bulldog", "Poodle", "Chihuahua", "Dachshund", "Shih Tzu", "Rottweiler", "Boxer", "Schnauzer", "Cocker Spaniel", "Doberman", "Mastiff", "Husky", "Akita", "Bichon Frise", "Australian Shepherd"],
    images: [
      "https://images.unsplash.com/photo-1552053831-71594a27632d",
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
      "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    ],
  },
  "Pisică": {
    breeds: ["Europeană", "British Shorthair", "Siameză", "Persană", "Maine Coon", "Bengaleză", "Siberiană", "Ragdoll", "Norvegiană de Pădure", "Sphynx", "Scottish Fold", "Devon Rex", "Orientală", "Turkish Van", "Abyssinian", "Birmană", "Himalayană", "Exotic Shorthair", "Cornish Rex", "Ocicat", "Manx", "Balineză", "LaPerm", "Korat", "Singapura", "Toyger", "Chausie", "Savannah"],
    images: [
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006",
      "https://images.unsplash.com/photo-1495360010541-f48722b34f7d",
    ],
  },
  "Iepuraș": {
    breeds: ["Lop", "Mini Rex", "Angora", "Holland Lop", "Lionhead", "Flemish Giant", "Netherland Dwarf", "Rex", "English Spot", "Harlequin", "Silver Marten", "Tan", "Dutch", "Polish", "Californian", "New Zealand", "Chinchilla", "Satins", "Himalayan", "American Fuzzy Lop", "French Lop", "Mini Lop", "English Lop", "Jersey Wooly", "Hotot", "Rhinelander", "Blanc de Hotot", "Checkered Giant"],
    images: [
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308",
    ],
  },
  "Pasăre": {
    breeds: ["Peruș", "Canar", "Papagal Nimfă", "Papagal Ara", "Papagal Amazon", "Papagal Eclectus", "Papagal Caique", "Papagal Senegal", "Papagal Conure", "Papagal Pionus", "Papagal Lory", "Papagal Lorikeet", "Papagal Cockatiel", "Papagal Budgerigar", "Papagal Lovebird", "Papagal Parakeet", "Papagal Macaw", "Papagal African Grey", "Papagal Indian Ringneck", "Papagal Alexandrine Parakeet", "Papagal Quaker Parrot", "Papagal Monk Parakeet", "Papagal Bourke's Parakeet", "Papagal Rosella", "Papagal Eclectus Parrot", "Papagal Blue-and-Gold Macaw", "Papagal Scarlet Macaw", "Papagal Hyacinth Macaw", "Papagal Green-Cheeked Conure", "Papagal Sun Conure", "Papagal Jenday Conure", "Papagal Nanday Conure", "Papagal Black-Capped Conure", "Papagal White-Crowned Parrot", "Papagal Red-Lored Amazon", "Papagal Yellow-Naped Amazon", "Papagal Blue-Fronted Amazon", "Papagal Orange-Winged Amazon", "Papagal Double Yellow-Headed Amazon", "Papagal Lilac-Crowned Amazon", "Papagal Mealy Amazon", "Papagal Red-Bellied Parrot", "Papagal Senegal Parrot", "Papagal Meyer's Parrot", "Papagal Brown-Headed Parrot"],
    images: [
      "https://images.unsplash.com/photo-1444464666168-49d633b86797",
    ],
  },
};

const temperaments = [
  "Jucăuș",
  "Loial",
  "Blând",
  "Curios",
  "Calm",
  "Energic",
  "Prietenos",
  "Afectuos",
  "Independent",
  "Protector",
  "Inteligent",
  "Sociabil",
  "Ascultător",
  "Curajos",
  "Răbdător",
  "Timid",
];

const cities = ["București", "Cluj", "Brașov", "Iași", "Constanța", "Timișoara", "Sibiu", "Oradea", "Ploiești", "Craiova", "Galați", "Bacău", "Arad", "Pitești", "Baia Mare", "Buzău", "Satu Mare", "Târgu Mureș", "Râmnicu Vâlcea", "Suceava", "Drobeta-Turnu Severin", "Bistrița", "Focșani", "Slatina", "Deva", "Alba Iulia", "Hunedoara", "Reșița", "Tulcea", "Călărași", "Giurgiu", "Zalău", "Târgoviște", "Vaslui", "Botoșani", "Sighișoara", "Roman", "Mediaș", "Sighetu Marmației", "Curtea de Argeș", "Călimănești", "Mangalia", "Tecuci", "Făgăraș", "Motru", "Caracal", "Vatra Dornei", "Ocna Sibiului", "Băile Herculane", "Băile Tușnad", "Borsec", "Sovata", "Călimani", "Piatra Neamț", "Târgu Jiu", "Slobozia", "Romania"];

function generateAnimal() {
  const species = faker.helpers.arrayElement(Object.keys(speciesData));
  const data = speciesData[species];

  const age = faker.number.int({ min: 1, max: 10 });

  return {
    name: faker.person.firstName(),
    species,
    breed: faker.helpers.arrayElement(data.breeds),
    age,
    ageLabel: age === 1 ? "1 an" : `${age} ani`,
    gender: faker.helpers.arrayElement(["Mascul", "Femelă"]),
    size: faker.helpers.arrayElement(["Mică", "Medie", "Mare"]),
    city: faker.helpers.arrayElement(cities),
    status: "Disponibil",
    description: "Un companion minunat care își caută o familie iubitoare.",
    imageUrl: faker.helpers.arrayElement(data.images),
    temperament: faker.helpers.arrayElements(temperaments, 3).join(", "),
    isVaccinated: faker.datatype.boolean(),
    isSterilized: faker.datatype.boolean(),
    isUrgent: faker.datatype.boolean(),
    createdAt: new Date(),
  };
}

async function seedAnimals(count = 20) {
  for (let i = 0; i < count; i++) {
    const animal = generateAnimal();
    await addDoc(collection(db, "animals"), animal);
    console.log(`Added: ${animal.name} - ${animal.species}`);
  }

  console.log(`Done. Added ${count} animals.`);
}

seedAnimals(20);