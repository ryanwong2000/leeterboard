import React, { useState } from "react";
import "./AddUsername.css";

interface AddUsernameProps {
  addNewUser: (username: string) => Promise<Number>;
}

export const AddUsername = ({ addNewUser }: AddUsernameProps) => {
  const [username, setUsername] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const handleChange = async (e) => {
    e.preventDefault();
    const res = await addNewUser(username);
    switch (res) {
      case 200:
        setErrMessage("");
        break;
      case 404:
        setErrMessage("User does not exist");
        break;
      case 409:
        setErrMessage("User already exists");
        break;
      default:
        setErrMessage("");
    }
    setUsername("");
  };

  return (
    <div className="inputContainer" onSubmit={handleChange}>
      <form className="addUsername">
        <p className="errorMessage">{errMessage}</p>
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
