// import { GoogleLogin } from '@react-oauth/google';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// function LoginGoogle() {
//     const navigate = useNavigate();

//     const handleSuccess = async (credentialResponse) => {
//         console.log("Google credential response", credentialResponse); // Log thử
//         try {
//             const response = await axios.post('http://localhost:8080/api/v1/auth/google/success', {
//                 credential: credentialResponse.credential
//             });
//             localStorage.setItem('accessToken', response.data.accessToken);
//             navigate('/all-series');
//         } catch (error) {
//             console.error('Google login failed:', error);
//         }
//     };
    

//     return (
//         <div>
//             <h2>Login with Google</h2>
//             <GoogleLogin
//                 onSuccess={handleSuccess}
//                 onError={() => console.log('Login Failed')}
//             />
//         </div>
//     );
// }

// export default LoginGoogle;