import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

function App() {
  console.log("App rendering"); // 添加日志
  return (
    <RouterProvider router={router} />
  );
}

export default App;