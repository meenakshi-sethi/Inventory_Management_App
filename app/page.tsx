'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, IconButton, Grid } from '@mui/material';
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
      minHeight="100vh"
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      bgcolor={'#e3f2fd'}
      p={3}
    >
      <Box
        borderRadius={3}
        p={3}
        bgcolor={'#ffffff'}
        boxShadow={3}
        width="100%"
        maxWidth="800px"
        mb={3}
      >
        <Box
          width="100%"
          height="40px"  // Reduced the height of the blue header
          bgcolor={'#1976d2'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          borderRadius={3}
          mb={3}
          boxShadow={2}
        >
          <Typography variant={'subtitle1'} color={'#ffffff'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
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
            sx={{ bgcolor: '#f7f9fc', borderRadius: 3, boxShadow: 2 }}
          />
        </Box>

        <Grid container spacing={2} sx={{ mb: 2, fontWeight: 'bold' }}>
          <Grid item xs={6}>
            <Typography variant="body1">Item</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">Quantity</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">Actions</Typography>
          </Grid>
        </Grid>

        <Stack spacing={2}>
          {filteredInventory.map(({ name, quantity }) => (
            <Grid container key={name} sx={inventoryItemStyle}>
              <Grid item xs={6}>
                <Typography variant={'body1'} color={'#333'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant={'body1'} color={'#666'}>
                  {quantity}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Stack direction="row" spacing={1}>
                  <IconButton color="primary" onClick={() => addQuantity(name)}>
                    <Add />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => removeItem(name)}>
                    <Remove />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Box>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleOpen}
        startIcon={<AddCircleOutline />}
        sx={{ mt: 'auto', borderRadius: 3, boxShadow: 2 }}
      >
        Add New Item
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: '#f7f9fc', borderRadius: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              startIcon={<AddCircleOutline />}
              sx={{ borderRadius: 2 }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
