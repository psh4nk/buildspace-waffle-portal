import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const SOME_GIFS = [
  'https://media.giphy.com/media/xTiTnmpSR3TJR4SV5S/giphy.gif',
  'https://media.giphy.com/media/oXZc65uIcHifK/giphy.gif',
  'https://media.giphy.com/media/13NBiMh0Z7pqta/giphy.gif',
  'https://media.giphy.com/media/2IdlRNZZKFRD2/giphy.gif'
]


const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  
  // Check if Phantom wallet is found
  const checkWalletConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with public key:',
            response.publicKey.toString()
          );

          // Set user public key in state
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('No Solana object found :( You need Phantom wallet to use this app!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('connected with pub key ', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    if (inputValue.length > 0) {
      console.log('gif link: ', inputValue);
    } else {
      console.log('empty, try again');
    }
  }
  
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }


  // render ze button
  const renderNotConnectedContainer = () => ( 
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      connect wallet 
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
    <input
      type="text"
      placeholder="paste gif link here"
      value={inputValue}
      onChange={onInputChange}  
    />
    <button className="cta-button submit-gif-button" onClick={sendGif}>
      Submit
    </button>
      <div className="gif-grid">
        {gifList.map((gif) => (
          <div className="gif-item" key={gif}>
            <img src={gif} alt={gif} />
          </div> 
        ))}
      </div>
    </div>
  );

  // Check if Phantom wallet is connected 
  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkWalletConnected();
    });;
  }, []);

  useEffect(() => {
    if(walletAddress) {
      console.log('fetching list of gifs...');

      // solana program call goes here

      // set state
      setGifList(SOME_GIFS);
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">gm :)  welcome to the 🧇 portal</p>
          <p className="sub-text">
            ✨ a scrumptious collection of 🧇 gifs on solana ✨
          </p>
          {/* connect to wallet button */}
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
