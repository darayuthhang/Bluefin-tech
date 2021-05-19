require('dotenv').config();

const AWS = require("aws-sdk");


AWS.config.update({
    region: process.env.REGION,
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY
});

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "lee_test";

//
module.exports = {
    async addItemToTable(items){
        const params = {
            TableName: TABLE_NAME,
            Item:items,
            ConditionExpression:"attribute_not_exists(pk)",
        }
        try {
            await dynamoClient.put(params).promise();
            return this.SUCCESS()
        } catch (error) {
             console.log(error);
           
        }
        return this.FAILURE();
 
      
    },
    async addUploadedItemToTable(items){
        const params = {
            TableName: TABLE_NAME,
            Item:items,
            ConditionExpression: 'attribute_not_exists(title)'
        }
        try {
            await dynamoClient.put(params).promise();
            return this.SUCCESS()
        } catch (error) {
            console.log(error);
        }
        return this.FAILURE();
    },
    //update table set title = "title", set image = image, set description = description
    async updateItemInTable(email, image, description, title){
        console.log(`update ${email} ${image} ${description} ${title}`);
        const params = {
            TableName: TABLE_NAME,
            Key:{
                "email":email
            },
            UpdateExpression: "set title = :t, image=:i, description = :d",
            ExpressionAttributeValues:{
                ":t": title,
                ":i": image,
                ":d": description
            },
            // ReturnValues: "UPDATED_NEW"
        }
        try{
            await dynamoClient.update(params).promise();
            return this.SUCCESS();
        } catch(error){
            console.log(error);
        }
        return this.FAILURE();
    },
    async selectAllFromDb(){
        const params = {
            TableName: TABLE_NAME
        }
        try{
            let allData = await dynamoClient.scan(params).promise();
            return allData
        }catch(error){
            console.log(error);
        }
        return this.FAILURE();
      
    },
    async selectDataByEmail(email){
           const params = {
                    TableName: TABLE_NAME,
                    KeyConditionExpression: "pk = :e",
                    ExpressionAttributeValues: {
                        ":e": email
                    }
                }
           
            try {
                let data = await dynamoClient.query(params).promise();
                return data;
            } catch (error) {
                console.log(error);
            }
           
    },
     async selectDataByEmailAndID(email){
           const params = {
               //title not equal to empty
                    TableName: TABLE_NAME,
                    KeyConditionExpression: "pk = :e AND begins_with(sk, :t)",
                    ExpressionAttributeValues: {
                        ":e": email,
                        ":t": "#"
                    }

                }
           
            try {
                let data = await dynamoClient.query(params).promise();
                return data;
            } catch (error) {
                console.log(error);
            }
            return this.FAILURE();
           
    },

    async deleteItemByEmail(email, id){
        const params = {
        TableName: TABLE_NAME,
        Key: {
            pk: email,
            sk:id
        },
        }
        try {
            let data = await dynamoClient.delete(params).promise();
            return data;
        } catch (error) {
            console.log(error);
        }
        return this.FAILURE();
    },

    async getItemByEmailAndID(email, skID){
        const params = {
            TableName: TABLE_NAME,
            Key:{
                pk:email,
                sk:skID
             }
        }
        try {
            let data = await dynamoClient.get(params).promise();
            return data;
        } catch (error) {
                console.log(error);
        }
        return this.FAILURE();
     
        
    },
    async updateItemByEmailAndId(email, title, description, id){
        var params = {
            TableName:TABLE_NAME,
            Key:{
                "pk": email,
                "sk": id
            },
            UpdateExpression: "set title = :t, description = :d",
            ExpressionAttributeValues:{
                ":t": title,
                ":d": description
            },
             ReturnValues:"UPDATED_NEW"
        };
        try {
            let data = await dynamoClient.update(params).promise();
            console.log(data);
            return data
        } catch (error) {
            console.log(error);
        }
    },
    async updateItemByEmailAndIDImg(email, title, description, id, img){
        console.log(title);
        var params = {
            TableName:TABLE_NAME,
            Key:{
                "pk": email,
                "sk": id
            },
            UpdateExpression: "set title = :t, description = :d, image = :i",
            ExpressionAttributeValues:{
                ":t": title,
                ":d": description,
                ":i": img
            },
             ReturnValues:"UPDATED_NEW"
        };
        try {
            let data = await dynamoClient.update(params).promise();
            console.log(data);
            return data
        } catch (error) {
            console.log(error);
        }
    },
    async updatePasswordInTable(email, idSk, newPassword){
      
        const params = {
            TableName: TABLE_NAME,
            Key:{
                "pk":email,
                "sk":idSk
            },
            UpdateExpression: "set password = :p",
            ExpressionAttributeValues:{
                ":p": newPassword
            },
            ReturnValues: "UPDATED_NEW"
        }
        try{
            await dynamoClient.update(params).promise();
            return this.SUCCESS();
        } catch(error){
            console.log(error);
        }
        return this.FAILURE();
    },

 
    SUCCESS(){
        return true
    },
    FAILURE(){
        return false
    }

}



// const getCharacter = async () =>{
//     const params = {
//         TableName: TABLE_NAME
//     }
//     const characters = await dynamoClient.scan(params).promise();
//     console.log(characters);
//     return characters;
// }

// const addOrUpdate = async (characters) => {
//     const params = {
//         TableName: TABLE_NAME,
//         Item: characters
//     }
//     return await dynamoClient.put(params).promise();
// }
