import React, { useState } from "react";
import Papa from "papaparse";
import api from "../utility/api"; // Replace with your actual API utility

const ContactCSVFileUploadDialog = ({className, onClose}) => {
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const requiredFields = ["name", "email", "phone"];

  const validateRow = (row) => {
    const errorMessages = [];

    // Check for required fields
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errorMessages.push(`Missing required field: ${field}`);
      }
    });

    // Validate email format
    if(row.email != "none"){
      if (row.email && !/\S+@\S+\.\S+/.test(row.email)) {
        errorMessages.push(`Invalid email format: ${row.email}`);
      }
    }

    row.phone = row.phone.replace(/\./g,"-")

    if(row.phone != "none"){
      // Validate phone number (simple check for digits and length)
      if (row.phone && !/^\d{10}$|^\d{11}$/.test(row.phone.trim().replace(/[^0-9]/g, ""))) {
        errorMessages.push(`Invalid phone number: ${row.phone}`);
      } 
    }

    

    return errorMessages;
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrors([]);
    setSuccess(false);
  };

  function processCSV(inputString) {
    const lines = inputString.split("\n");
    const output = [];
    let lastHashLineIndex = -1;
  
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
  
      // Skip lines starting with #
      if (line.startsWith("#")) {
        lastHashLineIndex = i; // Track the last line with #
        continue;
      }

      if(!line)
        continue;
        
      // Skip the first line after the last # line
    //  if (i === lastHashLineIndex + 1) continue;
      console.log(`Reading Line ${line}`)
      // Process remaining lines
      let [name,email,phone] = line.split(",");
  
      if(!email  && !phone){
        //do nothing, let the parse find this error
      } else{

        if(!email){
          email = "none";
        }
  
        if(!phone){
          phone = "none";
        }
    

      }

      
      // Join the updated parts and add them to the output
  
        output.push([name,email,phone].join(","));
      
    }
  
    // Return the processed CSV as a string
    return output.join("\n");
  }

  const processFile = () => {
    if (!file) return;

    setProcessing(true);
    setErrors([]);
    setSuccess(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      comments: "#",
      beforeFirstChunk:(chunk)=>{

        let cleanChunk = processCSV(chunk)
        console.log(`See CSV Upload ${JSON.stringify(cleanChunk)}`)
      
      return cleanChunk;
    },
      complete: async (results) => {
        const { data, errors: parseErrors } = results;

        // Check for parsing errors
        if (parseErrors.length) {
          setErrors(parseErrors.map((e) => `Parsing error: ${e.message}`));
          setProcessing(false);
          return;
        }

        const validationErrors = [];
        const validRows = [];

        // Validate each row
        data.forEach((row, index) => {
          console.log(row)
          const rowErrors = validateRow(row);
          if (rowErrors.length) {
            validationErrors.push(`Row ${index + 1}: ${rowErrors.join(", ")}`);
          } else {
            validRows.push(row);
          }
        });

        if (validationErrors.length) {
          setErrors(validationErrors);
          setProcessing(false);
          return;
        }

        // POST valid rows to the backend
        const postErrors = [];
        for (const row of validRows) {
          try {

            let eBody = {
              name: row.name,
              email: row.email == "none" ? "" : row.email,
              phone: row.phone  == "none" ? "" : row.phone,
              status: "active",
            };

            if(eBody.email.length == 0){
              delete eBody.email;
            }

            if(eBody.phone.length == 0){
              delete eBody.phone;
            }

            await api.post("/api/contacts/", eBody);
          } catch (error) {
            postErrors.push(`Failed to process row with email ${row.email}: ${error.message}`);
          }
        }

        if (postErrors.length) {
          setErrors(postErrors);
        } else {
          setSuccess(true);
        }
        setProcessing(false);
      },
    });
  };

  const closeDialog = () => {
    setFile(null);
    setErrors([]);
    setSuccess(false);
    setProcessing(false);
    onClose && onClose();
  };

  return (
    <div className={`flex flex-col relative  items-start justify-start gap-2  ${className}`}>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded shadow-md"
        onClick={() => {document.getElementById("fileUpload").value = ""; document.getElementById("fileUpload").click()}}
      >
        Bulk Upload CSV
      </button>
      <a className="text-md" href="/example_contacts.csv">click here to download the example contacts file</a>
      <input
        type="file"
        id="fileUpload"
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {file && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-3/4 max-w-lg">
            <h2 className="text-xl font-bold mb-4">File Upload</h2>
            <p className="mb-2">File Name: {file.name}</p>
            <p className="mb-4">File Size: {(file.size / 1024).toFixed(2)} KB</p>

            <div className="h-40 overflow-auto bg-gray-100 p-4 rounded mb-4">
              {errors.length > 0 ? (
                <ul className="text-red-500">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              ) : success ? (
                <p className="text-green-500">All contacts uploaded successfully!</p>
              ) : (
                <p className="text-gray-500">No errors reported.</p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded"
                onClick={closeDialog}
                disabled={processing}
              >
                {success ? "Close" : "Cancel"}
              </button>
              {!success && (
                <button
                  className={`${
                    processing ? "bg-gray-600" : "bg-blue-600"
                  } text-white px-4 py-2 rounded`}
                  onClick={processFile}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Process File"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCSVFileUploadDialog;
