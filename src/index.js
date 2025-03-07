import Groq from "groq-sdk";
import readlineSync from 'readline-sync';
import UserService from "../Services/service.js";

const groq_api_key='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';
const groqclient = new Groq({ apiKey: groq_api_key });

async function getWeatherDetails(city=""){
        var cityname=city.toLowerCase();
        var user=new UserService();
        var ans= user.getWeatherDetails(cityname);
        return ans;
    };

const tools={
    "getWeatherDetails":getWeatherDetails,
}

const SYSTEM_PROMPT =`
 You are an AI Assistant with START, PLAN, ACTION, Observation and output state
 Wait for the user prompt  and first PLAN and STRATEGIZE using avaliable tools.
 After Planning, Take the action with appropriate tools and wait for Observation based on the action.
 Once you get the Observations, Return the AI response based on the START prompt and Observations.

 Strictly follow the JSON output format as in examples

 Avaliable Tools:
 -functions getWeatherDetails(query:string):string
    getWeatherDetails is a function that accepts a cityname and returns the recordset results in a string format
 -Tables 
    1)Weather_Details(city:string,temp:int) this contains information of cities and their temparature

 Example:
 START
 {"type": "user", "user": "What is the sum of weather of Patiala and mohali?"}
 {"type": "plan", "plan": "I will call the getWeatherDetails for Patiala" }
 {"type": "action", "function": "getWeatherDetails", "input": "pataila" }
 {"type": "observation", "observation": "patiala is having weather 10°C" }
 {"type": "plan", "plan": "I will call getCityDetails for Mohali" }
 {"type": "action", "function": "getCityDetails", "input": "mohali" }
 {"type": "action", "function": "getCityDetails", "input": "mohali" }
 {"type": "observation", "observation": "mohali is having weather 14°C" }
 {"type": "output", "output": "The sum of weathers of Patiala and Mohali is 24°C" }

`;

const messages=[
    {"role":"system",content:SYSTEM_PROMPT}
]

while(true)
{
    const query=readlineSync.question('>> ');
    const q={ type:'user', user:query };
    messages.push({"role":"user",content:JSON.stringify(q)});

    while(true)
    {
        const chat= await groqclient.chat.completions.create({
            model:"llama3-8b-8192",
            messages:messages,
            response_format:{type:'json_object'}
        });

        const result=chat.choices[0].message.content;
        messages.push({role:"assistant",content:result});

        // console.log("\n\n----------START AI-------------");
        // console.log(result);
        // console.log("----------END AI-------------\n\n");


        const call=JSON.parse(result);

        if(call.type == "output")
        {
            console.log(`🤖:${call.output}`);
            break;
        }
        else if(call.type == "action"){
            const fn = tools[call.function];
            const observation = await fn(call.input);
            console.log(call.input);
            console.log(observation);
            const obs={"type": "observation", "observation": observation };
            messages.push({role:"assistant",content:JSON.stringify(obs)});
            //ikkada role lo assistant anni pettali....
        }
    }
}

