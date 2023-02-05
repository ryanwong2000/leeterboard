import React, { useState } from "react";
import "./AddUsername.css";

export const AddUsername = () => {
  const [username, setUsername] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    addNewUser(username);
  };

  const addNewUser = async (username: string) => {
    const url = "http://localhost:5000/createNewUser";
    console.log("Adding", username);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username })
    });
    console.log(res);
  };

  return (
    <div className="inputContainer" onSubmit={handleChange}>
      <form className="addUsername">
        <input
          type="text"
          placeholder="Add User"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
    </div>
  );
};

export default AddUsername;
