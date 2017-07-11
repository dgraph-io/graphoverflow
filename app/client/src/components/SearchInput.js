import React from "react";
import classnames from "classnames";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { updateSearchTerm } from "../actions/search";

import "../assets/styles/SearchInput.css";

class SearchInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputFocused: false
    };
  }

  handleToggleFocus = () => {
    this.setState(prevState => {
      return {
        inputFocused: !prevState.inputFocused
      };
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { history, searchTerm } = this.props;

    const postLink = `/search?q=${encodeURIComponent(searchTerm)}`;
    history.push(postLink);
  };

  render() {
    const { searchTerm, handleChangeSearchTerm } = this.props;
    const { inputFocused } = this.state;

    return (
      <form
        onSubmit={this.handleSubmit}
        className={classnames("search-input-container", {
          "search-input-focused": inputFocused
        })}
      >
        <i className="fa fa-search search-icon" />
        <input
          type="text"
          className="search-input form-control"
          onFocus={this.handleToggleFocus}
          onBlur={e => {
            this.handleToggleFocus();
          }}
          placeholder="Search..."
          value={searchTerm}
          onChange={e => {
            const val = e.target.value;
            handleChangeSearchTerm(val);
          }}
        />
        {/*
        <button
          className="btn btn-primary search-btn"
        >
          <i className="fa fa-search" />
        </button>
        */}
      </form>
    );
  }
}

const mapStateToProps = state => ({
  searchTerm: state.search.searchTerm
});

const mapDispatchToProps = dispatch => ({
  handleChangeSearchTerm(searchTerm) {
    dispatch(updateSearchTerm(searchTerm));
  }
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(SearchInput)
);
