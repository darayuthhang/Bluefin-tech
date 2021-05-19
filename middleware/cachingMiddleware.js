'use strict';

let cache = {}

/**
 * 
 * @param req    - JSON data containing a body.
 * @param res    - Callback containing error and query response data 
 * @param next  send data to another middleware in express
 */
let midWare =  (req, res, next) => {
    const key = req.url
    if (cache[key]) {
        res.send(cache[key])
    } else {
        res.sendResponse = res.send
        //recieve the response back from server
        res.send = (body) => {
            cache[key] = body
            res.sendResponse(body)
        }
        next()
    }
}

module.exports = {
    midWare:midWare
}
