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
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EditTeamDialog({ open, onClose, team }) {
  const [teamName, setTeamName] = useState(team?.name || "");
  const [members, setMembers] = useState(team?.members || []);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 🧩 Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((d) => ({
          id: d.id,
          email: d.data().email,
          name: d.data().name || "",
        }));
        setAllUsers(users);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) fetchUsers();
  }, [open]);

  // 🧩 Handle member selection
  const handleMemberChange = (event) => {
    const {
      target: { value },
    } = event;
    // Ensure all values are unique and consistent (as objects)
    const selected = value.map((m) =>
      typeof m === "string" ? { email: m } : m
    );
    setMembers(selected);
  };

  // 🧩 Save updates
  const handleSave = async () => {
    if (!teamName.trim()) {
      alert("Team name cannot be empty");
      return;
    }

    try {
      const teamRef = doc(db, "teams", team.id);
      await updateDoc(teamRef, {
        name: teamName.trim(),
        members: members,
      });
      alert("✅ Team updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating team:", err);
      alert("❌ Failed to update team");
    }
  };

  // 🧩 Reset form when dialog opens
  useEffect(() => {
    if (team) {
      setTeamName(team.name || "");
      setMembers(team.members || []);
    }
  }, [team]);

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
                    {selected.map((m, idx) => (
                      <Chip
                        key={m.email || idx}
                        label={
                          typeof m === "string"
                            ? m
                            : m.email || m.name || JSON.stringify(m)
                        }
                        color="info"
                      />
                    ))}
                  </Box>
                )}
              >
                {allUsers.map((user) => (
                  <MenuItem
                    key={user.email} // ✅ Unique key
                    value={{ email: user.email, name: user.name }}
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
