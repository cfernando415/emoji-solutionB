import React, { Component } from "react";
import "./App.css";
import "emoji-mart/css/emoji-mart.css";
// import { Picker } from "emoji-mart";
import "semantic-ui-css/semantic.min.css";
import Speech from "speak-tts";
import "@material/react-switch/dist/switch.css";
import Switch from "@material/react-switch";
import SpeechRecognition from "react-speech-recognition";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: "Editor",
      tweet: "",
      tweets: [],
      checked: false,
      error: false,
      errorMessage:
        "Switch the toggle on top of the screen to go online. You are currently offline.",
      listening: false,
      keyPressed: false,
      finalTranscript: "",
      emoji: []
    };

    this.speech = new Speech();
    this.speech.init({
      volume: 1,
      lang: "en-US",
      rate: 1,
      pitch: 1,
      voice: "Google UK English Male",
      splitSentences: true
    });

    this.recognition = new SpeechRecognition();

    this.recognition.continous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
  }

  componentDidMount() {
    fetch("http://localhost:3001/emoji")
      .then(res => res.json())
      .then(data => this.setState({ emoji: data }));
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  handleSubmitTweet = () => {
    if (this.state.checked) {
      let tweets = this.state.tweets;
      tweets.push(this.state.tweet);
      if (this.state.error) {
        this.setState({ tweets, tweet: "", error: !this.state.error });
      }
      this.setState({ tweets, tweet: "" });
      this.speech.speak({ text: "Message posted!" });
    } else {
      this.setState({ error: !this.state.error });

      this.speech.speak({
        text: `${this.state.errorMessage}`
      });
    }
  };

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  addEmoji = e => {
    //console.log(e.unified)
    if (e.unified.length <= 5) {
      let emojiPic = String.fromCodePoint(`0x${e.unified}`);
      this.setState({
        tweet: this.state.tweet + emojiPic
      });
      this.speech.speak({ text: emojiPic });
    } else {
      let sym = e.unified.split("-");
      let codesArray = [];
      sym.forEach(el => codesArray.push("0x" + el));
      //console.log(codesArray.length)
      //console.log(codesArray)  // ["0x1f3f3", "0xfe0f"]
      let emojiPic = String.fromCodePoint(...codesArray);
      this.setState({
        tweet: this.state.tweet + emojiPic
      });
      this.speech.speak({ text: emojiPic });
    }
  };

  speakButton = () => {
    this.speech.speak({
      text: `${this.state.tweet}`
    });
  };

  swictchHandler = e => {
    if (this.state.error) {
      this.setState({ error: !this.state.error, checked: e.target.checked });
    }
    this.setState({ checked: e.target.checked });
  };

  onFocusHandler = message => {
    this.speech.speak({
      text: message
    });
  };

  switchHandler = e => {
    const status = e.target.checked ? "Online" : "Offline";
    this.setState({ checked: e.target.checked });
    this.speech.speak({ text: status });
  };

  searchEmojiHandler = () => {
    const {
      finalTranscript,
      startListening,
      stopListening,
      resetTranscript
    } = this.props;

    if (this.state.listening) {
      startListening();
    } else {
      stopListening();
      this.setState({ finalTranscript });
      resetTranscript();
    }
  };

  keyDownHandler = e => {
    if (e.keyCode === 32 && this.state.keyPressed === false) {
      this.setState(
        {
          listening: !this.state.listening,
          keyPressed: !this.state.keyPressed,
          finalTranscript: ""
        },
        this.searchEmojiHandler
      );
    }
  };

  keyUpHandler = e => {
    // debugger;
    if (e.keyCode === 32) {
      this.setState(
        {
          listening: false,
          keyPressed: false
        },
        this.searchEmojiHandler
      );
    }
  };

  render() {
    const tweets = this.state.tweets.map((tweet, i) => (
      <li key={i}>{tweet}</li>
    ));

    const emoji = this.state.emoji.map((emojiObject, i) => (
      <span
        tabIndex={i + 5}
        key={emojiObject.name + "-" + i}
        onFocus={() => this.onFocusHandler(emojiObject.name)}
      >
        {emojiObject.image}
      </span>
    ));

    return (
      <div className="App">
        <h1>Emojiujitsu Composer</h1>
        <div id="switch-container">
          <Switch
            nativeControlId="my-switch"
            checked={this.state.checked}
            onChange={this.switchHandler}
          />
          <label htmlFor="my-switch">
            <span id="switch">{this.state.checked ? "Online" : "Offline"}</span>
          </label>
        </div>
        <div className="textarea-container">
          <h2>
            <div
              className="error"
              style={
                this.state.error ? { display: "block" } : { display: "none" }
              }
            >
              {this.state.errorMessage}
            </div>
          </h2>
          <textarea
            onFocus={e => this.onFocusHandler(e.target.placeholder)}
            onChange={this.changeHandler}
            value={this.state.tweet}
            name="tweet"
            placeholder="What's on your mind?"
            tabIndex={1}
          />
          <p>
            <button
              onClick={this.speakButton}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
              tabIndex={2}
            >
              Listen to message
            </button>
            <button
              onClick={this.handleSubmitTweet}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
              tabIndex={3}
            >
              Post your message
            </button>
            <button
              onKeyDown={this.keyDownHandler}
              onKeyUp={this.keyUpHandler}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
              tabIndex={4}
            >
              Search for emoji
            </button>
          </p>
          <aside>
            <ul style={{ listStyleType: "none" }}>{tweets}</ul>
          </aside>
        </div>
        <div>
          <h2>List of emoji</h2>
          <span>{emoji}</span>
        </div>
      </div>
    );
  }
}

const options = {
  autoStart: false
};

export default SpeechRecognition(options)(App);
