import React, { Component } from 'react';
import Modal from 'react-modal';
import './Trash.css';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import Masonry from 'react-masonry-css'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'
import RestoreIcon from '@material-ui/icons/Restore'
import CloseIcon from '@material-ui/icons/Close'
import { IconButton } from '@material-ui/core';
import Popup from "reactjs-popup";

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    width                 : '50%',
    height                 : '50%',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

var tagSearch;

const Button = ({ children, ...other }) => {
    return (
      <button {...other}>
        {children}
      </button>
    );
  };

class Trash extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      modalIsOpen: false,
      expandModalIsOpen: false,
      note_title: '',
      note_description: '',
      tags: '',
      note_ID: '',
    };

    this.openExpandModal = this.openExpandModal.bind(this);
    this.closeExpandModal = this.closeExpandModal.bind(this);
  };

  openExpandModal() {
    this.setState({expandModalIsOpen: true});
  }

  closeExpandModal() {
    this.setState({expandModalIsOpen: false});
  }

  paintNotes() {
      var notesList = this.state.notes;
      var list = document.getElementsByClassName('note-title');

      for(let note in notesList){
          for(let a in list){
              if(list[a].innerHTML == notesList[note].subject){
                 document.getElementsByClassName('note-title')[a].style["background-color"]=notesList[note].color;
                 document.getElementsByClassName('note-content')[a].style["background-color"]=notesList[note].color;
                 document.getElementsByClassName('note-tags')[a].style["background-color"]=notesList[note].color;
              }
          }
      }
  }
    
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
                    image: notes[note].imageLink,
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
    
  componentDidUpdate() {
      if(document.getElementsByClassName('Trash')[0].style.display == "block"){
          this.paintNotes();
      }
  }

  handleExpandNote = (noteID, title, description, tags) => {
    this.state.note_title = title;
    this.state.note_description = description;
    this.state.note_ID = noteID;
    this.state.tags = tags;
    this.openExpandModal();
  }

  render () {
    function textToHtml(html)
    {
        let arr = html.split("</br>");
        html = arr.reduce((el, a) => el.concat(a, <br />), []);
        return html;
    }
    function outputTags(tags){
          let str = "Tags: ";
          if(tags.length <= 2){
              return "";
          }
          else {
            return "Tags: " + tags.replace(/"/g, '').replace(/\[/g, '').replace(/\]/g, '').replace(/,/g, ', ');
          }
    }
    return (
    <div>
        <div className="intro-header">
        Your Recycled Notes:
        </div>
      <div>
        <div className="filtering-section">
            <p>Filter by:</p>
            <Button onClick={this.filterRecent.bind(this)}>Most Recent</Button>
            <Button onClick={this.filterAlphabetical.bind(this)}>Alphabetical</Button>
            <input
              placeholder='Search by tag'
              type='text'
              onChange={this.searchTagHandler.bind(this)}
            />
          </div>
        <br/>
        <Button onClick={this.handleEmptyTrash.bind(this)}>Empty Trash</Button>
      </div>
      {this.state.notes.map((eachNote) => {
        return (
          <Masonry
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column">
          <div className="note-list-container">
            <div style={{cursor:'pointer'}} onClick={this.handleExpandNote.bind(this, eachNote.date, eachNote.subject, eachNote.description, eachNote.tags)}>
              <div className="note-title">{eachNote.subject}</div>
              <div className="note-content">
                     {textToHtml(eachNote.description)}
                     <img src={eachNote.image} className="note-image" />
              </div>
            </div>
            <div className="note-tags">{outputTags(eachNote.tags)}</div>
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
      <Modal
        isOpen={this.state.expandModalIsOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.closeExpandModal}
        style={customStyles}
        contentLabel="View Note Modal"
      >
        <button onClick={this.closeExpandModal} className="close-button"><CloseIcon/></button>
          <br></br>
          <br></br>
          <h1 style={{'text-align':'center', 'margin-top':'-10px', 'width':'100%'}}>{this.state.note_title}</h1>
          <br></br>
          <br></br>
          <div style={{'margin-top': '-45px', 'height': '50%', 'overflow-y':'auto'}}>{textToHtml(this.state.note_description)}</div>
          <div className="note-modal-tags">{outputTags(this.state.tags)}</div>
          <div className='modal-note-footer'>
              <IconButton onClick={this.handleDelete.bind(this, this.state.note_ID)}>
                <DeleteIcon/>
              </IconButton>
              <IconButton onClick={this.handleRestore.bind(this, this.state.note_ID)}>
                <RestoreIcon/>
              </IconButton>
          </div>
      </Modal>
    </div>
    );
  }

  handleRestore(noteID) {
    var user = this.state.myUser;
    let userRef = firebase.database().ref('notes/' + user + '/');
    userRef.child(noteID).update({'isTrash': "False"});
    this.closeExpandModal();
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
      this.closeExpandModal();
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
    this.closeExpandModal();
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
                  if(childSnapshot.val().isArchived == "False" && childSnapshot.val().isTrash == "True"){
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
                  }
              });
            });

          this.state.notes = detail;
          this.forceUpdate();

          //alert("RETURNED ARRAY: " + detail);

      }
}

export default Trash;