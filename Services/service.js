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

    async getSize(table="")
    {
        // console.log(table);
        await sql.connect(config);
        let request=new sql.Request();
        let query = `SELECT COUNT(*) AS Count FROM [${table}]`;
        let result = await request.query(query);
        console.log(result.recordset[0].Count);
        return `The Size of Weather_Details table is `+result.recordset[0].Count;
    }    
    async getCityDetails(city='') {
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

    async getCitiesDetials(from_index,to_index)
    {
        // console.log("Called"+from_index+" "+to_index);

        await sql.connect(config);// Wait for the connection

        let request = new sql.Request();
        request.input('StartIndex',sql.Int,from_index)
               .input('EndIndex',sql.Int,to_index);
        var query=`WITH OrderedData AS (
                    SELECT *, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS RowNum
                    FROM Weather_Details
                    )
                SELECT * FROM OrderedData
                WHERE RowNum BETWEEN @StartIndex AND @EndIndex;`;
        let result = await request.query(query);
        // console.log(result.recordset);
        if (result.recordset.length > 0) {
            // return `${result.recordset}`;
            var str="";
            result.recordset.forEach((ele)=>
                str+="city: "+ele.city+", temp: "+ele.temp+", RowNum: "+ele.RowNum+"\n"
            );
            console.log(str);
            return str;
        } else {
            return 'No data found';
        }
    }
}
export default UserService;
// in order to import the classes into the other files 
// first we have to export this similar to the one in angular and in react
// this comes under ES6
