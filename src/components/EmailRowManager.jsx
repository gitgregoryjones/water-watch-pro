import React, { useState } from "react";

const EmailRowManager = ({ contacts, onModify}) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [emailRows, setEmailRows] = useState([]);

  const addRow = () => {
    const newRowId = Date.now(); // Unique ID for each row
    setEmailRows([...emailRows, { id: newRowId, email: "" }]);
    //onModify && onModify([...selectedContacts, ...emailRows])
  };

  const deleteRow = (id) => {
    let deletes = emailRows.filter((row) => row.id !== id)
    setEmailRows(deletes);
    onModify && onModify([...selectedContacts, ...deletes])
  };

  const updateEmail = (id, email) => {

    let updates = emailRows.map((row) =>
      row.id === id ? { ...row, email } : row
    )

    setEmailRows(
     updates
    );
    onModify && onModify([...selectedContacts, ...getEmails(updates)])
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  function getEmails(rows){
    let oe = [];
    rows.forEach((row)=>{validateEmail(row.email) && oe.push(row.email)})
 
    return oe;
  }

  return (
    <div className="flex flex-col flex w-full gap-4">
      {/* Add Button */}
     

      {/* Select Box */}
      <select
        id="contacts"
        multiple
        value={selectedContacts}
        onChange={(e) => {
          const options = Array.from(e.target.options);
          const selected = options
            .filter((option) => option.selected)
            .map((option) => option.value);
          setSelectedContacts(selected);
          onModify && onModify([...selected,...getEmails(emailRows)])
        }}
        className="border border-gray-300 rounded p-2 w-full h-20"
      >
        {contacts.map((contact) => (
          <option key={contact.email} value={contact.email}>
            {contact.name}
          </option>
        ))}
      </select>
      <div className="flex justify-between items-center">
        <div className="">Add more recipients</div>
        <i
          onClick={addRow}
          className="fa fa-plus text-white text-sm rounded bg-green-600 p-1 mb-1 hover:bg-green-800 cursor-pointer"
        />
      </div>

      {/* Dynamic Email Rows */}
      <div className="flex flex-col gap-2">
        {emailRows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between border border-gray-300 rounded p-2 w-full"
          >
            <input
              type="email"
              placeholder="Enter email address"
              value={row.email}
              onInput={(e) => updateEmail(row.id, e.target.value)}
              className="border border-gray-300 rounded p-2 flex-1 mr-4"
            />
            <i
              onClick={() => deleteRow(row.id)}
              className="fa fa-times-circle text-red-600 text-lg cursor-pointer hover:text-red-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailRowManager;
