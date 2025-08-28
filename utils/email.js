import {Resend} from 'resend';
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async(options)=>{
  const {data,error} = await resend.emails.send({
    from : "Website <website@resend.dev>",
    to :[options.to],
    subject :options.subject,
    html : options.message
  })

  if(error){
    console.error(error);
  }
}


export default sendEmail;