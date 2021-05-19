const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res ,next) => {
    const token = req.cookies.jwt;
    console.log(token);

    if(token){
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
            if(err){
                console.log(err.message);
                res.status(404).json("there is no token")
            }else{
                console.log(decodedToken);
                next()
            }
        })
    }
}

module.exports = {
    requireAuth:requireAuth
}
