
import api from "./api";
import { VITE_WATER_WATCH_SUPPORT,VITE_EMAIL_PROXY } from "./constants";

function getItems(obj, plain){

    let details = plain == true ? "Additional Details\n" :  "<ul>Additional Details";
    Object.keys(obj).forEach((key) => {
        if(plain == true){
            details += `${key} = ${obj[key]}\n`;
        }else {
            details += `<li>${key} = ${obj[key]}</li>`; 
        }
    });
    details += plain == true ? "" : "</ul>"
return details;
}

const abandon = async (customer, session_id) => {

const emailContent = {
         
    toEmail: VITE_WATER_WATCH_SUPPORT,
    
    subject: `Abandoned User Signup : ${customer.email}`,
    textBody: `A user has abandoned the signup process:
Customer Email: ${customer.email}

Metadata: ${getItems(customer.metadata,true)}
Session ID: ${session_id}`,
    htmlBody: `<html>
      <body>
        <h1>Abandoned Signup Notification</h1>
        <p>A user has abandoned the signup process:</p>
        <ul>
          <li><strong>Customer Email:</strong> ${customer.email}</li>
         
          <li><strong>Metadata:</strong> ${getItems(customer.metadata) || ""}</li>
          <li><strong>Session ID:</strong> ${session_id ? session_id : "Stripe session was not created"}</li>
        </ul>
      </body>
    </html>`,
  }


    const emailResponse = await api.post(
    VITE_EMAIL_PROXY,
    emailContent,
    {
    headers: {
        "Content-Type": "application/json"
    },
    }
    );

    return emailResponse;

}


const newTrialSignUp = async (customer) => {
  
//alert(`New trial signup for ${JSON.stringify(customer)}`);

customer.metadata = {...customer,metadata:{...customer}}

   try {

  const emailContent = {
           
      toEmail: VITE_WATER_WATCH_SUPPORT,
      
      subject: `${customer.email} is a new Trial User`,
      textBody: `This is the new trial user:
      Customer Email: ${customer.email}
  
  Metadata: ${getItems(customer.metadata,true)}`,
      htmlBody: `<html>
        <body>
          <h1>New Trial User Notification</h1>
          <p>A new trial user has signed up:</p>
          <ul>
            <li><strong>Customer Email:</strong> ${customer.email}</li>
           
            <li><strong>Metadata:</strong> ${getItems(customer.metadata) || ""}</li>
           
          </ul>
        </body>
      </html>`,
    }
  
   // alert(`This sending email to support: ${JSON.stringify(emailContent)}`);
  
      const emailResponse = await api.post(
      VITE_EMAIL_PROXY,
      emailContent,
      {
      headers: {
          "Content-Type": "application/json"
      },
      }
      );
  
      return emailResponse;
    } catch (error) {
        console.log(`Error sending new trial signup email:${error.message}`);
        return null;
    }
  
  }

export {abandon,newTrialSignUp}