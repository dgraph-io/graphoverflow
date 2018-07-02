import React from "react";
import TopUserItem from "./TopUserItem";
import "../assets/styles/TopUserList.css";

const TopUserList = ({ users }) => {
  return (
    <section className="side-section top-user-list-container">
      <h2>Top Users</h2>
      <p className="section-desc">
        Who got the most answers accepted this month?
      </p>
      <ul className="top-user-list">
        {users
          ? users.map(user => {
              return <TopUserItem key={user.uid} user={user} />;
            })
          : <div>No ranking available. Not enough recent acitivities.</div>}
      </ul>
    </section>
  );
};
export default TopUserList;
