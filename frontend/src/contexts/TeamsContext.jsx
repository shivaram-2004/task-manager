import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const TeamsContext = createContext();

export function TeamsProvider({ children }) {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]); // ✅ all available users for selection
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "teams"));
      const data = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTeams(data);
    } catch (err) {
      console.error("❌ Error fetching teams:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch all registered users from Firestore
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const data = querySnapshot.docs.map((d) => d.data());
      setUsers(data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  // 🔹 Create a new team
  const createTeam = async (name, members, createdBy, tasks = []) => {
    if (!name?.trim() || !Array.isArray(members) || members.length === 0) {
      console.error("Team name and members are required");
      return;
    }

    try {
      // 🔹 1️⃣ Create the team document
      const teamRef = await addDoc(collection(db, "teams"), {
        name: name.trim(),
        members,
        createdBy,
        createdAt: serverTimestamp(),
      });

      const teamId = teamRef.id;

      // 🔹 2️⃣ Create each task for this team
      for (const task of tasks) {
        await addDoc(collection(db, "tasks"), {
          ...task,
          teamId, // ✅ link task with the team
          assignedToEmails: task.assignedToEmails?.length
            ? task.assignedToEmails
            : members, // fallback to all team members
          createdAt: serverTimestamp(),
          createdBy,
        });
      }

      console.log("✅ Team and tasks created successfully");
      await fetchTeams();
    } catch (err) {
      console.error("❌ Error creating team:", err);
    }
  };



  // 🔹 Update existing team
  const updateTeam = async (teamId, updates) => {
    if (!teamId) return;
    try {
      const ref = doc(db, "teams", teamId);
      await updateDoc(ref, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      console.log("✅ Team updated successfully");
      await fetchTeams();
    } catch (err) {
      console.error("❌ Error updating team:", err);
    }
  };

  // 🔹 Delete team
  const deleteTeam = async (teamId) => {
    if (!teamId) return;
    try {
      await deleteDoc(doc(db, "teams", teamId));
      console.log("🗑️ Team deleted successfully");
      await fetchTeams();
    } catch (err) {
      console.error("❌ Error deleting team:", err);
    }
  };

  // 🔹 Get single team by ID
  const getTeamById = async (teamId) => {
    if (!teamId) return null;
    try {
      const ref = doc(db, "teams", teamId);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.error("❌ Error getting team:", err);
      return null;
    }
  };

  // 🔹 Auto fetch on mount
  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  return (
    <TeamsContext.Provider
      value={{
        teams,
        users,
        loading,
        createTeam,
        updateTeam,
        deleteTeam,
        getTeamById,
        fetchTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}

export const useTeams = () => useContext(TeamsContext);
