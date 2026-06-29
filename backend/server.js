import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

dotenv.config();

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const adminAuth = getAuth();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));

app.use(express.json());

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Trebuie sa fii autentificat.",
    });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalid sau expirat.",
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    const isAdminByRole =
      userDoc.exists && userDoc.data().role === "admin";

    const isAdminByEmail =
      req.user.email === process.env.ADMIN_EMAIL;

    if (!isAdminByRole && !isAdminByEmail) {
      return res.status(403).json({
        message: "Acces interzis. Doar adminul poate accesa aceasta ruta.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Nu s-a putut verifica rolul utilizatorului.",
    });
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "PawMatch API functioneaza.",
  });
});


app.get("/api/quiz", authMiddleware, async (req, res) => {
  try {
    const quizDoc = await db
      .collection("users")
      .doc(req.user.uid)
      .collection("quizResults")
      .doc("latest")
      .get();

    res.json({
      message: "Acces permis pentru quiz.",
      quizResult: quizDoc.exists ? quizDoc.data() : null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Datele quizului nu au putut fi incarcate.",
    });
  }
});

app.get("/api/requests", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db
      .collection("adoptionRequests")
      .where("userId", "==", req.user.uid)
      .get();

    const requests = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    res.json({
      message: "Acces permis pentru cererile userului.",
      requests,
    });
  } catch (error) {
    res.status(500).json({
      message: "Cererile nu au putut fi incarcate.",
    });
  }
});

app.get("/api/favorites", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .doc(req.user.uid)
      .collection("favorites")
      .get();

    const favorites = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));

    res.json({
      message: "Acces permis pentru favorite.",
      favorites,
    });
  } catch (error) {
    res.status(500).json({
      message: "Favoritele nu au putut fi incarcate.",
    });
  }
});


app.get(
  "/api/admin/pets",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const snapshot = await db.collection("animals").get();

      const animals = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      res.json({
        message: "Acces admin permis pentru pets.",
        animals,
      });
    } catch (error) {
      res.status(500).json({
        message: "Animalele nu au putut fi incarcate.",
      });
    }
  }
);

app.get(
  "/api/admin/requests",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const snapshot = await db.collection("adoptionRequests").get();

      const requests = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      res.json({
        message: "Acces admin permis pentru cereri.",
        requests,
      });
    } catch (error) {
      res.status(500).json({
        message: "Cererile nu au putut fi incarcate.",
      });
    }
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PawMatch API running on port ${PORT}`);
});