'use client'
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, TextField, Typography, Stack, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, Fade, Backdrop } from "@mui/material";
import { collection, deleteDoc, query, setDoc, getDocs, doc, getDoc } from "firebase/firestore";
import OpenAI from "openai";
import { Analytics } from "@vercel/analytics/react"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true 
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState(''); 
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const getRecipeSuggestions = async () => {
    const pantryItems = inventory.map(item => item.name).join(", ");
    const response = await openai.chat.completions.create({
      model: "google/gemini-flash-1.5", 
      messages: [
        { role: "user", content: `I have these items: ${pantryItems}. What recipes can I make? please give only two recipe suggestions in a nicely formatted manner` }
      ],
      temperature: 0.5,
    });

    const suggestions = response.choices[0].message.content;
    setRecipes(suggestions);
    setOpenModal(true); // Open modal after getting suggestions
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" 
    alignItems="center" gap={2} flexDirection='column' paddingTop={5} paddingBottom={5}> 
      <Typography variant="h2">Pantry Tracker</Typography>

      <Box border='2px solid #333' borderRadius={2}>
        <Box width='500px' height='80px' bgcolor='#000435' display='flex' justifyContent='center' alignItems='center' flexDirection='row'>
          <Typography variant="h4" color='#f0f0f0'>Pantry Items</Typography>
        </Box>
        
        <Stack width='100%' direction='row' bgcolor='#FFFFFF'>
          <TextField
            placeholder="Add a new item.."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
          />
          <Button variant='contained' onClick={() => {
            addItem(itemName);
            setItemName('');
          }}>
            Add
          </Button>
        </Stack>

        {/* Search Bar */}
        <Box bgcolor='#FFFFFF'>
          <TextField 
            placeholder="Search Pantry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </Box>
      
        <TableContainer component={Paper} style={{ width: '500px', maxHeight: '300px', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center"><Typography variant="h6" fontWeight='bold'>Item Name</Typography></TableCell>
                <TableCell align="center"><Typography variant="h6" fontWeight='bold'>Quantity</Typography></TableCell>
                <TableCell align="center"><Typography variant="h6" fontWeight='bold'>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.map(({ name, quantity }) => (
                <TableRow key={name}>
                  <TableCell align="center">
                    <Typography variant="h6" color='#333'>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" color='#333'>
                      {quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <ButtonGroup variant="outlined" aria-label="Basic button group">
                      <Button onClick={() => addItem(name)}>Add</Button>
                      <Button onClick={() => removeItem(name)}>Remove</Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>

        {/* Button to generate recipe suggestions */}
        <Button variant='contained' onClick={getRecipeSuggestions} style={{ marginTop: '5px', marginBottom:'10px' }}>
          Get Recipe Suggestions
        </Button>

        {/* Modal to display recipe suggestions */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          closeAfterTransition
        >
          <Fade in={openModal}>
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '500px',
                maxHeight: '300px', 
                overflow: 'auto' ,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h5" mb={2}>Recipe Suggestions</Typography>
              <Typography variant="body1">{recipes}</Typography>
              <Button 
                variant='contained' 
                onClick={() => setOpenModal(false)} 
                style={{ marginTop: '20px' }}>
                Close
              </Button>
            </Box>
          </Fade>
        </Modal>
      
    </Box>
  );
}
