import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './routes';

function App() {
  console.log("App rendering"); // 添加日志
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
        theme="light"
      />
    </>
  );
}

export default App;