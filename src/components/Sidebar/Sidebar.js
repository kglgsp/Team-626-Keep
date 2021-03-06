import React from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined';
import EmojiObjectsOutlinedIcon from '@material-ui/icons/EmojiObjectsOutlined';
import SharedIcon from '@material-ui/icons/FolderShared';
import DeleteOutlineOutlinedIcon from '@material-ui/icons/DeleteOutlineOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import GoogleButton from 'react-google-button'
import * as firebase from 'firebase'
import {toggleShared} from '../HomePage/HomePage'
import {toggleNotes} from '../HomePage/HomePage'
import {toggleTrash} from '../HomePage/HomePage'
import {toggleArchive} from '../HomePage/HomePage'

const drawerWidth = 240;
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1
    }
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}));

export default function MiniDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const signOut = async() => {
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
      window.location.href = "/Login"
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  }

  return (
    
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: open
            })}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Team 626 Keep
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open
          })
        }}
        open={open}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {["Notes"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon onClick = {toggleNotes}>
                {index === 0 && <EmojiObjectsOutlinedIcon />}
              </ListItemIcon>
              <ListItemText primary={text} onClick = {toggleNotes}/>
            </ListItem>

          ))}
        </List>
        <List>
          {["Shared With Me"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon onClick = {toggleShared}>
                {index === 0 && <SharedIcon />}
              </ListItemIcon>
              <ListItemText primary={text} onClick = {toggleShared}/>
            </ListItem>

          ))}
        </List>
        <Divider />
        <List>
          {["Archive"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon onClick = {toggleArchive}>
                {index === 0 && <ArchiveOutlinedIcon />}
              </ListItemIcon>
              <ListItemText primary={text} onClick = {toggleArchive}/>
            </ListItem>

          ))}
        </List>
        <List>
          {["Trash"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon onClick = {toggleTrash}>
                {index === 0 && <DeleteOutlineOutlinedIcon />}
              </ListItemIcon>
              <ListItemText primary={text} onClick = {toggleTrash}/>
            </ListItem>

          ))}
        </List>
        <Divider/>
        <List>
          {["Logout"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemIcon onClick = {signOut}>
                {index === 0 && <ExitToAppIcon />}
              </ListItemIcon>
              <ListItemText primary={text} onClick = {signOut}/>
            </ListItem>
          ))}
        </List>
      </Drawer>

    </div>
  );
}
