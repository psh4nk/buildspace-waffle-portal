import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { 
  Program, Provider, web3
} from '@project-serum/anchor';

import idl from './idl.json';

import kp from './keypair.json'

// Reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Get keypair from keypair.json (generated using createKeyPair.js)
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Get program id form from idl.json
const programID = new PublicKey(idl.metadata.address);

// Set network to devnet
const network = clusterApiUrl('devnet');

// Transaction confirmed after processed
const opts = {
  preflightCommitment: "processed"
}

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
    if (inputValue.length === 0) {
      console.log("Empty, try again.")
      return
    }
    console.log('GIF link: ', inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF sent to program ", inputValue)

      await getGifList();
    } catch (error) {
      console.log("Error sending GIF: ", error)
    }
  };
  
  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startThingsOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount with address: ", baseAccount.publicKey.toString())
      await getGifList();
    } catch(error) {
      console.log("Error creating BaseAccount account: ", error)
    }
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

  const renderConnectedContainer = () => { 
    if (gifList === null) {
    // Program account has not been initialized
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            One-Time Init for GIF Program Account
          </button>
        </div>
      )
    }
    else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
          <input
            type="text"
            placeholder="paste gif link here"
            value={inputValue}
            onChange={onInputChange}  
          />
          <button type="submit" className="cta-button submit-gif-button">
            Submit
          </button>
          </form>
            <div className="gif-grid">
              {gifList.map((item, index) => (
                <div className="gif-item" key={index}>
                  <img src={item.gifLink} />
                  <b>Submitted by {item.userAddress.toString()}</b>
                </div> 
              ))}
            </div>
        </div>
      )
    }
  }

  // Check if Phantom wallet is connected 
  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkWalletConnected();
    });;
  }, []);

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Found account: ", account)
      setGifList(account.gifList)
    } catch (error) {
      console.log("Error in getGifs: ", error)
      setGifList(null);
    }
  }

  useEffect(() => {
    if(walletAddress) {
      console.log('fetching list of gifs...');
      getGifList()
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
