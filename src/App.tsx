import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { AWSWAFCaptchaModal } from "./aws-waf-captcha";
import { Home } from './Home';

export default function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      <AWSWAFCaptchaModal/>
    </Router>
  )
}
