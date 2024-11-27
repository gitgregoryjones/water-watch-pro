import React from 'react';

function ResponsiveTable({location = {}}) {
  const data = [
    { years: 1, hour24: 3.14, hour1: 2.35 },
    { years: 2, hour24: 7.18, hour1: 4.56 },
    { years: 5, hour24: 12.63, hour1: 5.73 },
    { years: 10, hour24: 6.83, hour1: 2.97 },
    { years: 25, hour24: 15.29, hour1: 4.21 },
    { years: 50, hour24: 10.49, hour1: 3.89 },
    { years: 100, hour24: 14.88, hour1: 5.67 },
    { years: 200, hour24: 11.33, hour1: 4.12 },
    { years: 500, hour24: 4.33, hour1: 1.12 },
    { years: 1000, hour24: 7.33, hour1: 4.12 },
  ];

  if (!location.atlas14_threshold) {
    console.error("atlas14_threshold is undefined");
    return;
}


  if(Object.keys(location).length ==0)
    return;

  //let threshold = {'1h': [1.33, 1.52, 1.84, 2.12, 2.53, 2.86, 3.19, 3.55, 4.04, 4.43], '24h': [3.33, 3.76, 4.48, 5.09, 5.96, 6.64, 7.35, 8.07, 9.06, 9.83]};
  //console.log("atlas14_threshold:", location.atlas14_threshold);

  const threshold = location.atlas14_threshold;



 

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full max-h-80 overflow-y-auto table-auto border-collapse">
        <thead className="sticky top-0 bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left text-center">Avg Recurrence In Years</th>
            <th className="border px-4 py-2 text-left text-center">24 Hour Amount</th>
            <th className="border px-4 py-2 text-left text-center">1 Hour Amount</th>
          </tr>
        </thead>
        <tbody className="overflow-y-scroll h-[5rem] max-h-[5rem]">
          {data.map((row, index) => (
            
            <tr key={index} className="odd:bg-white even:bg-gray-50">
              <td className="border px-4 py-2">{row.years}</td>
             
              <td className="border px-4 py-2">{threshold['24h'] ? threshold['24h'][index] : "No Data"}</td>
              <td className="border px-4 py-2">{threshold['1h'] ? threshold['1h'][index] : "No Data"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ResponsiveTable;
