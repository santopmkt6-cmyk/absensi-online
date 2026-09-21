import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Kiosk, 
  BranchInvitation, 
  Employee, 
  AttendanceRecord, 
  Shift, 
  OwnerAccount 
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'systemConfig', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
      return false;
    }
    return true;
  }
}

// -------------------------------------------------------------
// Realtime Subscriptions
// -------------------------------------------------------------

export function subscribeKiosks(onData: (kiosks: Kiosk[]) => void) {
  const colRef = collection(db, 'kiosks');
  return onSnapshot(colRef, (snapshot) => {
    const list: Kiosk[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Kiosk);
    });
    // Sort by name or code
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    onData(list);
  }, (err) => {
    console.error('Error subscribing to kiosks:', err);
  });
}

export function subscribeInvitations(onData: (invitations: BranchInvitation[]) => void) {
  const colRef = collection(db, 'invitations');
  return onSnapshot(colRef, (snapshot) => {
    const list: BranchInvitation[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as BranchInvitation);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onData(list);
  }, (err) => {
    console.error('Error subscribing to invitations:', err);
  });
}

export function subscribeEmployees(onData: (employees: Employee[]) => void) {
  const colRef = collection(db, 'employees');
  return onSnapshot(colRef, (snapshot) => {
    const list: Employee[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Employee);
    });
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    onData(list);
  }, (err) => {
    console.error('Error subscribing to employees:', err);
  });
}

export function subscribeAttendanceRecords(onData: (records: AttendanceRecord[]) => void) {
  const colRef = collection(db, 'attendance');
  return onSnapshot(colRef, (snapshot) => {
    const list: AttendanceRecord[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as AttendanceRecord);
    });
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    onData(list);
  }, (err) => {
    console.error('Error subscribing to attendance records:', err);
  });
}

export function subscribeShifts(onData: (shifts: Shift[]) => void) {
  const colRef = collection(db, 'shifts');
  return onSnapshot(colRef, (snapshot) => {
    const list: Shift[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as Shift);
    });
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    onData(list);
  }, (err) => {
    console.error('Error subscribing to shifts:', err);
  });
}

export function subscribeOwnerAccount(onData: (account: OwnerAccount | null) => void) {
  const docRef = doc(db, 'systemConfig', 'ownerAccount');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data() as OwnerAccount);
    } else {
      onData(null);
    }
  }, (err) => {
    console.error('Error subscribing to ownerAccount:', err);
  });
}

// -------------------------------------------------------------
// Write / Sync Operations to Firestore
// -------------------------------------------------------------

export async function syncKioskToFirestore(kiosk: Kiosk) {
  try {
    await setDoc(doc(db, 'kiosks', kiosk.id), kiosk, { merge: true });
  } catch (err) {
    console.error('Failed to sync kiosk to firestore:', err);
  }
}

export async function deleteKioskFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'kiosks', id));
  } catch (err) {
    console.error('Failed to delete kiosk from firestore:', err);
  }
}

export async function syncInvitationToFirestore(invitation: BranchInvitation) {
  try {
    await setDoc(doc(db, 'invitations', invitation.id), invitation, { merge: true });
  } catch (err) {
    console.error('Failed to sync invitation to firestore:', err);
  }
}

export async function deleteInvitationFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'invitations', id));
  } catch (err) {
    console.error('Failed to delete invitation from firestore:', err);
  }
}

export async function syncEmployeeToFirestore(employee: Employee) {
  try {
    await setDoc(doc(db, 'employees', employee.id), employee, { merge: true });
  } catch (err) {
    console.error('Failed to sync employee to firestore:', err);
  }
}

export async function deleteEmployeeFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'employees', id));
  } catch (err) {
    console.error('Failed to delete employee from firestore:', err);
  }
}

export async function syncAttendanceRecordToFirestore(record: AttendanceRecord) {
  try {
    await setDoc(doc(db, 'attendance', record.id), record, { merge: true });
  } catch (err) {
    console.error('Failed to sync attendance record to firestore:', err);
  }
}

export async function deleteAttendanceRecordFromFirestore(id: string) {
  try {
    await deleteDoc(doc(db, 'attendance', id));
  } catch (err) {
    console.error('Failed to delete attendance record from firestore:', err);
  }
}

export async function syncBatchEmployeesToFirestore(employees: Employee[]) {
  try {
    const batch = writeBatch(db);
    employees.forEach((emp) => {
      batch.set(doc(db, 'employees', emp.id), emp, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to sync batch employees to firestore:', err);
  }
}

export async function syncShiftToFirestore(shift: Shift) {
  try {
    await setDoc(doc(db, 'shifts', shift.id), shift, { merge: true });
  } catch (err) {
    console.error('Failed to sync shift to firestore:', err);
  }
}

export async function syncOwnerAccountToFirestore(account: OwnerAccount) {
  try {
    await setDoc(doc(db, 'systemConfig', 'ownerAccount'), account, { merge: true });
  } catch (err) {
    console.error('Failed to sync owner account to firestore:', err);
  }
}

// -------------------------------------------------------------
// Seeder: Seed initial local data to Firestore if cloud is empty
// -------------------------------------------------------------

export async function seedInitialDataIfEmpty(
  initialKiosks: Kiosk[],
  initialEmployees: Employee[],
  initialInvitations: BranchInvitation[],
  initialShifts: Shift[],
  initialOwner: OwnerAccount
) {
  try {
    // Check if kiosks already exist
    const kiosksSnap = await getDocs(collection(db, 'kiosks'));
    if (kiosksSnap.empty && initialKiosks.length > 0) {
      console.log('Seeding initial kiosks to Firestore...');
      const batch = writeBatch(db);
      initialKiosks.forEach((k) => {
        batch.set(doc(db, 'kiosks', k.id), k);
      });
      await batch.commit();
    }

    // Check if invitations exist
    const invSnap = await getDocs(collection(db, 'invitations'));
    if (invSnap.empty && initialInvitations.length > 0) {
      console.log('Seeding initial invitations to Firestore...');
      const batch = writeBatch(db);
      initialInvitations.forEach((inv) => {
        batch.set(doc(db, 'invitations', inv.id), inv);
      });
      await batch.commit();
    }

    // Check if employees exist
    const empSnap = await getDocs(collection(db, 'employees'));
    if (empSnap.empty && initialEmployees.length > 0) {
      console.log('Seeding initial employees to Firestore...');
      const batch = writeBatch(db);
      initialEmployees.forEach((emp) => {
        batch.set(doc(db, 'employees', emp.id), emp);
      });
      await batch.commit();
    }

    // Check if shifts exist
    const shiftsSnap = await getDocs(collection(db, 'shifts'));
    if (shiftsSnap.empty && initialShifts.length > 0) {
      const batch = writeBatch(db);
      initialShifts.forEach((s) => {
        batch.set(doc(db, 'shifts', s.id), s);
      });
      await batch.commit();
    }

    // Check owner account
    const ownerSnap = await getDocs(collection(db, 'systemConfig'));
    if (ownerSnap.empty && initialOwner) {
      await setDoc(doc(db, 'systemConfig', 'ownerAccount'), initialOwner);
    }
  } catch (error) {
    console.error('Error during Firestore initial seed:', error);
  }
}
