'use strict';

const logic = require("../models/logic");
const s3 = require("../models/s3");
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uuidAPIKEY = require("uuid-apikey");
const emails = require("../email");
const saltRound = 10;


//api/profile/register
/**
 * {    UserProfile
 *      name:username,
 *      password: password,
 *      email: email,
 *      entries: 0,
 *      date: new Date()
 *      apiKey: 
 * 
 * }
 * @param {*} req 
 * @param {*} res 
 */
const handleProfileRegister = async (req, res) => {
    const {email, password, name} = req.body;
    const hash = await bcrypt.hashSync(password, saltRound);
    const userProfile = {
        title:"",
        name:name,
        password:hash,
        pk:email,
        entries: 0,
        date: new Date().toISOString(),
        apiKey: uuidAPIKEY.create(),
        image: "",
        description: "",
        sk: "empty"
    }
    let data = await logic.addItemToTable(userProfile);
    console.log("this is " + data);
    //insert successfully
    if(data){
        console.log("success");
        return res.status(200).json("success")
    }else{
        return res.status(400).json({
            "statuCode":400,
            "email": "Email already exists"
        })
    }
   
}

const handleProfileLogin = async (req, res) => {
    const {email, password} = req.body;
    //select email, and password from db
    //compare passwowrnd using hash fucntion
    
    let data = await logic.selectDataByEmail(email)
    if(data === "undefined") {return res.status[404].json({message: "user does not exist"})};
     if(data["Items"] === "undefined") {return res.status[404].json({message: "user does not exist"})};
    if(data["Items"].length !== 0){
        data["Items"].forEach(async user => {
            const isValid = await bcrypt.compareSync(password, user["password"])
            console.log(isValid);
            if(isValid){
                //3 days in second, jwt take second
                const maxAge = 3 * 24 * 60 * 60;
                jwt.sign({id:user.id}, process.env.TOKEN_SECRET, {expiresIn: maxAge}, (err, accessToken )=>{
                    if(err){
                         return res.status(404).json({message: "Token is expired"})
                    }else{
                        const HTTPONLY = {
                            httpOnly: true,
                            maxAge: maxAge * 1000
                        }
                     
                         res.cookie("jwt", accessToken, HTTPONLY);
                         res.cookie("email", user["pk"], HTTPONLY);
                         res.cookie("apiKey", user["apiKey"], HTTPONLY);
                         res.cookie("password", user["password"], HTTPONLY)
                         res.cookie("entries", user["entries"], HTTPONLY)
                         res.cookie("date", user["date"], HTTPONLY)
                         res.cookie("name", user["name"], HTTPONLY)
                         return res.status(200).json(
                             {
                                 accessToken: accessToken, message:"success", 
                                apiKey:user['apiKey']['apiKey'], name:user['name']
                            })
                    }
                  
                })
            }else{
                return res.status(404).json("forbbiden")
            }
        })    
    }else{
        return res.status(404).json({"user": "User does not exist"})
    } 
}

const handleProfileUpload =  async (req, res) => {

    //todo 
    // read cookies email
    // join email with the another table title, descriptiom, image
    // then add to dynamodb
    //store image into s3 bucket
    const file = req.file;
    if(file === null){
        return res.status(400).json("no file upload");
    }
    let image = "";
    let result = await s3.uploadFile(file);
      //read url back
    if(result) {
        image = result['Location']
    }

    const {description, title} = req.body;
    const { email, apiKey, password, entries, date, name} = req.cookies;
    let item;
   
    const params = {
        "pk":email,
        "description":description,
        "sk":"#" + uuidv4(),
        "name":name,
        "image":image,
        "apiKey":apiKey,
        "password":password,
        "title": title,
        "entries": entries,
        "date": date
    }
    item = await logic.addUploadedItemToTable(params);

    if(item){
         return res.status(200).json({
            "message": "Post created"
        })
    }
    return res.status(404).json({
        "message": "data does not exist"
    })
   
}

const handleProfileLogout = (req, res) => {
    const HTTPONLY = {
        maxAge: 1
    }
    const EMPTY_STRING = "";
    res.cookie("jwt", EMPTY_STRING , HTTPONLY)
    res.cookie("email", EMPTY_STRING , HTTPONLY);
    res.cookie("apiKey", EMPTY_STRING , HTTPONLY);
    res.cookie("password", EMPTY_STRING , HTTPONLY)
    res.cookie("entries", EMPTY_STRING , HTTPONLY)
    res.cookie("date", EMPTY_STRING , HTTPONLY)
    res.cookie("name", EMPTY_STRING , HTTPONLY)
    res.status(200).json({
        "message": ""
    })
}

const handleListItems = async (req, res) => {

    const {id} = req.params;
    const {email, apiKey} = req.cookies;
    if(id === apiKey['apiKey']){
        const result = await logic.selectDataByEmailAndID(email);
        if(result === "undefined" || result === null ){return res.status(404).json({"message": "data is empty"})}
        else{
            const data = result["Items"]
            if(data === "undefined"
            || data === null){return res.status(404).json({"message": "Data is empty"})};
            if(data){
                  //title, image, description, date, name
                let result = [
                ];
              
                for(let col = 0; col<data.length;col++){  
                    const params = {
                        title: data[col]["title"],
                        image:data[col]["image"],
                        description:data[col]['description'],
                        date:data[col]['date'],
                        name:data[col]['name']
                    }
                    result.push(params)
                }
                return res.status(200).json(result)
            }
        }
    }
    return res.status(404).json({"message": "data does not exist"});
    
}

const handeDeleteItem = async (req, res) => {
    const {id} = req.params;
    const skId = `#${id}`;
    const email = req.cookies.email;
    //pk:email sk:id
    let data = logic.deleteItemByEmail(email, skId);
    if(data){
        return res.status(200).json({"message": "delete successfuly"})
    }
    return res.status(404).json({"message": "delete is not successfully"})
    
}
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

const handleUpdateViewWithImg = async (req, res) => {
    let {title, description, id} = req.body;
    let skID = `#${id}`;
    let data;
    let {email} = req.cookies;
    const file = req.file;
    if(file === null){
        return res.status(404).json({"message": "data does not exist"});
    }
    let image = "";
    let result = await s3.uploadFile(file);
    if(result) {
        image = result['Location']
                // email title, description, id, img
        data = logic.updateItemByEmailAndIDImg(email, title, description, skID, image)
        if(data){
            return res.status(200).json({"message": "update successfully"})
        }
    }else{
        return res.status(404).json({"message":"image is not found"})
    }

    return res.status(404).json({"message": "update unsucessfully"})

}

const handleUpdateView = async (req, res) => {
    let {title, description, id} = req.body;
    const {email} = req.cookies;
    let skId = `#${id}`
    let data = logic.updateItemByEmailAndId(email, title, description, skId)
    if(data){
        return res.status(200).json({"message": "success"})
    }
    return res.statuss(404).json({"message": "not success"})
    
}
const handleEditView = async (req, res) => {
    const {id} = req.params;
    const {email} = req.cookies;
    const skID = `#${id}`
    //delete 
    let data = await logic.getItemByEmailAndID(email, skID)
    //add
    if(data){
        return  res.status(200).json({"message": "successs",
                            "data":data});
    }
    return res.status(404).json({"message": "data does not exist"})
  
}

const handleListItemWithoutApi = async (req, res) => {
    const {email} = req.cookies;
    const result = await logic.selectDataByEmailAndID(email);
    if(result === "undefined" || result === null ){return res.status(404).json({"message": "data is empty"})}
    else{
        const data = result["Items"]
      
        if(data === "undefined"
        || data === null){return res.status(404).json({"message": "Data is empty"})};
        if(data){
            return res.status(200).json(data)
        }
    }
    
    return res.status(404).send("forbidden")

}

const handleResetPassword = async (req, res) => {
    const {email} = req.body;
    let emailExist = await logic.selectDataByEmail(email)
    if(emailExist['Items'].length !== 0){
        //email, sub, url
        console.log(emailExist["Items"])
        const subject = "Hello world";
        const url = "www.google.com";
        const apiKey = emailExist['Items'][0]['apiKey']['apiKey'];

        let info = await emails.sendEmail(email, subject, url, apiKey);
        //send reset password to the email
        const data = {
            "apiKey": apiKey,
            "email": email
        }
        return res.status(200).json(data);
    }
    const message = {
        "message": "email does not exist"
    }

    return res.status(404).json(message);
}

const handleUpdatePassword = async (req, res) =>{
    const {email, password, apiKey} = req.body;
    //encrypt the password
    const newPassword = await bcrypt.hashSync(password, saltRound);
    //pull data from email
    //then iterate to update password
    let data = await logic.selectDataByEmail(email)

    if(data['Items'] !== 0){
        //update new password
        data["Items"].forEach(async user => {
            const emailPK = user["pk"]
            const idSk = user['sk'];
            await logic.updatePasswordInTable(emailPK, idSk, newPassword);

        })
        return res.status(200).json({"message": "success"});
    }

    return res.status(404).json({"message": "Not sucess"})
}




module.exports = {
    handleProfileRegister: handleProfileRegister,
    handleProfileLogin: handleProfileLogin,
    handleProfileUpload:handleProfileUpload,
    handleProfileLogout:handleProfileLogout,
    handleListItems: handleListItems,
    handleListItemWithoutApi:handleListItemWithoutApi,
    handeDeleteItem:handeDeleteItem,
    handleEditView:handleEditView,
    handleUpdateView:handleUpdateView,
    handleUpdateViewWithImg:handleUpdateViewWithImg,
    handleResetPassword:handleResetPassword,
    handleUpdatePassword:handleUpdatePassword
}

