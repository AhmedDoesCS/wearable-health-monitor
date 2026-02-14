import React from 'react'
import data from './tableTest.json'
import { Button } from './components/ui/button'

function App() {
  return <>
    <div className='w-full h-[100vh] p-7'>

      <div className='w-full h-full p-7 border-cyan-600 border-2 rounded-4xl'>

        {/* Table header */}
        <div className='flex mb-10 justify-between items-center'>
          <h2 className='font-bold text-2xl'>Recent Activity</h2>
          <div className="flex items-center justify-between">
            <Button className={"mr-4 p-5 bg-cyan-700"}>
              <p>Sort</p>
            </Button>
            <Button className={"bg-cyan-700 p-5"}>
            </Button>
          </div>
        </div>

        <table className='table-auto w-full'>
          {/* Table columns */}
          <thead className=''>
            <tr className='w-full rounded-sm  bg-cyan-700/50 '>
              <th>Time</th>
              <th>Heart Rate</th>
              <th>Temperature</th>
              <th>Calories Burned</th>
            </tr>
          </thead>
          <tbody className='divide-y-2 w-full'>
            {
              data.map((content, i) => (
                <tr className='py-3 px-4 w-full flex justify-between'>
                  <td className='table-data'>
                    {
                      content["time"]
                    }
                  </td>
                  <td>
                    {
                      content["heart-rate"]
                    }
                  </td>
                  <td>
                    {
                      content["temperature"]
                    }
                  </td>
                  <td>
                    {
                      content["calories-burned"]
                    }
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>


        <div className=''>

        </div>

        {/* Table data */}
        <div className='divide-y-2'>

        </div>
      </div>
    </div>
  </>
}

export default App