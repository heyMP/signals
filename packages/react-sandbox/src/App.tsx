import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Signal } from '@heymp/signals';
import { useSignal } from '@heymp/signals/react';

const counter = new Signal.State(0);
const nextCount = new Signal.Computed(() => counter.value + 1, [counter]);
const doneCounting = new Signal.Computed(() => counter.value > 4, [counter]);

function App() {
  const [count] = useSignal(counter);
  const [next] = useSignal(nextCount);
  const [done] = useSignal(doneCounting);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
        <div className="card">
        {!done &&
          <button onClick={() => counter.value++}>
            count is {count}
          </button>
        }
        {!done &&
          <p>Your next count will be {next}</p>
        }
        {done &&
          <p>You've reached the max count of {count}</p>
        }
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
