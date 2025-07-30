import Background from "@/assets/login2.png"
import Victory from "@/assets/Victory.svg"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabsContent } from "@radix-ui/react-tabs"
import { useState } from "react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client.js"
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants.js"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/stores"




const Auth = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const navigate = useNavigate()
    const {setUserInfo} = useAppStore()

    const validateSignup = () => {
        if(!email.length){
            toast.error("Email is required.")
            return false
        }
        if(!password.length){
            toast.error("Password is required.")
            return false
        }
        if(password !== confirmPassword){
            toast.error("Password and confirm password should be the same.")
            return false
        }
        return true
    }

    const validateLogin = () => {
        if(!email.length){
            toast.error("Email is required.")
            return false
        }
        if(!password.length){
            toast.error("Password is required.")
            return false
        }
        return true
    }

    const handleLogin = async () => {
        if(validateLogin){
            const res = await apiClient.post(LOGIN_ROUTE, {email, password}, {withCredentials: true})
            if(res.data.id){
                setUserInfo(res.data)
                if(res.data.profileSetup){
                    navigate("/chat")
                }else{
                    navigate("/profile")
                }
            }
           console.log(res)
        }
    }

    const handleSignup = async () => {
        if(validateSignup()){
           const res = await apiClient.post(SIGNUP_ROUTE, {email, password}, {withCredentials: true})
            if(res.status === 201){
                setUserInfo(res.data)
                navigate("/profile")
            }
           console.log(res)
        }
    }



    return(
        <div className="h-[100vh] w-[100vw] flex items-center justify-center">
            <div className="h-[90vh] bg-white border-white-2 text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70] xl:w-[90vw] rounded-3xl grid xl:grid-cols-2">
                <div className="flex flex-col gap-10 items-center justify-center">
                    <div className="flex items-center justify-center flex-col">
                        <div className="flex items-center justify-center">
                            <h1 className="text-5xl font-bold md:text-6xl" >Welcome</h1>
                            <img src={Victory} alt="Victory Emoji" className="h-[100px]"/>
                        </div>

                        <p className="font-medium text-center">Fill in the details to get started with the best chatapp</p>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <Tabs className="w-3/4" defaultValue="login">
                            <TabsList className="bg-transparent rounded-none w-full">
                                <TabsTrigger value="login"
                                className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                                >Login</TabsTrigger>
                                <TabsTrigger value="signup"
                                className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                                >Signup</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                                <Input 
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-6"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                 <Input 
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-6"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <Button className="rounded-full p-6" onClick={handleLogin}>Login</Button>
                            </TabsContent>
                            <TabsContent value="signup" className="flex flex-col gap-5">
                            <Input 
                                    placeholder="Email"
                                    type="email"
                                    className="rounded-full p-6"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                <Input 
                                    placeholder="Password"
                                    type="password"
                                    className="rounded-full p-6"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <Input 
                                    placeholder="Confirm Password"
                                    type="password"
                                    className="rounded-full p-6"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                 <Button className="rounded-full p-6" onClick={handleSignup}>Signup</Button>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                    <div className="hidden xl:flex justify-center items-center h-full">
                        <img src={Background} alt="Background Login" className="h-[500px] w-[550px]"/>
                    </div>
            </div>
        </div>
        )
}

export default Auth