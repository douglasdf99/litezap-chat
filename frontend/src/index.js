import React from "react";
import ReactDOM from "react-dom";
import TagManager from 'react-gtm-module';
import CssBaseline from "@material-ui/core/CssBaseline";

import App from "./App";

const tagManagerArgs = {
    gtmId: 'GTM-NZCXMXSV'
};

TagManager.initialize(tagManagerArgs);


ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root")
);
