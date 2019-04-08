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
  constructor() {
    super();
    this.state = {
      activeItem: "Editor",
      tweet: "",
      tweets: [],
      checked: false,
      error: false,
      errorMessage:
        "Switch the toggle on top of the screen to go online. You are currently offline.",
      listening: false,
      keyPressed: false
    };

    this.speech = new Speech();
    this.speech.init({
      volume: 1,
      lang: "en-GB",
      rate: 1,
      pitch: 1,
      voice: "Google UK English Male",
      splitSentences: true
    });

    this.recognition = new SpeechRecognition();

    this.recognition.continous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
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
    let finalTranscript = "";

    if (this.state.listening) {
      this.recognition.start();

      this.recognition.onresult = event => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript + " ";
          else interimTranscript += transcript;
        }
      };
    } else {
      this.recognition.end();
    }
    console.log(finalTranscript);
  };

  keyDownHandler = e => {
    if (e.keyCode === 32 && this.state.keyPressed === false) {
      this.setState(
        {
          listening: !this.state.listening,
          keyPressed: !this.state.keyPressed
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
          />
          <p>
            <button
              onClick={this.speakButton}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
            >
              Listen to message
            </button>
            <button
              onClick={this.handleSubmitTweet}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
            >
              Post your message
            </button>
            <button
              onKeyDown={this.keyDownHandler}
              onKeyUp={this.keyUpHandler}
              onFocus={e => this.onFocusHandler(e.target.innerText)}
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
          <div>{`${this.state.listening}`}</div>
        </div>
      </div>
    );
  }
}

const options = {
  autoStart: false
};

export default SpeechRecognition(options)(App);
