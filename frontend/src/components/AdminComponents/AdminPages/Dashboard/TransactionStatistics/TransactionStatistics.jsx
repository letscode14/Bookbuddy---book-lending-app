import React, { useEffect, useState } from 'react'
import {
  getHighBoostedPosts,
  getPostStatistics,
  getPostStatisticsPeriod,
  getPTstats,
  getRstats,
  getTStats,
} from '../../../../../Service/Apiservice/AdminApi'
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  LineChart,
  CartesianGrid,
  YAxis,
  Line,
  XAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faComment,
  faHeart,
  faPeopleArrows,
} from '@fortawesome/free-solid-svg-icons'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/Image')
)

export default function TransactionStatistics() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('days')
  const [filterLoading, setFLaoding] = useState(false)
  const [filterData, setFilterData] = useState({})
  const [stats, setData] = useState({
    totalTransactions: 0,
    completedTransactions: 0,
    reportedTransactions: 0,
  })
  useEffect(() => {
    if (filterData && stats) {
      setLoading(false)
    }
  }, [filterData, stats])
  useEffect(() => {
    const fetchPostStats = async () => {
      const response = await getTStats()
      if (response) {
        setData(response)
      }
    }
    fetchPostStats()
  }, [])

  useEffect(() => {
    const fetchPeriodStatistics = async (filter) => {
      setFLaoding(true)
      const response = await getPTstats(filter)
      if (response) {
        setFilterData(response?.transactions)
        setFLaoding(false)
      }
    }
    fetchPeriodStatistics(filter)
  }, [filter])
  const trasactionData = [
    { name: 'Total transactions', value: stats.totalTransactions },
    { name: 'Completed transactions', value: stats.completedTransactions },
    { name: 'Reported transactions', value: stats.reportedTransactions },
  ]

  const renderCustomLabel = () => {
    return (
      <text x={150} y={150} textAnchor="middle" dominantBaseline="middle">
        <tspan x="150" dy="-1.2em" fontSize="16" fill="#8884d8">
          Total Transactions
        </tspan>
        <tspan x="150" dy="1.2em" fontSize="24" fontWeight={600} fill="#8884d8">
          {stats.totalTransactions}
        </tspan>
      </text>
    )
  }
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  //users with high lendscore
  const [isRloading, setRloading] = useState(true)
  const [request, setPost] = useState([])

  useEffect(() => {
    const fetchUserWithHighLendscore = async () => {
      setRloading(true)
      const response = await getRstats(filter)

      if (response) {
        setPost(response)
        setRloading(false)
      } else {
        setRloading(false)
      }
    }

    fetchUserWithHighLendscore()
  }, [filter])
  return (
    <>
      <div
        style={{ scrollbarWidth: 'none' }}
        className=" h-full overflow-y-auto mx-1 "
      >
        {loading ? (
          <>
            <div className=" h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
            </div>
          </>
        ) : (
          <>
            <div className=" flex h-[420px] gap-6 p-2">
              <div className="border px-6 items-center justify-between shadow-lg rounded-lg w-[35%] flex">
                <PieChart className="ms-2" width={300} height={300}>
                  <Pie
                    data={trasactionData}
                    labelLine={false}
                    outerRadius={150}
                    innerRadius={120}
                    paddingAngle={5}
                    fill="#8884d8"
                    label={renderCustomLabel}
                    dataKey="value"
                  >
                    {trasactionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <div className="  p-5 px-2">
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.totalTransactions}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#0088FE] w-4 h-4"></div>
                      <div className="ms-3">Total Transactions</div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.completedTransactions}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#00C49F] w-4 h-4"></div>
                      <div className="ms-3">Completed transactions</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.reportedTransactions}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#FF8042] w-4 h-4"></div>
                      <div className="ms-3">Reported transactions</div>
                    </div>
                  </div>{' '}
                </div>
              </div>

              <div className="border shadow-lg rounded-lg  w-[70%]">
                <div>
                  <div className="flex ms-3 mb-3  mt-3">
                    <button
                      className={`mx-2 py-1 px-4 rounded ${filter === 'days' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleFilterChange('days')}
                    >
                      Days
                    </button>
                    <button
                      className={`mx-2 py-1 px-4 rounded ${filter === 'months' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleFilterChange('months')}
                    >
                      Months
                    </button>
                    <button
                      className={`mx-2 py-1 px-4 rounded ${filter === 'years' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                      onClick={() => handleFilterChange('years')}
                    >
                      Years
                    </button>
                  </div>

                  <div style={{ height: '320px', width: '100%' }}>
                    {filterLoading ? (
                      <div className=" h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
                      </div>
                    ) : Object.keys(filterData).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={filterData}
                          margin={{
                            top: 10,
                            right: 30,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey={
                              filter === 'months'
                                ? 'month'
                                : filter == 'days'
                                  ? 'date'
                                  : 'year'
                            }
                            tick={{ fontSize: 12, fill: '#666' }}
                          />
                          <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="transactions"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center mt-3">No data found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex h-[480px]  p-2">
              <div className="border   px-6 py-3 justify-between shadow-lg rounded-lg w-full">
                <div className="text-2xl font-semibold">
                  Requests Statistics
                </div>

                <div className="flex pe-5 mt-6 justify-center items-center">
                  {isRloading ? (
                    <div className=" h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={request}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          tick={{ fontSize: 12, fill: '#666' }}
                          dataKey={
                            filter === 'months'
                              ? 'month'
                              : filter == 'days'
                                ? 'date'
                                : 'year'
                          }
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString()
                          }
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="requested"
                          stroke="#8884d8"
                        />
                        <Line
                          type="monotone"
                          dataKey="expired"
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="approved"
                          stroke="#ffc658"
                        />
                        <Line
                          type="monotone"
                          dataKey="transactionComplete"
                          stroke="#ff7300"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
