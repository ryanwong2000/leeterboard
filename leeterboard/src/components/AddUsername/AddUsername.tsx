import React, { useState } from "react";
import "./AddUsername.css";

export const AddUsername = ({ addNewUser }) => {
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    addNewUser(username);
    setUsername("");
  };

  return (
    <div className="inputContainer" onSubmit={handleChange}>
      <form className="addUsername">
        <input
          type="text"
          placeholder="Add User"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
};

export default AddUsername;
