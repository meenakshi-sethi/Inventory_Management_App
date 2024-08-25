'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, IconButton } from '@mui/material';
import { Add, Remove, Search, AddCircleOutline } from '@mui/icons-material';
import { firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  QueryDocumentSnapshot,
  QuerySnapshot, DocumentData 
} from 'firebase/firestore';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const inventoryItemStyle = {
  bgcolor: '#f7f9fc',
  borderRadius: 3,
  p: 2,
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

interface InventoryItem {
  name: string;
  quantity?: number;
}

export default function Home() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');  
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, []);

  const updateInventory = async () => {
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(query(collection(firestore, 'inventory')));
    const inventoryList: InventoryItem[] = [];

    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      const item: InventoryItem = {
        name: doc.id,
        quantity: data.quantity ?? 0,
        ...data,
      };
      inventoryList.push(item);
    });

    setInventory(inventoryList);
  };

  const addItem = async (item: string) => {
    if (!item.trim()) {
      console.error("Item name cannot be empty.");
      return;
    }

    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data() as InventoryItem;
        await setDoc(docRef, { quantity: quantity! + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const addQuantity = async (item: string) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data() as InventoryItem;
        await setDoc(docRef, { quantity: quantity! + 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const removeItem = async (item: string) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data() as InventoryItem;
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity! - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      bgcolor={'#e3f2fd'}
      p={3}
    >
      <TextField
        id="search"
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton>
              <Search />
            </IconButton>
          ),
        }}
        sx={{ mb: 3, maxWidth: '800px', bgcolor: 'white', borderRadius: 3, boxShadow: 2 }}
      />

      <Box
        borderRadius={3}
        p={3}
        bgcolor={'#ffffff'}
        boxShadow={3}
        width="100%"
        maxWidth="800px"
      >
        <Box
          width="100%"
          height="60px"  // Reduced the height of the blue header
          bgcolor={'#1976d2'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={3}
          mb={3}
          boxShadow={2}
        >
          <Typography variant={'h5'} color={'#ffffff'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack spacing={2}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              sx={inventoryItemStyle}
            >
              <Typography variant={'h5'} color={'#333'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h6'} color={'#666'}>
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton color="primary" onClick={() => addQuantity(name)}>
                  <Add />
                </IconButton>
                <IconButton color="secondary" onClick={() => removeItem(name)}>
                  <Remove />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpen}
        startIcon={<AddCircleOutline />}
        sx={{ mt: 3, borderRadius: 3, boxShadow: 2 }}
      >
        Add New Item
      </Button>
    </Box>
  );
}
