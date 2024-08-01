import React, { useEffect, useState } from 'react'
import {
  getHighLendScoreusers,
  getUserPeriodStats,
  getUserStats,
} from '../../../../../Service/Apiservice/AdminApi'
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  LineChart,
  CartesianGrid,
  YAxis,
  Line,
  XAxis,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF']
const ImageComponent = React.lazy(
  () => import('../../../../ImageComponent/Image')
)

export default function UserStatistics() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('days')
  const [filterLoading, setFLaoding] = useState(false)
  const [filterData, setFilterData] = useState([])
  const [stats, setData] = useState({
    totalUsers: 0,
    verified: 0,
    blockedUsers: 0,
    newUsers: 0,
    reportedUser: 0,
  })
  useEffect(() => {
    if (filterData && stats) {
      setLoading(false)
    }
  }, [filterData, stats])
  useEffect(() => {
    const fetchUserStats = async () => {
      const data = await getUserStats()

      if (data) {
        setData(data)
      }
    }
    fetchUserStats()
  }, [])

  useEffect(() => {
    const fetchPeriodStatistics = async (filter) => {
      setFLaoding(true)
      const response = await getUserPeriodStats(filter)
      if (response) {
        setFilterData(response)
        setFLaoding(false)
      }
    }
    fetchPeriodStatistics(filter)
  }, [filter])
  const userData = [
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Verified Users', value: stats.verified },
    { name: 'Blocked Users', value: stats.blockedUsers },
    { name: 'New Users', value: stats.newUsers },
    { name: 'Reported Users', value: stats.reportedUser },
  ]

  const renderCustomLabel = () => {
    return (
      <text x={150} y={150} textAnchor="middle" dominantBaseline="middle">
        <tspan x="150" dy="-1.2em" fontSize="16" fill="#8884d8">
          Total Users
        </tspan>
        <tspan x="150" dy="1.2em" fontSize="24" fontWeight={600} fill="#8884d8">
          {stats.totalUsers}
        </tspan>
      </text>
    )
  }
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  //users with high lendscore
  const [isHloading, setHloading] = useState(true)
  const [pageNo, setPageNo] = useState(1)
  const [users, setUsers] = useState([])
  const [hasMore, setHasmore] = useState(true)

  useEffect(() => {
    const fetchUserWithHighLendscore = async (pageNo) => {
      const response = await getHighLendScoreusers(pageNo)

      if (response) {
        if (pageNo === 1) {
          setUsers(response.users)
        } else {
          setUsers((prevUsers) => [...prevUsers, ...response.users])
        }
        setHasmore(response.hasMore)
        setHloading(false)
      } else {
        setHloading(false)
      }
    }

    fetchUserWithHighLendscore(pageNo)
  }, [pageNo])

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
                    data={userData}
                    labelLine={false}
                    outerRadius={150}
                    innerRadius={120}
                    paddingAngle={5}
                    fill="#8884d8"
                    label={renderCustomLabel}
                    dataKey="value"
                  >
                    {userData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <div className="  p-5 px-12">
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.totalUsers}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#0088FE] w-4 h-4"></div>
                      <div className="ms-3">Total users</div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.verified}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#00C49F] w-4 h-4"></div>
                      <div className="ms-3">Verified users</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.newUsers}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#FF8042] w-4 h-4"></div>
                      <div className="ms-3">New users</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.reportedUser}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#AA00FF] w-4 h-4"></div>
                      <div className="ms-3">Reported users</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.blockedUsers}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#FFBB28] w-4 h-4"></div>
                      <div className="ms-3">Blocked users</div>
                    </div>
                  </div>
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
                    ) : (
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
                            dataKey="users"
                            stroke="#8884d8"
                            fill="#8884d8"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex h-[420px]  gap-6 p-2">
              <div className="border   px-6 py-3 justify-between shadow-lg rounded-lg w-[100%] flex">
                <div>
                  <div className="text-2xl font-semibold">
                    Top users with high lendscore
                  </div>
                  <div
                    style={{ scrollbarWidth: 'thin' }}
                    className="overflow-auto border h-[330px] w-[600px] px-4 pt-5"
                  >
                    {isHloading ? (
                      <div className=" h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
                      </div>
                    ) : users.length > 0 ? (
                      users.map((u, i) => {
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center mt-3"
                          >
                            <div className=" h-12 flex ">
                              <div className="w-12 flex rounded-full overflow-hidden justify-center items-center ">
                                <React.Suspense
                                  fallback={
                                    <div className="animate-spin rounded-full  border-t-2 border-b-2 border-[#512da8]"></div>
                                  }
                                >
                                  <ImageComponent
                                    className="rounded-full"
                                    src={u?.profile.profileUrl}
                                  ></ImageComponent>
                                </React.Suspense>
                              </div>
                              <div className="text-md ms-3">
                                <div className="font-semibold">
                                  {u.userName}
                                </div>
                                <div className="">{u.name}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-2xl font-semibold me-2">
                                {u.lendscoreDetails.lendScore}
                              </div>
                              <div className="w-8 p-1 flex  overflow-hidden justify-center items-center ">
                                <React.Suspense
                                  fallback={
                                    <div className="animate-spin  border-t-2 border-b-2 border-[#512da8]"></div>
                                  }
                                >
                                  <ImageComponent
                                    className="rounded-full"
                                    src={u.badgeDetails.iconUrl.secureUrl}
                                  ></ImageComponent>
                                </React.Suspense>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="mt-2 ms-2 text-xl">
                        {' '}
                        no users with lendscore
                      </div>
                    )}
                    {hasMore && (
                      <div
                        className="cursor-pointer text-sm mt-4 flex justify-center"
                        onClick={() => setPageNo(pageNo + 1)}
                      >
                        Load More
                      </div>
                    )}
                  </div>

                  {}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
