
import ContractData from '../Constant/Contract';
import react, {Component, useEffect, useState} from 'react';
import Caver from 'caver-js';
import video from '../assets/videos/main.mp4'
import headerIcon from '../assets/img/headerIcon.png'
import './mint.css'

let walletaddr = ContractData.walletaddr;
if(process.env.REACT_APP_NETWORK == "baobab"){
  walletaddr = ContractData.addrBaobab;
}else if(process.env.REACT_APP_NETWORK == "mainnet"){
  walletaddr = ContractData.walletaddr;
}
const dABI = ContractData.dABI;


export default function Mint(props) {
    const [nftCount, setNftCount] = useState(0);
    const [account, setAccount] = useState("");
    const [minterAddress, setMinterAddress] = useState("");
    const [mintCnt, setMintCnt] = useState(0);
    const [walletConnection, setWalletConnection] = useState(false);
    let [mintAmount, setMintAmount] = useState(1);
    let caver = new Caver(window.klaytn);
    let contract = new caver.contract.create(dABI, walletaddr);
    let NFTPrice = process.env.REACT_APP_NFT_PRICE.toString();
    
    
  useEffect(async () => {
    let ret;
    const addr = process.env.REACT_APP_TREASURY_ACCOUNT;
    
    if(window.klaytn){
      // console.log(window.klaytn);
      const [address] = await window.klaytn.enable();      
      setWalletConnection(true);
      setAccount(address);
      setMinterAddress(addr);
      
      window.klaytn.on('accountsChanged', async (accounts) => {
        setAccount(window.klaytn.selectedAddress);
      })    
    }else{
      alert("현재 사용할 수 있는 클레이튼 지갑이 없습니다. 지갑을 설치하신 후 이용바랍니다.");
    }
  },[]); 
  
  useEffect(async () => {    
    if(account.length > 0){
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      console.log("count", mintCount);
      setMintCnt(mintCount);
    }
  },[minterAddress]);
  useEffect(async () => {    
    if(account.length > 0 && minterAddress.length > 0){
      let mintCount = await contract.methods.getMintedCount(minterAddress).call();
      setMintCnt(mintCount);
    }
    let ret;
  },[walletConnection]);

  const wait = async (ms) => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, ms);
  });
  }
  let connectWallet = async () => {
    if(!window.klaytn._kaikas.isEnabled()){
      let [address] = await window.klaytn.enable();
      setAccount(address);
      setWalletConnection(true);
    }
  }

  const mint = async (params) => {
    let tx;
      tx = await caver.klay.sendTransaction({
          type: 'SMART_CONTRACT_EXECUTION',
          from: account,
          to: walletaddr,
          value: caver.utils.toPeb((NFTPrice * params).toString(), 'KLAY'),
          data: contract.methods.mint(mintCnt, process.env.REACT_APP_TREASURY_ACCOUNT,params, account).encodeABI(),
          gas: '850000'
        }).then((res)=>{console.log(res);})
        .catch((err) => {alert("민트에 실패하였습니다.");});
        let mintCount = await contract.methods.getMintedCount(minterAddress).call();
        setMintCnt(mintCount);
      
        await wait(3000);
  
    
  }
  let amountHandler = (e,params) => {
    console.log(params)
    setMintAmount = params;
    mint(params)
  }
  
  return (
    <div>
        <div className='Header-Layout'>
          <span style={{float:'left',marginLeft:'3%'}}>
            <img src={headerIcon} style={{height:'80px'}}/>
          </span>
          <span style={{display: 'flex',marginRight:'3%',justifyContent:'right'}}>
            <button className='mint-btn' onClick={connectWallet}>
              {walletConnection ? (account) : "Wallet Connect"}
            </button>
          </span>
        </div>
        <div className='contentLayout'>
          <video muted={true} autoPlay={true} loop={true} controls={false} playsInline={true}>
            <source src={video} type="video/mp4"/>
          </video>
          <div className='mint-btn-wrapper'>
            <span>
              <button id='1' className='mint-btn' onClick={ (e)=>{ amountHandler(e,1)} }>1 NFT : {process.env.REACT_APP_NFT_PRICE} Klay</button>
            </span>
            <span>
              <button className='mint-btn' onClick={ (e)=>{ amountHandler(e,5)} }>5 NFT : {(process.env.REACT_APP_NFT_PRICE)*5} Klay</button>
            </span>
            <span>
              <button className='mint-btn' onClick={ (e)=>{ amountHandler(e,10)} }>10 NFT : {(process.env.REACT_APP_NFT_PRICE)*10} Klay</button>
            </span>
          </div>
        </div>
      <div className='footerLayout' style={{paddingBottom:'5%'}}>
        <span>
          <div style={{float:''}}>
            <div><font style={{color:'white'}}>Lefted NFT {process.env.REACT_APP_NFT_NUM - mintCnt}EA</font></div>
            <div><font style={{color:'white'}}>Price : {process.env.REACT_APP_NFT_PRICE} Klay</font></div>
          </div>
        </span>
        <span style={{float:'left'}}>
          <div><font style={{color:'white'}}>Copyright 2022. Klay Slash <p/>All pictures cannot be copied without permission. </font></div>
        </span>
        <span style={{float:'right'}}>
          <div><font style={{color:'white'}}>Please CHECK <p/>all details of mint and this website.</font></div>
        </span>
      </div>
    </div>
  );
}

