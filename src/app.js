import React, { Component } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import Account from "./account";

class App extends Component {
  render() {
    return (
      <div className="App">
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Astral - Una plataforma de pago (versión: 0.1.0)
            </Typography>
          </Toolbar>
        </AppBar>
        <br />
        <Account numAccnt={"1"} />
        <br />
        <br />
        <br />
        <Account numAccnt={"2"} />
      </div>
    );
  }
}

export default App;
