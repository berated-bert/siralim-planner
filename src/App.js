import React, {Component, PureComponent} from 'react';
import { withRouter, BrowserRouter } from "react-router-dom";

import SiralimPlanner from './SiralimPlanner';

class App extends Component {

  render() {
    return <BrowserRouter><SiralimPlanner/></BrowserRouter>
  }
}



export default App;
