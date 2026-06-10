import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AxiosInstance } from "axios";
import axios from "axios";
interface User{
    id:string;
    name:string;
    email:string;
    plan:string;
    analysisCount?: number;
}

interface AppContextType{
    user:User | null;
    token:string|null;
    loading: boolean;
    api:AxiosInstance;
    login:(name:string,email:string,password:string)=> Promise<{success:boolean,message:string}>
    register:(email:string,password:string)=> Promise<{success:boolean,message:string}>
    logout: ()=>void;
}


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";


const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider ({children}:{children:ReactNode}){
  const [user,setUser] = useState<User| null>(null);
  const [token,setToken] = useState<string| null>(localStorage.getItem("token"));
  const [loading,setLoading] = useState(true);
  
  const api = axios.create({baseURL:BACKEND_URL, });

  api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  })
    
const login  =async(email:string,password:string)=>{
try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`,{email,password});
    if(res.data.success){
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("token",res.data.token);
        return {success:true};
    }
     return {success:false,message:res.data.message};
} catch (error:any) {
   return {success:false,message:error.response?.data?.message||"Login Failes"}
    
}
}

const register =async(name:string,email:string,password:string)=>{
    try {
    const res = await axios.post(`${BACKEND_URL}/api/auth/login`,{name,email,password});
    if(res.data.success){
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem("token",res.data.token);
        return {success:true};
    }
     return {success:false,message:res.data.message};
} catch (error:any) {
   return {success:false,message:error.response?.data?.message||"Registration Failes"}
    
}
}
  
const logout =async()=>{
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
}
  
const loadUser=async()=>{
    if(!token) {setLoading(false); return; }
    try {
        const {data} = await api.get('/api/aut/user');
        if(data.success){ setUser(data.user)}
    } catch (error:any) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    }
    setLoading(false);
}
  
useEffect(() => {
  loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
   const value = {user,token,loading,api,login,register,logout}

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export function useApp(){
    const context = useContext(AppContext);
    if(!context) throw new Error("useApp must be within AppProvider")
        return context;
}