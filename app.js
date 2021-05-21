'use strict';
require('dotenv').config();

const express = require('express')
const cors = require('cors');
const compression = require("compression");
const app = express()
const profile = require("./controllers/profile");
const {requireAuth} = require('./middleware/authMiddleware');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var cookieParser = require('cookie-parser')



app.set('views', './views');

app.use(cookieParser())
app.use(express.json());

// app.set('view engine', 'ejs');
// app.use(express.urlencoded({
//   extended: true
// }));
app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

//allow OPTIONS on all resources
// app.use(function (req, res, next) {	
//     res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");    
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');    
//     res.setHeader('Access-Control-Allow-Headers', "Content-Type");   
//     res.setHeader('Access-Control-Allow-Credentials', true);    
//     next();
// });

app.use(compression());



//root
app.get("/", (req, res) => {
    res.status(200).json({"message": "root"});
})
app.post("/api/profile/register", async (req, res) => {
    await profile.handleProfileRegister(req, res)
})
app.post("/api/profile/login", async (req, res) => {
    await profile.handleProfileLogin(req, res); 
})

app.post("/api/profile/upload", requireAuth, upload.single('files'), async (req, res) => {
     await profile.handleProfileUpload(req, res);
})

app.get("/api/profile/logout", (req, res) => {
    profile.handleProfileLogout(req, res);
})
//apikey route does not next require auth
app.get("/api/profile/list/:id", async (req, res) => {
    await profile.handleListItems(req, res);
})

app.get("/api/profile/list",requireAuth, async (req, res) => {
    await profile.handleListItemWithoutApi(req, res);
})
//update route with image
app.post("/api/profile/update/img", requireAuth, upload.single('files'), async (req, res) => {
    await profile.handleUpdateViewWithImg(req, res);
})

//update route without image
app.post("/api/profile/update", requireAuth, async (req, res) => {
    await profile.handleUpdateView(req, res);
})
//edit route
app.get("/api/profile/edit/:id", requireAuth, async (req, res) => {
    await profile.handleEditView(req, res);
})
app.delete("/api/profile/delete/:id", requireAuth,  async (req, res) => {
    await profile.handeDeleteItem(req, res);
})


//reset password
app.post("/api/profile/reset/password", async (req, res) => {
    await profile.handleResetPassword(req, res )
})

app.post("/api/profile/update/password", async (req, res) => {
    await profile.handleUpdatePassword(req, res)
})

///********testing route  */


app.listen(process.env.PORT || 3000, () => {
    console.log("sucess");
})
