import React from "react";
import classnames from "classnames";

const HomeTabNavigation = ({ currentTab, onChangeTab, allTabs }) => {
  return (
    <ul className="tab-navigation">
      <li className="tab-item">
        <a
          className={classnames("tab-link", {
            active: currentTab === allTabs.TAB_RECOMMENDED
          })}
          href="#recommended"
          onClick={e => {
            e.preventDefault();
            onChangeTab(allTabs.TAB_RECOMMENDED);
          }}
        >
          Recommended
        </a>
      </li>
      <li className="tab-item">
        <a
          className={classnames("tab-link", {
            active: currentTab === allTabs.TAB_RECENT
          })}
          href="#recent"
          onClick={e => {
            e.preventDefault();
            onChangeTab(allTabs.TAB_RECENT);
          }}
        >
          Most recent
        </a>
      </li>
      <li className="tab-item">
        <a
          className={classnames("tab-link", {
            active: currentTab === allTabs.TAB_HOT
          })}
          href="#hot"
          onClick={e => {
            e.preventDefault();
            onChangeTab(allTabs.TAB_HOT);
          }}
        >
          Hot
        </a>
      </li>
    </ul>
  );
};
export default HomeTabNavigation;
