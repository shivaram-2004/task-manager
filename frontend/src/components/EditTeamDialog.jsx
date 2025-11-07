import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
  CircularProgress,
  Box,
} from "@mui/material";
import { collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EditTeamDialog({ open, onClose, team }) {
  const [teamName, setTeamName] = useState(team?.name || "");
  const [members, setMembers] = useState([]); // always lowercase strings
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 🧩 Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((d) => ({
          id: d.id,
          email: (d.data().email || "").toLowerCase(),
          name: d.data().name || "",
        }));
        setAllUsers(users);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    if (open) fetchUsers();
  }, [open]);

  // 🧩 Reset data on open
  useEffect(() => {
    if (team) {
      const normalized = (team.members || []).map((m) =>
        typeof m === "string" ? m.toLowerCase() : (m.email || "").toLowerCase()
      );
      setTeamName(team.name || "");
      setMembers([...new Set(normalized)]); // remove duplicates
    }
  }, [team]);

  // 🧩 Handle change
  const handleMemberChange = (event) => {
    const { value } = event.target;
    // Ensure only strings (emails) and remove duplicates
    const clean = value.map((m) => m.toLowerCase());
    setMembers([...new Set(clean)]);
  };

  // 🧩 Save team
  const handleSave = async () => {
    if (!teamName.trim() || members.length === 0) {
      alert("Please enter a team name and select at least one member.");
      return;
    }

    try {
      const teamRef = doc(db, "teams", team.id);
      await updateDoc(teamRef, {
        name: teamName.trim(),
        members: [...new Set(members.map((m) => m.toLowerCase()))],
        updatedAt: serverTimestamp(),
      });

      alert("✅ Team updated successfully!");
      onClose();
    } catch (err) {
      console.error("❌ Error updating team:", err);
      alert("Failed to update team.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Team</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Team Name */}
          <TextField
            label="Team Name"
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />

          {/* Members Multi-select */}
          <FormControl fullWidth>
            <InputLabel id="edit-members-label">Team Members</InputLabel>
            {loadingUsers ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Select
                labelId="edit-members-label"
                multiple
                value={members}
                onChange={handleMemberChange}
                input={<OutlinedInput label="Team Members" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((email) => (
                      <Chip key={email} label={email} color="info" />
                    ))}
                  </Box>
                )}
              >
                {allUsers.map((user) => (
                  <MenuItem
                    key={user.email}
                    value={user.email}
                    disabled={members.includes(user.email)}
                  >
                    {user.name
                      ? `${user.name} (${user.email})`
                      : user.email}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ fontWeight: 600, textTransform: "none" }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
