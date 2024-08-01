import React, { useEffect, useState } from 'react'
import {
  getHighBoostedPosts,
  getPostStatistics,
  getPostStatisticsPeriod,
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

export default function PostStatistics() {
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('days')
  const [filterLoading, setFLaoding] = useState(false)
  const [filterData, setFilterData] = useState({})
  const [stats, setData] = useState({
    totalPost: 0,
    removedPost: 0,
    reportedPost: 0,
    postAddedToBookshelf: 0,
  })
  useEffect(() => {
    if (filterData && stats) {
      setLoading(false)
    }
  }, [filterData, stats])
  useEffect(() => {
    const fetchPostStats = async () => {
      const response = await getPostStatistics()
      if (response) {
        setData(response)
      }
    }
    fetchPostStats()
  }, [])

  useEffect(() => {
    const fetchPeriodStatistics = async (filter) => {
      setFLaoding(true)
      const response = await getPostStatisticsPeriod(filter)

      if (response) {
        console.log(response)
        setFilterData(response)
        setFLaoding(false)
      }
    }
    fetchPeriodStatistics(filter)
  }, [filter])
  const postData = [
    { name: 'Total Post', value: stats.totalPost },
    { name: 'Removed Post', value: stats.removedPost },
    { name: 'Reported Post', value: stats.reportedPost },
    { name: 'Post added to bookshelf', value: stats.postAddedToBookshelf },
  ]

  const renderCustomLabel = () => {
    return (
      <text x={150} y={150} textAnchor="middle" dominantBaseline="middle">
        <tspan x="150" dy="-1.2em" fontSize="16" fill="#8884d8">
          Total Post
        </tspan>
        <tspan x="150" dy="1.2em" fontSize="24" fontWeight={600} fill="#8884d8">
          {stats.totalPost}
        </tspan>
      </text>
    )
  }
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
  }

  //users with high lendscore
  const [isHloading, setHloading] = useState(true)
  const [posts, setPost] = useState([])

  useEffect(() => {
    const fetchUserWithHighLendscore = async () => {
      setHloading(true)
      const response = await getHighBoostedPosts()
      console.log(response)
      if (response) {
        setPost(response.post)
        setHloading(false)
      } else {
        setHloading(false)
      }
    }

    fetchUserWithHighLendscore()
  }, [])
  console.log(filterData)
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
                    data={postData}
                    labelLine={false}
                    outerRadius={150}
                    innerRadius={120}
                    paddingAngle={5}
                    fill="#8884d8"
                    label={renderCustomLabel}
                    dataKey="value"
                  >
                    {postData.map((entry, index) => (
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
                      {stats.totalPost}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#0088FE] w-4 h-4"></div>
                      <div className="ms-3">Total post</div>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.removedPost}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#00C49F] w-4 h-4"></div>
                      <div className="ms-3">Removed post</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.reportedPost}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#FF8042] w-4 h-4"></div>
                      <div className="ms-3">Reported post</div>
                    </div>
                  </div>{' '}
                  <div className="mt-1">
                    <div className="font-semibold text-3xl">
                      {stats.postAddedToBookshelf}
                    </div>
                    <div className="flex items-center">
                      <div className="p-1 border bg-[#AA00FF] w-4 h-4"></div>
                      <div className="ms-3">Post Added to Bookshelf</div>
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
                            dataKey="posts"
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
            <div className=" flex h-[420px]  gap-6 p-2">
              <div className="border   px-6 py-3 justify-between shadow-lg rounded-lg w-[100%] flex">
                <div>
                  <div className="text-2xl font-semibold">Top posts</div>
                  <div
                    style={{ scrollbarWidth: 'thin' }}
                    className="overflow-auto h-[330px] w-[600px] px-4 pt-5"
                  >
                    {isHloading ? (
                      <div className=" h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8  border-t-2 border-b-2 border-[#512da8]"></div>
                      </div>
                    ) : posts.length > 0 ? (
                      posts.map((p, i) => {
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center mt-3"
                          >
                            <div className=" h-12 flex ">
                              <div className="w-12 flex  overflow-hidden justify-center items-center ">
                                <React.Suspense
                                  fallback={
                                    <div className="animate-spin rounded-full  border-t-2 border-b-2 border-[#512da8]"></div>
                                  }
                                >
                                  <ImageComponent
                                    className="rounded-full"
                                    src={p?.imageUrls[0].secure_url}
                                  ></ImageComponent>
                                </React.Suspense>
                              </div>
                              <div className="text-md ms-3">
                                <div className="font-semibold">{p?.ID}</div>
                                <div className="flex text-sm items-center">
                                  <div>
                                    <FontAwesomeIcon
                                      icon={faHeart}
                                      className="text-red-500 me-2"
                                    />
                                    {p?.likesCount} Likes
                                  </div>
                                  <div className="ms-3">
                                    <FontAwesomeIcon
                                      icon={faComment}
                                      className=" me-2"
                                    />
                                    {p?.commentsCount} Comments
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="text-2xl flex justify-between font-semibold me-2">
                                <FontAwesomeIcon
                                  icon={faPeopleArrows}
                                  className="me-3"
                                />
                                <div>{p?.totalEngagement}</div>
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
