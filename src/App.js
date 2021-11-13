import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { useEffect, useState } from 'react';

import './App.css';
import kp from './keypair.json'

import AwesomeSubmitButton from './components/AwesomeSubmitButton'
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import idl from './idl.json';
import MindReaderTextField from './components/MindReaderTextField';
import twitterLogo from './assets/twitter-logo.svg';


// Constants
// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
//let baseAccount = Keypair.generate();

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

// Set our network to devent.
const network = clusterApiUrl('devnet');

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
]

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);
  const [mindReadingGif, setMindReadingGif] = useState('init')

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );

          /*
           * Set the user's publicKey in state to be used later!
           */
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    if (mindReadingGif.length === 0) {
      console.log("No gif link given!")
      return
    }
    console.log('Gif link:', mindReadingGif);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
  
      await program.rpc.addGif(mindReadingGif, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("GIF successfully sent to program", mindReadingGif)
  
      await getGifList();
      setInputValue('')
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const ReadGifMind = async () => {
    let foundUrl = ''
    if (inputValue.length === 0) {
      return
    } else {
      console.log("ReadGifMind - Called")
      const response = await fetch(`https://api.giphy.com/v1/gifs/translate?api_key=50YVJEj4njpCtOZIPv2HcIKoRAWbuS0B&s=${inputValue}`,
        { mode: 'cors' });
      const responseObject = await response.json();
    
      foundUrl = responseObject.data.images.original.url;
      console.log("URL found: "+foundUrl)
    }
  
    if (foundUrl.length === 0 ) {
      return Promise.reject(new Error('I dont have that mood for you!'));
    } else {
      setMindReadingGif(foundUrl)
      return Promise.resolve(foundUrl);
    }
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
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const renderNotConnectedContainer = () => (
    <Button 
      className="cta-button connect-wallet-button" 
      onClick={connectWallet} 
      variant="contained">
      Connect to Solana Wallet
    </Button>
  );

  const renderConnectedContainer = () => {

    if (gifList === null) {
      return (
        <div className="connected-container">
          <Button 
            className="cta-button submit-gif-button" 
            onClick={createGifAccount} 
            variant="contained">
            Do One-Time Initialization For GIF Program Account
          </Button>
        </div>
      )
    } else {
      return (
        <div className="connected-container">
          <form
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
          {/*         <input type="text" placeholder="Enter gif link!" /> */}
            <MindReaderTextField
              className="mood-detector"
              id="filled-search"
              label="What are you thinking"
              type="search"
              variant="standard"
              color="secondary"
              value={inputValue}
              onChange={onInputChange}
            />
            <AwesomeSubmitButton 
              buttonText="Gif my mind!" 
              onClick={
                ReadGifMind
                }
            />
          </form>
          <div className="gif-grid">
            {/* Map through gifList instead of TEST_GIFS */}
            {gifList.map((item, index) => (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} />
                <Chip className="chip-user-address" label={item.userAddress.toString()} variant="outlined" />
              </div>
            ))}
          </div>
      </div>
      )
    }
  };

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setGifList(account.gifList)
  
    } catch (error) {
      console.log("Error in getGifs: ", error)
      setGifList(null);
    }
  }

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      // Call Solana program here.
  
      // Set state
      getGifList();
    }
  }, [walletAddress]);

  useEffect(() => {
    if (mindReadingGif.length > 0 && mindReadingGif !== 'init' ) {
      console.log('Fetching a valid GIF url...');
      console.log(mindReadingGif)
      sendGif()
    }
  }, [mindReadingGif]);


  return (
    <div className="App">
			{/* This was solely added for some styling fanciness */}
			<div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF My Mind - Mind Reading Portal</p>
          <p className="sub-text">
            View your mind reading GIF collection in the metaverse ✨
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {/* We just need to add the inverse here! */}
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