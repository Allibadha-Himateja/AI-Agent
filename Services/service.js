import sql from 'mssql';

const config = {
    user: 'sa', 
    password: 'himateja', 
    server: 'localhost',
    port: 1433, 
    database: 'AI_Agent',
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

class UserService
{
    
    constructor(){}
    async getDetails(city='') {
        let cityname = city.toLowerCase();
        await sql.connect(config);// Wait for the connection
        let request = new sql.Request();
        request.input('city', sql.VarChar, cityname);
        let result = await request.query('SELECT * FROM Weather_Details WHERE city = @city');

        if (result.recordset.length > 0) {
            return `${result.recordset[0].temp}°C`; // Return temperature value
        } else {
            return 'No data found';
        }
    }

    async getCityDetails(query="")
    {
        await sql.connect(config);// Wait for the connection
        let request = new sql.Request();
        let result = await request.query(query);
        console.log(result);
        if (result.recordset.length > 0) {
            return `${result.recordset[0].city} is having weather ${result.recordset[0].temp}°C`; // Return temperature value
        } else {
            return 'No data found';
        }
    }
}
export default UserService;
// in order to import the classes into the other files 
// first we have to export this similar to the one in angular and in react
// this comes under ES6
