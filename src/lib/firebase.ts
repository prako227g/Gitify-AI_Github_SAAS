// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA93WGHeLPE_wYTUqR0XSyU-gTx8VT2s8A",
  authDomain: "ai-github-6b0a0.firebaseapp.com",
  projectId: "ai-github-6b0a0",
  storageBucket: "ai-github-6b0a0.firebasestorage.app",
  messagingSenderId: "529563003543",
  appId: "1:529563003543:web:00224c3ea5e8f67be257d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage=getStorage(app);

export async function uploadFile(file:File,setProgress?:(progress:number)=>void){
    return new Promise((resolve,reject)=>{
        try {
            const storageRef=ref(storage,file.name)
            const uploadTask=uploadBytesResumable(storageRef,file)
            uploadTask.on('state_changed',snapshot=>{
                const progress=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100)
                if(setProgress) setProgress(progress)
                switch(snapshot.state){
                case "running":
                    console.log('upload is running'); break;
                case "paused":
                    console.log('upload is paused'); break;

    
                }
            },error=>{
                reject(error)
            },()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(downloadUrl=>{
                    resolve(downloadUrl as string )
                })
            })
            
        } catch (error) {
            
            console.error(error)
            reject(error)
        }
    })
}