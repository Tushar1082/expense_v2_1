import logo from '../../../public/logo.png';

export default function Loader(){
    return(
        <div className="fixed z-2000 top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 bg-[#000000a6] h-[100vh] w-[100vw] flex items-center justify-center ">
            <div className="w-fit mb-16">
                <img src="./logo.png" alt="error" className="w-20 animate-ping" />
            </div>
        </div>
    );
}