import React, { Component } from 'react';
import './Trash.css';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import Masonry from 'react-masonry-css'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'
import RestoreIcon from '@material-ui/icons/Restore'
import { IconButton } from '@material-ui/core';
import Popup from "reactjs-popup";

var tagSearch;

const Button = ({ children, ...other }) => {
    return (
      <button {...other}>
        {children}
      </button>
    );
  };

class Note extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: []
    };
  };

  componentDidMount() {
      var self = this
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          var userRef = firebase.database().ref('users/');
          const userDB = firebase.database().ref('notes/' + user.uid + '/');
          userDB.on('value', (snapshot) => {
            let notes = snapshot.val();

            let detail = [];

            for (let note in notes) {
              if(notes[note].isTrash == "True"){
                  detail.push({
                    date: note,
                    subject: notes[note].noteSubject,
                    description: notes[note].noteDesc,
                    tags: notes[note].noteTags,
                    color: notes[note].color,
                  });
              }
            }
            self.setState({
              notes: detail,
              myUser: user.uid
            })
          });
        }

        else {
          console.log('User is not logged-in')
        }
      });
  }

  render () {
    return (
    <div>
      <div>
        <p>Filter by:</p>
        <Button onClick={this.filterRecent.bind(this)}>Most Recent</Button>
        <Button onClick={this.filterAlphabetical.bind(this)}>Alphabetical</Button>
        <input
          placeholder='Search by tag'
          type='text'
          onChange={this.searchTagHandler.bind(this)}
        />
        <br/>
        <Button onClick={this.handleEmptyTrash.bind(this)}>Empty Trash</Button>
      </div>
      {this.state.notes.map((eachNote) => {
        return (
          <Masonry
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column">
          <div className="note-list-container">
            <div className="note-title">{eachNote.subject}</div>
            <div className="note-content">{eachNote.description}</div>
            <div className='note-footer'>
              <IconButton onClick={this.handleDelete.bind(this, eachNote.date)}>
                <DeleteIcon/>
              </IconButton>
              <IconButton onClick={this.handleRestore.bind(this, eachNote.date)}>
                <RestoreIcon/>
              </IconButton>
            </div>
          </div>
          </Masonry>
        )
      })}
    </div>

    );
  }

  handleRestore(noteID) {
    var user = this.state.myUser;
    let userRef = firebase.database().ref('notes/' + user + '/');
    userRef.child(noteID).update({'isTrash': "False"});
  }

  handleDelete(noteID) {
      var user = this.state.myUser;
      firebase.database().ref('notes/' + this.state.myUser + '/' + noteID + '/').once('value').then(function(note) {
        var note_map = JSON.parse(JSON.stringify(note));
        if(note_map != null){
            var shareList = JSON.parse(note_map.sharesWith);
            for(var note in shareList){
              firebase.database().ref('shared_notes/' + shareList[note] + '/' + user + '/' + noteID + '/').remove();
            }
        }
      });
      firebase.database().ref('notes/' + user + '/' + noteID).remove();
  }

  handleEmptyTrash(noteID) {
    var user = this.state.myUser;
    var userRef = firebase.database().ref('users/');
    const userDB = firebase.database().ref('notes/' + user + '/');
    userDB.on('value', (snapshot) => {
      let notes = snapshot.val();
      for (let note in notes) {
        if(notes[note].isTrash == "True"){
          this.handleDelete(note);
        }
      }
    });
  }

  filterRecent(){
        let temp = [];
        temp = this.state.notes;

        temp.sort(function(a, b){
            var keyA = a.date,
                keyB = b.date;
            // Compare the 2 dates
            if(keyA < keyB) return 1;
            if(keyA > keyB) return -1;
            return 0;
        });
        this.state.notes = temp;
        this.forceUpdate();
    }

    filterAlphabetical(){
        let temp = [];
        temp = this.state.notes;

        temp.sort(function(a, b){
            var keyA = a.subject,
                keyB = b.subject;
            // Compare the 2 dates
            if(keyA < keyB) return -1;
            if(keyA > keyB) return 1;
            return 0;
        });
        this.state.notes = temp;
        this.forceUpdate();
    }

    searchTagHandler = (event) => {
          tagSearch = event.target.value.toLowerCase();

          var detail = [];

          //Get list of all notes by this user
          var targetRef = firebase.database().ref('notes/' + this.state.myUser + '/').once('value', function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                  //alert("checking note#: " + childSnapshot.key);
                  var noteTags = childSnapshot.val().noteTags;

                  var sepTags = "";

                  if(noteTags.length > 2){
                    sepTags = noteTags.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '');
                  }

                  var testArr = String(sepTags).split(',');

                  // For this note, check if there is a tag with substr of tagSearch
                  for(let tag in testArr){
                      if(testArr[tag].toLowerCase().includes(tagSearch)){
                            detail.push({
                              date: childSnapshot.key,
                              subject: childSnapshot.val().noteSubject,
                              description: childSnapshot.val().noteDesc,
                              tags: childSnapshot.val().noteTags,
                              color: childSnapshot.val().color,
                            });
                          break;
                      }
                  }
              });
            });

          this.state.notes = detail;
          this.forceUpdate();

          //alert("RETURNED ARRAY: " + detail);

      }
}

export default Note;