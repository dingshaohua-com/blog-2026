import { useEffect } from 'react';
import { Link } from 'react-router';
import { getAppInfo } from '@/api/endpoints/base';
import HelloWorld from '@/components/hello-world';

export default function Home() {
  useEffect(() => {
    getAppInfo().then((res) => {
      console.log(res);
    });
  }, []);

  return (
    <div className="home">
      <Link to="/about">
        <button>about</button>
      </Link>
      <div>
        <div>呵呵</div>
        <HelloWorld />
      </div>
    </div>
  );
}
