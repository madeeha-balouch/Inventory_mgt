'use client'
import { useState, useEffect} from "react";
import { firestore } from "@/firebase";
import {Box , TextField, Typography, Stack, Button, ButtonGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,} from "@mui/material";
import { collection,deleteDoc,query,setDoc, getDocs, doc, getDoc} from "firebase/firestore";


export default function Home() {
  const [inventory, setInventory] = useState([])
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore,'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)
  }
   
  const addItem = async (item)=>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap = await getDoc(docRef)

    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1})
    }
    else{
      await setDoc(docRef, {quantity: 1})
    }
     await updateInventory()
  }


  const removeItem = async (item)=>{
    const docRef = doc(collection(firestore,'inventory'),item)
    const docSnap = await getDoc(docRef)
    if(docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
       }
       else{
        await setDoc(docRef, {quantity: quantity - 1})
       }
    }
     await updateInventory()
  }


  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    
    <Box width="100vw" height="100vh" display="flex" justifyContent="center" 
    alignItems="center" gap={2} flexDirection='column'> 
    <Typography variant="h2"> Pantry Tracker</Typography>

      <Box border='2px solid #333'>
        <Box width='800px'
        height='100px'
        bgcolor='#000435'
        display='flex'
        justifyContent='center'
        alignItems='center'
        >

        <Typography variant="h4" color='#f0f0f0' > Pantry Items</Typography>
        </Box>
        
        <Stack width='100%' direction='row' bgcolor='#FFFFFF'>
        <TextField
        
        placeholder="Add a new item.."
        border='1px solid'
        value={itemName}
        onChange={(e) => {
          setItemName(e.target.value)

        }}
        fullWidth
        >

        </TextField>

        <Button 
        variant='contained'
        onClick={() => {
          addItem(itemName)
          setItemName('')
        }}>
        Add
        </Button>

        </Stack>

        {/* Search Bar */}
        <Box bgcolor='#FFFFFF'>
    <TextField 
        
        border='1px solid'
        placeholder="Search Inventory..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
      />
       </Box>
      
      <TableContainer component={Paper} style={{ width: '800px', maxHeight: '300px', overflow: 'auto' }}>
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
    </Box>
  
  )
}
