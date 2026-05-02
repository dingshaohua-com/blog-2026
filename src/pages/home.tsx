import { Link } from 'react-router';
import HelloWorld from '@/components/hello-world';
import { getAppInfo} from '@/api/endpoints/base';
import { useEffect } from 'react';

export default function Home() {

  useEffect(()=>{
    getAppInfo().then(res=>{
      console.log(res);
      
    })
  },[])

  return (
    <div className="home">
      <Link to="/about"><button>about</button></Link>
      <div>
        <div>呵呵</div>
        <HelloWorld />
      </div>
    </div>
  );
}