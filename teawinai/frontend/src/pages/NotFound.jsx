import { Link } from 'react-router-dom'
import { Home, MapPin } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <MapPin className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            ไม่พบหน้าที่คุณต้องการ
          </h2>
          <p className="text-gray-600 mb-8">
            ดูเหมือนว่าคุณจะหลงทางมา หน้าที่คุณกำลังมองหาไม่มีอยู่จริง
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary w-full inline-flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            กลับไปหน้าแรก
          </Link>
          
          <Link
            to="/places"
            className="btn btn-secondary w-full"
          >
            ดูสถานที่ท่องเที่ยว
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500">
            หากคุณคิดว่านี่คือข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </div>
    </div>
  )
}
