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
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Trebuie să fii autentificat.",
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
  const userDoc = await db.collection("users").doc(req.user.uid).get();

  if (!userDoc.exists || userDoc.data().role !== "admin") {
    return res.status(403).json({
      message: "Acces interzis. Doar adminul poate accesa această rută.",
    });
  }

  next();
};

app.get("/", (req, res) => {
  res.json({ message: "PawMatch API funcționează." });
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  const userDoc = await db.collection("users").doc(req.user.uid).get();

  if (!userDoc.exists) {
    return res.status(404).json({ message: "Profilul nu a fost găsit." });
  }

  res.json({
    uid: req.user.uid,
    profile: userDoc.data(),
  });
});

app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (req, res) => {
  const animalsSnapshot = await db.collection("animals").get();
  const requestsSnapshot = await db.collection("adoptionRequests").get();
  const usersSnapshot = await db.collection("users").get();

  const pendingRequests = requestsSnapshot.docs.filter(
    (doc) => doc.data().status === "pending"
  ).length;

  res.json({
    totalAnimals: animalsSnapshot.size,
    totalRequests: requestsSnapshot.size,
    pendingRequests,
    totalUsers: usersSnapshot.size,
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`PawMatch API running on port ${process.env.PORT || 3000}`);
});