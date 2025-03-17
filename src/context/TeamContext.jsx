// src/context/TeamContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const TeamContext = createContext();

export const useTeam = () => {
  return useContext(TeamContext);
};

export const TeamProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setTeams([]);
      setActiveTeam(null);
      setLoading(false);
      return;
    }

    const loadUserTeams = async () => {
      try {
        setLoading(true);
        
        // Get user document to check which teams they belong to
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        
        if (userDoc.exists() && userDoc.data().teams) {
          const userTeams = userDoc.data().teams;
          const teamsData = [];
          
          // Fetch each team document
          for (const teamId of userTeams) {
            const teamDoc = await getDoc(doc(db, 'teams', teamId));
            if (teamDoc.exists()) {
              teamsData.push({
                id: teamId,
                ...teamDoc.data()
              });
            }
          }
          
          setTeams(teamsData);
          
          // Set first team as active if no active team
          if (teamsData.length > 0 && !activeTeam) {
            setActiveTeam(teamsData[0]);
          }
        } else {
          // If user has no teams yet
          setTeams([]);
          setActiveTeam(null);
        }
      } catch (err) {
        console.error('Error loading teams:', err);
        setError('Failed to load teams');
      } finally {
        setLoading(false);
      }
    };

    loadUserTeams();
  }, [currentUser]);

  // Create a new team
  // src/context/TeamContext.jsx - Update the createTeam function
  const createTeam = async (teamName) => {
    try {
      // Create timestamp outside of arrays
      const timestamp = serverTimestamp();
      
      // Use regular Date objects for array fields, not serverTimestamp()
      const teamData = {
        name: teamName,
        createdAt: timestamp, // This is fine - not in an array
        createdBy: currentUser.uid,
        members: [{
          userId: currentUser.uid,
          role: 'admin',
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email,
          joinedAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
        }]
      };
      
      // Create team document
      const teamRef = await addDoc(collection(db, 'teams'), teamData);
      
      // Update user's teams array
      const userRef = doc(db, 'users', currentUser.uid);
      
      // First check if user document exists - if not, create it
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email,
          teams: [teamRef.id],
          createdAt: timestamp
        });
      } else {
        // User exists, just update the teams array
        await updateDoc(userRef, {
          teams: arrayUnion(teamRef.id)
        });
      }
      
      const newTeam = { 
        id: teamRef.id,
        ...teamData,
        // Replace serverTimestamp with actual date for state
        createdAt: new Date().toISOString()
      };
      
      // Update state
      setTeams(prev => [...prev, newTeam]);
      setActiveTeam(newTeam);
      
      return newTeam;
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team: ' + err.message);
      throw err;
    }
  };

  // Switch active team
  const switchTeam = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setActiveTeam(team);
      return true;
    }
    return false;
  };

  // Invite a user to team
  const inviteTeamMember = async (email) => {
    if (!activeTeam) {
      setError('No active team');
      return false;
    }
    
    try {
      // Check if user exists
      const usersQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnapshot = await getDocs(usersQuery);
      
      if (userSnapshot.empty) {
        // User not found, create invitation
        await addDoc(collection(db, 'invitations'), {
          teamId: activeTeam.id,
          teamName: activeTeam.name,
          email: email,
          invitedBy: currentUser.uid,
          invitedByName: currentUser.displayName || currentUser.email,
          status: 'pending',
          createdAt: serverTimestamp()
        });
        
        return { success: true, message: 'Invitation sent' };
      } else {
        // User exists, add them to team
        const user = userSnapshot.docs[0];
        
        // Update team members
        await updateDoc(doc(db, 'teams', activeTeam.id), {
          members: arrayUnion({
            userId: user.id,
            role: 'member',
            email: email,
            name: user.data().name || email,
            joinedAt: serverTimestamp()
          })
        });
        
        // Update user's teams array
        await updateDoc(doc(db, 'users', user.id), {
          teams: arrayUnion(activeTeam.id)
        });
        
        return { success: true, message: 'User added to team' };
      }
    } catch (err) {
      console.error('Error inviting team member:', err);
      setError('Failed to invite team member');
      return { success: false, message: 'Failed to invite member' };
    }
  };

  const value = {
    teams,
    activeTeam,
    loading,
    error,
    createTeam,
    switchTeam,
    inviteTeamMember
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};