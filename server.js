require('dotenv').config()

const express = require('express');
const app = express();





app.get('/' , (req , res) => {
    res.send('Server Status : Active');
});




app.listen(process.env.PORT , process.env.HOST , () => {
	console.log(`Server is listening at port ${process.env.PORT}`);
});