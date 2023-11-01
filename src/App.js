import { useState, useEffect } from 'react';
import { Web3AuthMPCCoreKit, WEB3AUTH_NETWORK, Point, SubVerifierDetailsParams, TssShareType, keyToMnemonic, getWebBrowserFactor, COREKIT_STATUS, TssSecurityQuestion, generateFactorKey } from "@web3auth/mpc-core-kit";
import { WALLET_ADAPTERS } from "@web3auth/base";
import Web3 from "web3";

import './App.css';
import Card from './Components/Card/Card';
import Cart from './Components/Cart/Cart';

import "./App.css";
import { SafeEventEmitterProvider } from "@web3auth/base";
import { BN } from "bn.js";

const uiConsole = (...args) => {
  const el = document.querySelector("#console>p");
  if (el) {
    el.innerHTML = JSON.stringify(args || {}, null, 2);
  }
  console.log(...args);
};


const selectedNetwork = WEB3AUTH_NETWORK.MAINNET;

const coreKitInstance = new Web3AuthMPCCoreKit({
  web3AuthClientId: "BDnPNy5W8q-gXF85Gm9iv60uhM2YbwNpKx9OKEySTr17vjAubvmXCLYBHSlsFbLsZyBqcRByyAz-CV1llDIKGQ4",
  // Available networks are "sapphire_devnet", "sapphire_mainnet"
  web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
  uxMode: "popup",
});



const { getData } = require('./db/db');

const foods = getData();

const tele = window.Telegram.WebApp;


function App() {
  const [cartItems, setCartItems] = useState([]);

  const [backupFactorKey, setBackupFactorKey] = useState(undefined);
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(undefined);
  const [exportTssShareType, setExportTssShareType] = useState(TssShareType.DEVICE);
  const [factorPubToDelete, setFactorPubToDelete] = useState("");
  const [coreKitStatus, setCoreKitStatus] = useState(COREKIT_STATUS.NOT_INITIALIZED);
  const [answer, setAnswer] = useState(undefined);
  const [newAnswer, setNewAnswer] = useState(undefined);
  const [question, setQuestion] = useState(undefined);
  const [newQuestion, setNewQuestion] = useState(undefined);

  const securityQuestion = new TssSecurityQuestion();

  useEffect(() => {
    tele.ready();
  })

  // useEffect(() => {
  //   const initWeb3Auth = async () => {
  //     setCoreKitStatus(COREKIT_STATUS.INITIALIZING);
  //     try {
  //       const instance = new Web3AuthMPCCoreKit({
  //         web3AuthClientId: "BDnPNy5W8q-gXF85Gm9iv60uhM2YbwNpKx9OKEySTr17vjAubvmXCLYBHSlsFbLsZyBqcRByyAz-CV1llDIKGQ4",
  //         web3AuthNetwork: WEB3AUTH_NETWORK.DEVNET,
  //         uxMode: "popup",
  //       });

  //       // If initialization includes async methods, call them here and await.

  //       setCoreKitInstance(instance);
  //       setCoreKitStatus(COREKIT_STATUS.INITIALIZED);
  //     } catch (error) {
  //       console.error("Error initializing Web3AuthMPCCoreKit", error);
  //       setCoreKitStatus(COREKIT_STATUS.ERROR); // Set to error state on failure
  //     }
  //   };

  //   initWeb3Auth();
  // }, []);

  // if (coreKitStatus === COREKIT_STATUS.INITIALIZING || coreKitStatus === COREKIT_STATUS.NOT_INITIALIZED) {
  //   return <div>Loading...</div>; // Show loading state during initialization
  // }

  // if (coreKitStatus === COREKIT_STATUS.ERROR) {
  //   return <div>Error in initialization.</div>; // Show error message if initialization fails
  // }

  useEffect(() => {
    const init = async () => {
      await coreKitInstance.init();

      if (coreKitInstance.provider) {
        setProvider(coreKitInstance.provider);
      }

      setCoreKitStatus(coreKitInstance.status);

    };
    init();
  }, []);

  useEffect(() => {
    if (provider) {
      const web3 = new Web3(provider);
      setWeb3(web3);
    }
  }, [provider])

  const keyDetails = async () => {
    if (!coreKitInstance) {
      throw new Error('coreKitInstance not found');
    }
    uiConsole(coreKitInstance.getKeyDetails());
  };

  const listFactors = async () => {
    if (!coreKitInstance) {
      throw new Error('coreKitInstance not found');
    }
    const factorPubs = coreKitInstance.tKey.metadata.factorPubs;
    if (!factorPubs) {
      throw new Error('factorPubs not found');
    }
    const pubsHex = factorPubs[coreKitInstance.tKey.tssTag].map((pub) => {
      return Point.fromTkeyPoint(pub).toBufferSEC1(true).toString('hex');
    });
    uiConsole(pubsHex);
  };

  const login = async () => {
    try {
      if (!coreKitInstance) {
        throw new Error('initiated to login');
      }
      // const verifierConfig = {
      //   subVerifierDetails: {
      //     typeOfLogin: "google",
      //     verifier: "w3a-google-demo",
      //     clientId: "519228911939-cri01h55lsjbsia1k7ll6qpalrus75ps.apps.googleusercontent.com",
      //   },
      // };

      const verifierConfig = {
        subVerifierDetails: {
          typeOfLogin: "discord",
          verifier: "tg-payments-test",
          clientId: "1167255642713641041",
          redirectPathName: "https://fabulous-basbousa-32fa3f.netlify.app/"
          // jwtParams?: Auth0ClientOptions;
          // hash?: string;
          // queryParameters?: TorusGenericObject;
          // customState?: TorusGenericObject;
        }
      };

      await coreKitInstance.loginWithOauth(verifierConfig);


      try {
        let result;
        if (coreKitInstance != null) {  // This checks for both null and undefined
          result = securityQuestion.getQuestion(coreKitInstance);
        }
        setQuestion(result);
      } catch (e) {
        setQuestion(undefined);
        uiConsole(e);
      }


      if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
        uiConsole("required more shares, please enter your backup/ device factor key, or reset account unrecoverable once reset, please use it with caution]");
      }

      if (coreKitInstance.provider) {
        setProvider(coreKitInstance.provider);
      }

      setCoreKitStatus(coreKitInstance.status);

    } catch (error) {
      uiConsole(error);
    }
  }

  const getDeviceShare = async () => {
    const factorKey = await getWebBrowserFactor(coreKitInstance);
    setBackupFactorKey(factorKey);
    uiConsole("Device share: ", factorKey);
  }

  const inputBackupFactorKey = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }
    if (!backupFactorKey) {
      throw new Error("backupFactorKey not found");
    }
    const factorKey = new BN(backupFactorKey, "hex")
    await coreKitInstance.inputFactorKey(factorKey);

    if (coreKitInstance.status === COREKIT_STATUS.REQUIRED_SHARE) {
      uiConsole("required more shares even after inputing backup factor key, please enter your backup/ device factor key, or reset account [unrecoverable once reset, please use it with caution]");
    }

    if (coreKitInstance.provider) {
      setProvider(coreKitInstance.provider);
    }
  }

  const recoverSecurityQuestionFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }
    if (!answer) {
      throw new Error("backupFactorKey not found");
    }

    let factorKey = await securityQuestion.recoverFactor(coreKitInstance, answer);
    setBackupFactorKey(factorKey);
    uiConsole("Security Question share: ", factorKey);
  }

  const logout = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance not found");
    }
    await coreKitInstance.logout();
    uiConsole("Log out");
    setProvider(null);
  };

  const getUserInfo = () => {
    const user = coreKitInstance?.getUserInfo();
    uiConsole(user);
  };


  const onAdd = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist) {
      setCartItems(cartItems.map((x) =>
        x.id === food.id ? { ...exist, quantity: exist.quantity + 1 } : x
      ));
    } else {
      setCartItems([...cartItems, { ...food, quantity: 1 }]);
    }
  };

  const onRemove = (food) => {
    const exist = cartItems.find((x) => x.id === food.id);
    if (exist.quanity === 1) {
      setCartItems(cartItems.filter(x => x.id !== food.id))
    } else {
      setCartItems(
        cartItems.map((x) =>
          x.id === food.id ? { ...exist, quantity: exist.quantity - 1 } : x
        ));
    }
  }

  const exportFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    uiConsole("export share type: ", exportTssShareType);
    const factorKey = generateFactorKey();
    await coreKitInstance.createFactor({
      shareType: exportTssShareType,
      factorKey: factorKey.private
    });
    uiConsole("Export factor key: ", factorKey);
  }

  const deleteFactor = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    const pubBuffer = Buffer.from(factorPubToDelete, 'hex');
    const pub = Point.fromBufferSEC1(pubBuffer);
    await coreKitInstance.deleteFactor(pub.toTkeyPoint());
    uiConsole("factor deleted");
  }

  const getChainID = async () => {
    if (!web3) {
      uiConsole("web3 not initialized yet");
      return;
    }
    const chainId = await web3.eth.getChainId();
    uiConsole(chainId);
    return chainId;
  };

  const getAccounts = async () => {
    if (!web3) {
      uiConsole("web3 not initialized yet");
      return;
    }
    const address = (await web3.eth.getAccounts())[0];
    uiConsole(address);
    return address;
  };

  const getBalance = async () => {
    if (!web3) {
      uiConsole("web3 not initialized yet");
      return;
    }
    const address = (await web3.eth.getAccounts())[0];
    const balance = web3.utils.fromWei(
      await web3.eth.getBalance(address) // Balance is in wei
    );
    uiConsole(balance);
    return balance;
  };

  const signMessage = async () => {
    if (!web3) {
      uiConsole("web3 not initialized yet");
      return;
    }
    const fromAddress = (await web3.eth.getAccounts())[0];
    const originalMessage = [
      {
        type: "string",
        name: "fullName",
        value: "Satoshi Nakamoto",
      },
      {
        type: "uint32",
        name: "userId",
        value: "1212",
      },
    ];
    const params = [originalMessage, fromAddress];
    const method = "eth_signTypedData";
    const signedMessage = await (web3.currentProvider)?.sendAsync({
      id: 1,
      method,
      params,
      fromAddress,
    });
    uiConsole(signedMessage);
  };

  const criticalResetAccount = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    await coreKitInstance.tKey.storageLayer.setMetadata({
      privKey: new BN(coreKitInstance.metadataKey, "hex"),
      input: { message: "KEY_NOT_FOUND" },
    });
    uiConsole('reset');
    setProvider(null);
  }

  const sendTransaction = async () => {
    if (!web3) {
      uiConsole("web3 not initialized yet");
      return;
    }
    const fromAddress = (await web3.eth.getAccounts())[0];

    const destination = "0x2E464670992574A613f10F7682D5057fB507Cc21";
    const amount = web3.utils.toWei("0.0001"); // Convert 1 ether to wei

    // Submit transaction to the blockchain and wait for it to be mined
    uiConsole("Sending transaction...");
    const receipt = await web3.eth.sendTransaction({
      from: fromAddress,
      to: destination,
      value: amount,
    });
    uiConsole(receipt);
  };

  const createSecurityQuestion = async (question, answer) => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    await securityQuestion.setSecurityQuestion({ mpcCoreKit: coreKitInstance, question, answer, shareType: TssShareType.RECOVERY });
    setNewQuestion(undefined);
    let result = await securityQuestion.getQuestion(coreKitInstance);
    if (result) {
      setQuestion(question);
    }
  }

  const changeSecurityQuestion = async (newQuestion, newAnswer, answer) => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    await securityQuestion.changeSecurityQuestion({ mpcCoreKit: coreKitInstance, newQuestion, newAnswer, answer });
    let result = await securityQuestion.getQuestion(coreKitInstance);
    if (result) {
      setQuestion(question);
    }
  }

  const deleteSecurityQuestion = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    await securityQuestion.deleteSecurityQuestion(coreKitInstance);
    setQuestion(undefined);
  }

  const enableMFA = async () => {
    if (!coreKitInstance) {
      throw new Error("coreKitInstance is not set");
    }
    const factorKey = await coreKitInstance.enableMFA({});
    const factorKeyMnemonic = keyToMnemonic(factorKey);

    uiConsole("MFA enabled, device factor stored in local store, deleted hashed cloud key, your backup factor key: ", factorKeyMnemonic);
  }


  const onCheckout = () => {
    tele.MainButton.text = "Pay :)"
    tele.MainButton.show()
    // this is where is put our intent
  };

  const loggedInView = (
    <>
      <h2 className="subtitle">Account Details</h2>
      <div className="flex-container">
        <button onClick={getUserInfo} className="card">
          Get User Info
        </button>

        <button onClick={async () => uiConsole(await coreKitInstance.getTssPublicKey())} className="card">
          Get Public Key
        </button>

        <button onClick={keyDetails} className="card">
          Key Details
        </button>

        <button onClick={listFactors} className="card">
          List Factors
        </button>
      </div>
      <div className="flex-container">
        <button onClick={criticalResetAccount} className="card">
          [CRITICAL] Reset Account
        </button>

        <button onClick={async () => uiConsole(await coreKitInstance._UNSAFE_exportTssKey())} className="card">
          [CAUTION] Export TSS Private Key
        </button>

        <button onClick={logout} className="card">
          Log Out
        </button>
      </div>
      <h2 className="subtitle">Recovery/ Key Manipulation</h2>
      <div>
        <h4 >Enabling MFA</h4>
        <div className="flex-container">
          <button onClick={enableMFA} className="card">
            Enable MFA
          </button>
        </div>
        <h4 >Manual Factors Manipulation</h4>
        <div className="flex-container">
          <label>Share Type:</label>
          <select value={exportTssShareType} onChange={(e) => setExportTssShareType(parseInt(e.target.value))}>
            <option value={TssShareType.DEVICE}>Device Share</option>
            <option value={TssShareType.RECOVERY}>Recovery Share</option>
          </select>
          <button onClick={exportFactor} className="card">
            Export share
          </button>
        </div>
        <div className="flex-container">
          <label>Factor pub:</label>
          <input value={factorPubToDelete} onChange={(e) => setFactorPubToDelete(e.target.value)}></input>
          <button onClick={deleteFactor} className="card">
            Delete Factor
          </button>
        </div>
        <div className="flex-container">
          <input value={backupFactorKey} onChange={(e) => setBackupFactorKey(e.target.value)}></input>
          <button onClick={() => inputBackupFactorKey()} className="card">
            Input Factor Key
          </button>
        </div>

        <h4>Security Question</h4>

        <div>{question}</div>
        <div className="flex-container">
          <div className={question ? "disabledDiv" : ""}>
            <label>Set Security Question:</label>
            <input value={newQuestion} placeholder="question" onChange={(e) => setNewQuestion(e.target.value)}></input>
            <input value={answer} placeholder="answer" onChange={(e) => setAnswer(e.target.value)}></input>
            <button onClick={() => createSecurityQuestion(newQuestion, answer)} className="card">
              Create Security Question
            </button>
          </div>

          <div className={!question ? "disabledDiv" : ""}>
            <label>Change Security Question:</label>
            <input value={newQuestion} placeholder="newQuestion" onChange={(e) => setNewQuestion(e.target.value)}></input>
            <input value={newAnswer} placeholder="newAnswer" onChange={(e) => setNewAnswer(e.target.value)}></input>
            <input value={answer} placeholder="oldAnswer" onChange={(e) => setAnswer(e.target.value)}></input>
            <button onClick={() => changeSecurityQuestion(newQuestion, newAnswer, answer)} className="card">
              Change Security Question
            </button>
          </div>
        </div>
        <div className="flex-container">
          <div className={!question ? "disabledDiv" : ""}>
            <button onClick={() => deleteSecurityQuestion()} className="card">
              Delete Security Question
            </button>
          </div>
        </div>
      </div>
      <h2 className="subtitle">Blockchain Calls</h2>
      <div className="flex-container">
        <button onClick={getChainID} className="card">
          Get Chain ID
        </button>

        <button onClick={getAccounts} className="card">
          Get Accounts
        </button>

        <button onClick={getBalance} className="card">
          Get Balance
        </button>

        <button onClick={signMessage} className="card">
          Sign Message
        </button>

        <button onClick={sendTransaction} className="card">
          Send Transaction
        </button>
      </div>
    </>
  );

  const unloggedInView = (
    <>
      <button onClick={() => login()} className="card2">
        Login
      </button>
    </>
  );


  return (
    <>
      {/* <h1 className="heading">Order Food</h1>
      <Cart cartItems={cartItems} onCheckout={onCheckout} />
      <div className="cards__container">
        {foods.map((food) => {
          return <Card food={food} key={food.id} onAdd={onAdd} onRemove={onRemove} />;
        })}
      </div> */}


      <div className="container">

        <div className="grid">{provider ? loggedInView : unloggedInView}</div>
        <div id="console" style={{ whiteSpace: "pre-line" }}>
          <p style={{ whiteSpace: "pre-line" }}></p>
        </div>
      </div>


    </>
  );
}

export default App;
