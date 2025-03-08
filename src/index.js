import Groq from "groq-sdk";
import readlineSync from 'readline-sync';
import UserService from "../Services/service.js";
import { groq_api_key,SYSTEM_PROMPT } from "../shared/constants.js";

const groqclient = new Groq({ apiKey: groq_api_key });

async function getCityDetails(city="")
{
    var user=new UserService();
    var ans= user.getCityDetails(city);
    return ans;
};
async function getCitiesDetails(from_index='',to_index='')
{
    var from=(parseInt(from_index)==0)?1:parseInt(from_index);
    var to=(parseInt(from_index)==0)?parseInt(to_index)+1:parseInt(to_index);
    var user=new UserService();
    var ans=user.getCitiesDetials(from,to);
    return ans;
}
async function getSize(tablename="")
{
    var user=new UserService();
    var ans=user.getSize(tablename);
    return ans;
}

const tools={
    "getCityDetails":getCityDetails,
    "getCitiesDetails":getCitiesDetails,
    "getSize":getSize,
}

const messages=[
    {"role":"system",content:SYSTEM_PROMPT}
]

while(true)
{
    // this readlineSync is stoping the continuos loop 
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

        console.log("\n\n----------START AI-------------");
        console.log(result);
        console.log("----------END AI-------------\n\n");

        const call=JSON.parse(result);

        if(call.type == "output")
        {
            console.log(`🤖:${call.output}`);
            break;
        }
        else if(call.type == "action"){
            const fn = tools[call.function];
            if(call.function=='getCityDetails')
            {
                const observation = await fn(call.input.city);
                console.log(call.input.city);
                console.log(observation);
                const obs={"type": "observation", "observation": observation };
                messages.push({role:"assistant",content:JSON.stringify(obs)});
            }
            if(call.function=='getCitiesDetails')
            {
                console.log(call.input.from_index);
                console.log(call.input.to_index);
                const observation=await fn(""+call.input.from_index,""+call.input.to_index);
                console.log(observation);
                const obs={"type": "observation", "observation": observation };
                messages.push({role:"assistant",content:JSON.stringify(obs)});
            }
            if(call.function=='getSize')
            {
                console.log(call.input.tablename);
                const observation = await fn(call.input.tablename);
                console.log(observation);
                const obs={"type": "observation", "observation": observation };
                messages.push({role:"assistant",content:JSON.stringify(obs)});
            }
            
            //ikkada role lo assistant anni pettali....
        }
    }
}

