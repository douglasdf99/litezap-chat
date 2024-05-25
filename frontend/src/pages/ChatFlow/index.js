import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

// material-ui
import {
  Grid,
  Box,
  Toolbar,
  ButtonGroup,
  InputAdornment,
  TextField,
  useTheme,
  Button,
} from "@material-ui/core";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";

// API
// *migrate
// import chatflowsApi from "@/api/chatflows";

// Hooks
import useApi from "../../hooks/useApi";

// const
// import { baseURL } from '@/store/constant'

// icons
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import AppsIcon from "@material-ui/icons/Apps";
import ListIcon from "@material-ui/icons/List";

import * as React from "react";

const getAllChatflows = async () => {
  return [];
};

// ==============================|| CHATFLOWS ||============================== //

const Chatflows = () => {
  const history = useHistory();
  const theme = useTheme();
  const baseURL = "";
  const gridSpacing = 3;

  const [isLoading, setLoading] = useState(true);
  const [images, setImages] = useState({});
  const [search, setSearch] = useState("");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginDialogProps, setLoginDialogProps] = useState({});

  const getAllChatflowsApi = useApi(getAllChatflows);
  const [view, setView] = React.useState(
    localStorage.getItem("flowDisplayStyle") || "card"
  );

  const handleChange = (event, nextView) => {
    if (nextView === null) return;
    localStorage.setItem("flowDisplayStyle", nextView);
    setView(nextView);
  };

  const onSearchChange = (event) => {
    setSearch(event.target.value);
  };

  function filterFlows(data) {
    return (
      data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
      (data.category &&
        data.category.toLowerCase().indexOf(search.toLowerCase()) > -1)
    );
  }

  const onLoginClick = (username, password) => {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    // history.push(0);
  };

  const addNew = () => {
    history.push("/canvas");
  };

  const goToCanvas = (selectedChatflow) => {
    history.push(`/canvas/${selectedChatflow.id}`);
  };

  useEffect(() => {
    getAllChatflowsApi.request();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (getAllChatflowsApi.error) {
      if (getAllChatflowsApi.error?.response?.status === 401) {
        setLoginDialogProps({
          title: "Login",
          confirmButtonName: "Login",
        });
        setLoginDialogOpen(true);
      }
    }
  }, [getAllChatflowsApi.error]);

  useEffect(() => {
    setLoading(getAllChatflowsApi.loading);
  }, [getAllChatflowsApi.loading]);

  useEffect(() => {
    if (getAllChatflowsApi.data) {
      try {
        const chatflows = getAllChatflowsApi.data;
        const images = {};
        for (let i = 0; i < chatflows.length; i += 1) {
          const flowDataStr = chatflows[i].flowData;
          const flowData = JSON.parse(flowDataStr);
          const nodes = flowData.nodes || [];
          images[chatflows[i].id] = [];
          for (let j = 0; j < nodes.length; j += 1) {
            const imageSrc = `${baseURL}/api/v1/node-icon/${nodes[j].data.name}`;
            if (!images[chatflows[i].id].includes(imageSrc)) {
              images[chatflows[i].id].push(imageSrc);
            }
          }
        }
        setImages(images);
      } catch (e) {
        console.error(e);
      }
    }
  }, [getAllChatflowsApi.data]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
      }}
    >
      <Box>
        <Box sx={{ flexGrow: 1 }}>
          <Toolbar
            disableGutters={true}
            style={{
              margin: 1,
              padding: 1,
              paddingBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <h1>Chatflows</h1>
            <TextField
              size="small"
              sx={{ display: { xs: "none", sm: "block" }, ml: 3 }}
              variant="outlined"
              placeholder="Search name or category"
              onChange={onSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={addNew}
              startIcon={<AddIcon />}
            >
              Add New
            </Button>
          </Toolbar>
        </Box>
        {!isLoading && getAllChatflowsApi.data && (
          <Grid container spacing={gridSpacing}>
            {getAllChatflowsApi.data.filter(filterFlows).map((data, index) => (
              <Grid key={index} item lg={3} md={4} sm={6} xs={12}>
                {/* <ItemCard
                      onClick={() => goToCanvas(data)}
                      data={data}
                      images={images[data.id]}
                    /> */}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {!isLoading &&
        (!getAllChatflowsApi.data || getAllChatflowsApi.data.length === 0) && (
          <Box sx={{ alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ p: 2, height: "auto" }}>
              {/* <img
                style={{ objectFit: "cover", height: "30vh", width: "auto" }}
                src={WorkflowEmptySVG}
                alt="WorkflowEmptySVG"
              /> */}
            </Box>
            <div>No Chatflows Yet</div>
          </Box>
        )}
      {/* <LoginDialog
        show={loginDialogOpen}
        dialogProps={loginDialogProps}
        onConfirm={onLoginClick}
      /> */}
      {/* <ConfirmDialog /> */}
    </Box>
  );
};

export default Chatflows;
