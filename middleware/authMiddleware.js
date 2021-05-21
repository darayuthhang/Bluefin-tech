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
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

module.exports = {
    requireAuth:requireAuth,
    authenticateToken:authenticateToken
}
