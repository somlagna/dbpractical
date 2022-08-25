const express = require("express")
const app = express()
const mysql = require("mysql")
const db = mysql.createPool({
   connectionLimit: 100,
   host: "localhost",      
   user: "root",         
   password: "Som@9.12.2000",  
   database: "userDB",      // Database name
   port: "3306"             // port name, "3306" by default
})
db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful: " + connection.threadId)
})
const port=3000
app.listen(port,()=>console.log(`server started on port ${port}...`))
const bcrypt = require("bcrypt")
app.use(express.json())

app.post("/createUser", async (req,res) => {
const user = req.body.name;
const hashedPassword = await bcrypt.hash(req.body.password,10);
db.getConnection( async (err, connection) => {
 if (err) throw (err)
 const sqlSearch = "SELECT * FROM userTable WHERE user = ?"
 const search_query = mysql.format(sqlSearch,[user])
 const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)"
 const insert_query = mysql.format(sqlInsert,[user, hashedPassword])
 // ? will be replaced by values
 // ?? will be replaced by string
 await connection.query (search_query, async (err, result) => {
  if (err) throw (err)
  console.log("------> Search Results")
  
  if (result.length != 0) {
   connection.release()
   console.log("------> User already exists")
   res.sendStatus(409) 
  } 
  else {
   await connection.query (insert_query, (err, result)=> {
   connection.release()
   if (err) throw (err)
   console.log ("--------> Created new User")
   
   res.sendStatus(201)
  })
 }
})
}) 
})
app.post("/login", (req, res)=> {
    const user = req.body.name
    const password = req.body.password
    db.getConnection ( async (err, connection)=> {
     if (err) throw (err)
     const sqlSearch = "Select * from userTable where user = ?"
     const search_query = mysql.format(sqlSearch,[user])
     await connection.query (search_query, async (err, result) => {
      connection.release()
      
      if (err) throw (err)
      if (result.length == 0) {
       console.log("--------> User does not exist")
       res.sendStatus(404)
      } 
      else {
         const hashedPassword = result[0].password
         //get the hashedPassword from result
        if (await bcrypt.compare(password, hashedPassword)) {
        console.log("---------> Login Successful")
        res.send(`${user} is logged in!`)
        } 
        else {
        console.log("---------> Password Incorrect")
        res.send("Password incorrect!")
        } 
      }
     }) 
    })
    }) 